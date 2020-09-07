## Some Useful commands:

```
django-admin startapp timesheets # To start a new skeleton app

python manage.py shell  
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from timesheets.models import Work
from timesheets.serializers import TimesheetSerializer

work = Work(description="Apple", duration=1,workday="2020-10-1")
work.save()
work = Work(description="Cat", duration=2,workday="2020-10-1")
work.save()
seri = TimesheetSerializer(work)__
seri.data

from django.contrib.auth import get_user_model
from pprint import pprint

User = get_user_model()
user=User.objects.create(username="myname",password="apple")
pprint(user)
user = User.objects.get(username="myname")
pprint(user)
user.is_staff = True
user.is_admin = True
user.is_superuser = True
user.save()

user.is_staff = False
user.is_admin = False
user.is_superuser = False
user.save()
```