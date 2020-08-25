from rest_framework import serializers
from timesheets.models import Work


class TimesheetSerializer(serializers.Serializer):
    class Meta:
        model = Work
        fields = ['description', 'duration', 'workday']

    def create(self, validated_data):
        return Work.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.description = validated_data.get('description', instance.description)
        instance.duration = validated_data.get('duration', instance.duration)
        instance.workday = validated_data.get('workday', instance.workday)
        instance.save()
        return instance
