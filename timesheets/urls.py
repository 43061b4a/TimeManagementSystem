from django.urls import path

from timesheets import views

urlpatterns = [
    path('', views.api_root),
    path('timesheets/', views.WorkList.as_view(), name='work-list'),
    path('timesheets/<int:pk>/', views.WorkDetail.as_view(), name='work-detail'),
    path('users/', views.UserList.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetail.as_view(), name='user-detail'),
    path('register/', views.UserCreate.as_view(), name='user-register'),
]
