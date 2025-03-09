from django.urls import path
from . import views # Import the views module from the current base app.


urlpatterns = [
    path('', views.home, name='base-home'), # home Step 02. path(''<leave emtpy becaus wanted to be home page>, views.home<view wanted that handel logic at that home page route i.e. wanted to be home view route>, name='home'<name of the route for easy access in the future>),
    path('about/', views.about, name='base-about'), # about Step 02. path('about/'<goes to about page>, views.about<view wanted that handel logic at that about page route i.e. wanted to be about view route>, name='about'<name of the route for easy access in the future>),
]