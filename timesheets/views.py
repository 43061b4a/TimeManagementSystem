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

from timesheets.models import Work
from timesheets.serializers import WorkSerializer, UserSerializer, UserRootSerializer


class WorkList(generics.ListCreateAPIView):
    serializer_class = WorkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        current_user = User.objects.get(username=self.request.user)
        if current_user.is_superuser or current_user.is_staff:
            return Work.objects.all()
        else:
            return Work.objects.filter(owner=current_user)

    def perform_create(self, serializer):
        current_user = User.objects.get(username=self.request.user)
        if current_user.is_superuser or current_user.is_staff:
            serializer.save()
        else:
            serializer.save(owner=self.request.user)


class WorkDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkSerializer
    permission_classes = [permissions.IsAuthenticated]

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
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_staff,
        })


@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'users': reverse('user-list', request=request, format=format),
        'register': reverse('user-register', request=request, format=format),
        'work': reverse('work-list', request=request, format=format),
    })
