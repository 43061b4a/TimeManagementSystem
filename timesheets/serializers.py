from django.contrib.auth.models import User
from rest_framework import serializers

from timesheets.models import Work


class WorkSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Work
        fields = ['id', 'description', 'duration', 'workday', 'owner']


class UserSerializer(serializers.ModelSerializer):
    work = serializers.PrimaryKeyRelatedField(many=True, queryset=Work.objects.all())

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'work']
