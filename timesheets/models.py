from django.db import models
from django.contrib.auth import get_user_model


class Work(models.Model):
    employee = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='employee')
    manager = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='manager')
    description = models.TextField()
    duration = models.IntegerField()
    workday = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
