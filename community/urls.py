from django.contrib import admin
from django.urls import path, include 
from . import views
from .views import DoubtsListView,DoubtsDetailView,DoubtsCreateView,DoubtsUpdateView,DoubtDeleteView

# At top frist import view for classed based view 
urlpatterns = [
    path('', DoubtsListView.as_view(), name='Community-Home'),# con't import directly need to add function .as_view() 
    # get error TemplateDoesNot Exist
    # class Based view go like this <app>/<model>_<viewtype>.html
    # i.e. in our case community/doubt_list.html to change this go to app/views.py
    path('doubt/<int:pk>/', DoubtsDetailView.as_view(), name='doubt-detail'),
    path('doubt/<int:pk>/update/', DoubtsUpdateView.as_view(), name='doubt-update'),
    path('doubt/<int:pk>/delete/', DoubtDeleteView.as_view(), name='doubt-delete'),
    path('doubt/new/', DoubtsCreateView.as_view(), name='doubt-create'),

]