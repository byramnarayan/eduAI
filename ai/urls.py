from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='ai-home'),
    path('chat/<int:chat_id>/', views.view_chat, name='view-chat'),
]