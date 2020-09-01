from django.contrib.auth.models import User
from rest_framework import serializers

from timesheets.models import Profile
from timesheets.models import Work


class WorkSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Work
        fields = ['id', 'description', 'duration', 'workday', 'owner']


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['preferred_working_hours']


class UserRootSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_superuser', 'password', 'profile']
        extra_kwargs = {'password': {'write_only': True}}

    def update(self, instance, validated_data):
        if instance.is_superuser:
            instance.is_staff = validated_data.pop('is_staff')
            instance.is_superuser = validated_data.pop('is_superuser')

        instance.username = validated_data.pop('username')
        instance.email = validated_data.pop('email')
        instance.set_password(validated_data.pop('password'))
        instance.save()

        if 'profile' in validated_data and validated_data['profile']['preferred_working_hours'] > 0:
            instance.profile, created = Profile.objects.get_or_create(owner=instance)
            instance.profile.preferred_working_hours = int(validated_data['profile']['preferred_working_hours'])
            instance.profile.save()
        return instance


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'profile']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        if 'profile' in validated_data and validated_data['profile']['preferred_working_hours'] > 0:
            validated_data['profile'] = Profile(
                preferred_working_hours=int(validated_data['profile']['preferred_working_hours']))
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        user.profile.save()
        return user
