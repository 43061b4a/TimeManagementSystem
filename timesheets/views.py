from rest_framework import generics
from rest_framework import permissions
from rest_framework.authentication import SessionAuthentication, BasicAuthentication

from timesheets.models import Work
from timesheets.serializers import TimesheetSerializer


class TimesheetListAPIView(generics.ListCreateAPIView):
    queryset = Work.objects.all()
    serializer_class = TimesheetSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(employee=self.request.user)
        serializer.save(manager=self.request.user)
