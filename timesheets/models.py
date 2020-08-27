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


class Profile(models.Model):
    owner = models.OneToOneField('auth.User', on_delete=models.CASCADE, related_name='profile')
    preferred_working_hours = models.IntegerField(default=8)

    def __unicode__(self):
        return u'Preferred working hours: {0}'.format(self.preferred_working_hours)
