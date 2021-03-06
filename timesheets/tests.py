from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

test_user = {"username": "john_testing",
             "email": "cat@gmail.com",
             "password": "hello",
             "profile": {"preferred_working_hours": 100}}


class AccountCreationTests(APITestCase):
    def test_create_account(self):
        """
        Ensure we can create a new account object.
        """
        url = reverse('user-register')

        response = self.client.post(url, test_user, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().username, 'john_testing')


class AccountManageTests(APITestCase):
    def setUp(self) -> None:
        self.response = self.client.post(reverse('user-register'), test_user, format='json')

        self.authData = self.client.post(reverse('api_token_auth'), test_user, format='json')
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.authData.data['token'])

        self.user_detail_url = reverse('user-detail', kwargs={'pk': self.authData.data['user_id']})

    def test_user_can_get_user(self):
        response = self.client.get(self.user_detail_url)
        self.assertEqual(response.data['username'], test_user['username'])
        self.assertEqual(response.data['email'], test_user['email'])

    def test_user_can_update_user(self):
        new_user_name = "test_new_user_name"
        test_user['username'] = new_user_name

        response = self.client.put(self.user_detail_url, test_user, format='json')

        self.assertEqual(response.data['username'], new_user_name)

    def test_user_can_delete_user(self):
        del_response = self.client.delete(self.user_detail_url, test_user, format='json')
        self.assertEqual(del_response.status_code, 204)

        get_response = self.client.get(self.user_detail_url)
        self.assertEqual(get_response.status_code, 401)

    def test_user_can_update_user_password(self):
        new_user_password = "test_new_user_password"
        test_user['password'] = new_user_password

        response = self.client.put(self.user_detail_url, test_user, format='json')
        self.assertEqual(response.status_code, 200)

        auth_token_response = self.client.post(reverse('api_token_auth'),
                                               {'username': test_user['username'], 'password': new_user_password},
                                               format='json')
        self.assertEqual(auth_token_response.status_code, 200)
        self.assertEqual(auth_token_response.data['username'], test_user['username'])


