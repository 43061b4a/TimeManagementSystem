from rest_framework import serializers

from timesheets.models import Work


class WorkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Work
        fields = ['id', 'description', 'duration', 'workday']
