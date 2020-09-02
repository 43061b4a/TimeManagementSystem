from django.contrib.auth.models import User
from django.http import Http404
from rest_framework import generics
from rest_framework import permissions
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.views import APIView

from timesheets.models import Work, Profile
from timesheets.serializers import WorkSerializer, UserSerializer, UserRootSerializer


def set_if_not_none(mapping, key, value):
    if value is not None:
        mapping[key] = value


class WorkList(generics.ListCreateAPIView):
    serializer_class = WorkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        current_user = User.objects.get(username=self.request.user)
        workday = self.request.GET.get('workday', None)
        startdate = self.request.GET.get('startdate', None)
        enddate = self.request.GET.get('enddate', None)
        username = self.request.GET.get('username', None)
        sort_key = self.request.GET.get('sort', None)

        filter_params = {}
        if current_user.is_superuser is False and current_user.is_staff is False:
            set_if_not_none(filter_params, 'owner', current_user)
        else:
            if username is not None:
                current_user = User.objects.get(username=username)
                set_if_not_none(filter_params, 'owner', current_user)

        set_if_not_none(filter_params, 'workday__gte', startdate)
        set_if_not_none(filter_params, 'workday__lte', enddate)
        set_if_not_none(filter_params, 'workday', workday)

        if sort_key:
            return Work.objects.filter(**filter_params).order_by(sort_key)
        else:
            return Work.objects.filter(**filter_params).order_by('-created_at')

    def perform_create(self, serializer):
        current_user = User.objects.get(username=self.request.user)
        if current_user.is_superuser or current_user.is_staff:
            given_user = self.request.GET.get('username', None)
            if given_user:
                current_user = User.objects.get(username=given_user)
            serializer.save(owner=current_user)
        else:
            serializer.save(owner=self.request.user)


class WorkDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        current_user = User.objects.get(username=self.request.user)
        work = Work.objects.get(**kwargs)
        if not work:
            return Response(data={'message': "Too late to delete"},
                            status=status.HTTP_400_BAD_REQUEST)
        if current_user.is_staff or current_user.is_superuser or work.owner == current_user:
            self.perform_destroy(work)
        else:
            return Response(data={'message': "You're not allowed to delete."},
                            status=status.HTTP_401_UNAUTHORIZED)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_queryset(self):
        current_user = User.objects.get(username=self.request.user)
        if current_user.is_superuser or current_user.is_staff:
            return Work.objects.all()
        else:
            return Work.objects.filter(owner=current_user)


class UserList(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        current_user = User.objects.get(username=self.request.user)
        if current_user.is_superuser or current_user.is_staff:
            users = User.objects.all()
        else:
            users = User.objects.filter(username=current_user.username)

        serializer = UserRootSerializer(users, many=True)
        return Response(serializer.data)


class UserDetail(APIView):
    permission_classes = [permissions.IsAuthenticated]
    """
    Retrieve, update or delete a snippet instance.
    """

    def get_object(self, pk):
        try:
            current_user = User.objects.get(username=self.request.user)
            if current_user.is_superuser or current_user.is_staff:
                return User.objects.get(pk=pk)
            else:
                return current_user
        except User.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        user = self.get_object(pk)
        serializer = UserRootSerializer(user)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        user = self.get_object(pk)

        if 'password' not in request.data or request.data['password'] is None:
            request.data['password'] = user.password

        current_user = User.objects.get(username=self.request.user)
        if not current_user.is_superuser:
            if 'is_staff' in request.data:
                del request.data['is_staff']

            if 'is_superuser' in request.data:
                del request.data['is_superuser']

        serializer = UserRootSerializer(user, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        user = self.get_object(pk)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserCreate(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class CustomAuthToken(ObtainAuthToken):

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        profile, created = Profile.objects.get_or_create(owner=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'preferred_working_hours': profile.preferred_working_hours
        })


@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'users': reverse('user-list', request=request, format=format),
        'register': reverse('user-register', request=request, format=format),
        'work': reverse('work-list', request=request, format=format),
    })
