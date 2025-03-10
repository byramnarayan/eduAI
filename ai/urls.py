from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='ai-home'),
    path('delete-session/<int:session_id>/', views.delete_session, name='delete-session'),
]