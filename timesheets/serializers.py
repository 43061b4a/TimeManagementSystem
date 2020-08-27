from django.contrib.auth.models import User
from rest_framework import serializers

from timesheets.models import Work


class WorkSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Work
        fields = ['id', 'description', 'duration', 'workday', 'owner']


class UserRootSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_superuser', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def update(self, instance, validated_data):
        # instance = User(**validated_data)
        instance.username = validated_data.pop('username')
        instance.is_staff = validated_data.pop('is_staff')
        instance.email = validated_data.pop('email')
        instance.is_superuser = validated_data.pop('is_superuser')
        instance.set_password(validated_data.pop('password'))
        instance.save()
        return instance


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
