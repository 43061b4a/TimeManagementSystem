from django.db import models


class Work(models.Model):
    owner = models.ForeignKey('auth.User', related_name='work', on_delete=models.CASCADE)
    description = models.TextField()
    duration = models.IntegerField()
    workday = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
