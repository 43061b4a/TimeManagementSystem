
![Homepage](https://i.imgur.com/kbmMTwY.png)

## About

Timesheet management app based on `Django`, `Django-REST Framework` and `VueJs`. This project is developed in response to Toptal's screening process.

## Application Init

### Delete Exiting Database, Migrations and make new Migrations
```
rm -f db.sqlite3
rm -r timesheets/migrations
python manage.py makemigrations timesheets
python manage.py migrate
```
### Setup Users
```
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('superadmin', 'superadmin@myproject.com', 'password123')" | python manage.py shell
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_user('admin', 'admin@myproject.com', 'password123',is_staff=True)" | python manage.py shell
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_user('user', 'user@myproject.com', 'password123')" | python manage.py shell
```
### Setup Initial Data 
```
python manage.py loaddata ./timesheets/fixtures/initial_data.json
```
### Start Application
Assuming all the required packages are installed. 
```
python manage.py runserver
```
### Running Tests with Coverage
```
coverage run --source=timesheets ./manage.py test ; coverage report  
```

### Deploy to Google Cloud
```
gcloud app deploy --project [YOUR_PROJECT_ID] (eg: gcloud app deploy --project hakaishiner)

```

### Live App
(With readonly database) 
```
https://hakaishiner.uc.r.appspot.com/
Logins:

Regular User:
Username: user
Password: password123

User Manager:
Username: admin
Password: password123

System Admin:
Username: superuser
Password: password123
```

### Application logs
```
gcloud app logs tail -s default --project hakaishiner
```

### Test Coverage
```
Name                                    Stmts   Miss  Cover
-----------------------------------------------------------
timesheets/__init__.py                      0      0   100%
timesheets/apps.py                          3      0   100%
timesheets/migrations/0001_initial.py       7      0   100%
timesheets/migrations/__init__.py           0      0   100%
timesheets/models.py                       15      1    93%
timesheets/serializers.py                  47      2    96%
timesheets/tests.py                       135      0   100%
timesheets/urls.py                          3      0   100%
timesheets/utils.py                         3      0   100%
timesheets/views.py                       133     23    83%
-----------------------------------------------------------
TOTAL                                     346     26    92%

```