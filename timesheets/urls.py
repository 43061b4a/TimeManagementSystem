from django.urls import path

from timesheets import views

urlpatterns = [
    path('timesheets/', views.WorkList.as_view()),
    path('timesheets/<int:pk>/', views.WorkDetail.as_view()),
]
