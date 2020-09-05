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
        self.registerUrl = reverse('user-register')
        self.response = self.client.post(self.registerUrl, test_user, format='json')
        self.registeredUser = User.objects.get()
        self.authUrl = reverse('api_token_auth')
        self.authData = self.client.post(self.authUrl, test_user, format='json')
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.authData.data['token'])
        self.user_detail_url = reverse('user-detail', kwargs={'pk': self.registeredUser.id})

    def test_can_get_user(self):
        response = self.client.get(self.user_detail_url)
        self.assertEqual(response.data['username'], test_user['username'])
        self.assertEqual(response.data['email'], test_user['email'])

    def test_can_update_user(self):
        new_user_name = "test_new_user_name"
        test_user['username'] = new_user_name
        response = self.client.put(self.user_detail_url, test_user, format='json')
        self.assertEqual(response.data['username'], new_user_name)

    def test_can_delete_user(self):
        del_response = self.client.delete(self.user_detail_url, test_user, format='json')
        self.assertEqual(del_response.status_code, 204)
        get_response = self.client.get(self.user_detail_url)
        self.assertEqual(get_response.status_code, 401)
