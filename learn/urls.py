from django.urls import path
from . import views # Import the views module from the current base app.


urlpatterns = [
    path('', views.home, name='learn-home'), 
]