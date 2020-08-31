"""TimeManagementSystem URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.urls import include, path
from django.views.generic import RedirectView, TemplateView
from rest_framework import routers

from timesheets.views import CustomAuthToken

router = routers.DefaultRouter()
favicon_view = RedirectView.as_view(url='/static/images/favicon.ico', permanent=True)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('api/', include('timesheets.urls')),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^favicon\.ico$', favicon_view),
    url(r'api/api-token-auth/', CustomAuthToken.as_view(), name='api_token_auth'),
    url(r'^.*$', TemplateView.as_view(template_name="index.html")),
]
