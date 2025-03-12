from django.contrib import admin
from django.urls import path, include 
from . import views
from .views import NotesListView, NoteDetailView, NoteCreateView, NoteDeleteView

urlpatterns = [
    path('', NotesListView.as_view(), name='note-home'),
    path('note/<int:pk>/', NoteDetailView.as_view(), name='note-detail'),
    path('note/new/', views.create_note, name='note-create'),
    path('note/<int:pk>/delete/', NoteDeleteView.as_view(), name='note-delete'),
]