class TimesheetManageTests(APITestCase):
    def setUp(self) -> None:
        self.response = self.client.post(reverse('user-register'), test_user, format='json')

        self.authData = self.client.post(reverse('api_token_auth'), test_user, format='json')
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.authData.data['token'])

        self.work_resource_url = reverse('work-list')

    def test_user_can_log_time(self):
        work_log = {"description": "installing software", "duration": 10, "workday": "2020-09-03"}

        response = self.client.post(self.work_resource_url, work_log, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['id'], 1)

    def test_user_can_get_logged_time(self):
        work_log = {"description": "installing software", "duration": 10, "workday": "2020-09-03"}
        response = self.client.post(self.work_resource_url, work_log, format='json')
        self.assertEqual(response.status_code, 201)

        response = self.client.get(reverse('work-detail', kwargs={'pk': response.data['id']}))

        self.assertEqual(response.data['description'], work_log['description'])

    def test_user_can_get_multiple_logged_times(self):
        work_log = {"description": "installing software1", "duration": 10, "workday": "2020-09-03"}
        response = self.client.post(self.work_resource_url, work_log, format='json')
        self.assertEqual(response.status_code, 201)

        work_log = {"description": "installing software2", "duration": 10, "workday": "2020-09-03"}
        response = self.client.post(self.work_resource_url, work_log, format='json')
        self.assertEqual(response.status_code, 201)

        response = self.client.get(self.work_resource_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_user_can_log_and_delete_time(self):
        work_log = {"description": "installing software", "duration": 10, "workday": "2020-09-03"}

        response_create = self.client.post(self.work_resource_url, work_log, format='json')
        self.assertEqual(response_create.status_code, 201)

        response_del = self.client.delete(reverse('work-detail', kwargs={'pk': response_create.data['id']}))
        self.assertEqual(response_del.status_code, 204)

        response_get = self.client.get(reverse('work-detail', kwargs={'pk': response_create.data['id']}))
        self.assertEqual(response_get.status_code, 404)


class AccountPermissionsTests(APITestCase):
    def setUp(self) -> None:
        self.superadmin = {'username': 'superadmin', 'password': 'password123', 'id': None,
                           'work': {"description": "superadmin work", "duration": 10, "workday": "2020-07-30",
                                    "id": None}}
        self.admin = {'username': 'admin', 'password': 'password123', 'id': None,
                      'work': {"description": "admin work", "duration": 10, "workday": "2020-07-30", "id": None}}
        self.user = {'username': 'user', 'password': 'password123', 'id': None,
                     'work': {"description": "user work", "duration": 10, "workday": "2020-07-30", "id": None}}

        self.superadmin['id'] = User.objects.create_superuser(self.superadmin['username'], 'superadmin@myproject.com',
                                                              self.superadmin['password']).id
        self.admin['id'] = User.objects.create_user(self.admin['username'], 'admin@myproject.com',
                                                    self.admin['password'], is_staff=True).id
        self.user['id'] = User.objects.create_user(self.user['username'], 'user@myproject.com',
                                                   self.user['password']).id

        self.superadmin_auth_token = 'Token ' + (self.client.post(reverse('api_token_auth'),
                                                                  self.superadmin, format='json')).data['token']
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=self.superadmin_auth_token)
        self.superadmin['work']['id'] = \
            self.client.post(reverse('work-list'), self.superadmin['work'], format='json').data['id']

        self.admin_auth_token = 'Token ' + (self.client.post(reverse('api_token_auth'),
                                                             self.admin, format='json')).data['token']
        self.client.credentials(HTTP_AUTHORIZATION=self.admin_auth_token)
        self.admin['work']['id'] = self.client.post(reverse('work-list'), self.admin['work'], format='json').data['id']

        self.user_auth_token = 'Token ' + (self.client.post(reverse('api_token_auth'),
                                                            self.user, format='json')).data['token']
        self.client.credentials(HTTP_AUTHORIZATION=self.user_auth_token)
        self.user['work']['id'] = self.client.post(reverse('work-list'), self.user['work'], format='json').data['id']

    def test_user_cannot_get_admin_work(self):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=self.user_auth_token)
        response = client.get(reverse('work-detail', kwargs={'pk': self.superadmin['work']['id']}))
        self.assertEqual(response.status_code, 404)

    def test_admin_cannot_get_superuser_work(self):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=self.admin_auth_token)
        response = client.get(reverse('work-detail', kwargs={'pk': self.superadmin['work']['id']}))
        self.assertEqual(response.status_code, 404)

    def test_superadmin_can_get_admin_work(self):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=self.superadmin_auth_token)
        response = client.get(reverse('work-detail', kwargs={'pk': self.admin['work']['id']}))
        self.assertEqual(response.status_code, 200)

    def test_superadmin_can_get_user_work(self):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=self.superadmin_auth_token)
        response = client.get(reverse('work-detail', kwargs={'pk': self.user['work']['id']}))
        self.assertEqual(response.status_code, 200)

    def test_user_cannot_delete_admin_work(self):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=self.user_auth_token)
        response = client.delete(reverse('work-detail', kwargs={'pk': self.superadmin['work']['id']}))
        self.assertEqual(response.status_code, 401)

    def test_admin_cannot_delete_superuser_work(self):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=self.admin_auth_token)
        response = client.delete(reverse('work-detail', kwargs={'pk': self.superadmin['work']['id']}))
        self.assertEqual(response.status_code, 401)

    def test_superadmin_can_delete_admin_work(self):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=self.superadmin_auth_token)
        response = client.delete(reverse('work-detail', kwargs={'pk': self.admin['work']['id']}))
        self.assertEqual(response.status_code, 204)

    def test_superadmin_can_delete_user_work(self):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=self.superadmin_auth_token)
        response = client.delete(reverse('work-detail', kwargs={'pk': self.user['work']['id']}))
        self.assertEqual(response.status_code, 204)
