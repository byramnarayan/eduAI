from django.contrib import admin
from django.urls import path, include 
from . import views
from .views import NotesListView,NoteDetailView
from .views import NoteCreateView

urlpatterns = [
    path('', NotesListView.as_view(), name='note-home'),
    path('note/<int:pk>/', NoteDetailView.as_view(), name='note-detail'),
    path('note/new/', views.create_note, name='note-create'),  # Add this
]
