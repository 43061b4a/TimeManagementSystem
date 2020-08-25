
# Time Management System

## Application Initialization
```
rm -f db.sqlite3
rm -r timesheets/migrations
rm -r users/migrations
python manage.py makemigrations timesheets
python manage.py makemigrations users
python manage.py migrate
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('superadmin', 'superadmin@myproject.com', 'password123')" | python manage.py shell
python manage.py runserver
```

## Useful commands:
```
django-admin startapp timesheets
curl -H 'Accept: application/json; indent=4' -u admin:dimsumdim123 http://127.0.0.1:8000/users/

from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from timesheets.models import Work
from timesheets.serializers import TimesheetSerializer

work = Work(description="Apple", duration=1,workday="2020-10-1")
work.save()
work = Work(description="Cat", duration=2,workday="2020-10-1")
work.save()
seri = TimesheetSerializer(work)
seri.data
```