from django.shortcuts import render
from django.http import HttpResponse
from .models import doubt # model is in same directory so we use .models to import the model and import the post class
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin # here we can't use @loginrequired decoratoe on the class for that i will need to import mixin
from django.contrib.auth.decorators import login_required  
# +++++++++++++
# Time to create list based views for the user 
from django.views.generic import ListView,DetailView,CreateView, UpdateView, DeleteView
from django.urls import reverse
# Create your views here.

@login_required # <login_required> decorator to protect the profile page.
def communityHome(request):
    context = {
        'doubts': doubt.objects.all() # This will get all the doubts from the database
    }
    return render(request, 'community/communityHome.html',context)   

# create ListView -> app/urls.py -.
class DoubtsListView(ListView): # inherit from ListView 
    model = doubt #model query in order to tell which model to crete the list 
    template_name = 'community/communityHome.html'# <app>/<model>_<viewtype>.html
    # with this change in place this isn't going to
    # work for us just yet because it doesn't know what we want the variable to be named in our template
    # that we're going to be looping over so for example if we look up here in our home view function we called all of our
    # post objects post in our context but by default our list view is going to call
    # that variable object list instead of post so we can either go into our
    # template and change it so that it's looping over object list or we can set
    # one more variable in our list view and let the class know that we want that variable to be called post instead so
    # since we already have the template created let's just go ahead and set this variable here within our list view so to
    context_object_name = 'doubts'
    ordering=['-date'] # to see in order to see new to oldest we have added -ve Note: keep it in model name 




class DoubtsDetailView(DetailView): # inherit from ListView 
    model = doubt


class DoubtsCreateView(LoginRequiredMixin, CreateView): # inherit from ListView 
    model = doubt
    fields = ['title','content']

    def form_valid(self, form): # To add the from with user to tackel Integrety ERROR   
        form.instance.author = self.request.user
        return super().form_valid(form)
    

class DoubtsUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView): # UserPassesTestMixin only author can update the page  
    model = doubt
    fields = ['title','content']

    def form_valid(self, form): # To add the from with user to tackel Integrety ERROR   
        form.instance.author = self.request.user
        return super().form_valid(form)
    
    def test_func(self):
        doubt = self.get_object() # to get that post we want to update 
        if self.request.user == doubt.author:
            return True
        return False
    

class DoubtDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = doubt
    success_url = '/'

    def test_func(self):
        post = self.get_object()
        if self.request.user == post.author:
            return True
        return False
# Add to your views.py file
from django.shortcuts import redirect, get_object_or_404
from .models import Comment

class CommentCreateView(LoginRequiredMixin, CreateView):
    model = Comment
    fields = ['content']
    template_name = 'community/comment_form.html'
    
    def form_valid(self, form):
        form.instance.author = self.request.user
        form.instance.doubt = get_object_or_404(doubt, pk=self.kwargs.get('pk'))
        return super().form_valid(form)
    
    def get_success_url(self):
        return reverse('doubt-detail', kwargs={'pk': self.kwargs.get('pk')})
    
    # Add this method to provide the doubt object to the template
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['doubt'] = get_object_or_404(doubt, pk=self.kwargs.get('pk'))
        return context
class CommentDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Comment
    template_name = 'community/comment_confirm_delete.html'
    
    def test_func(self):
        comment = self.get_object()
        return self.request.user == comment.author
    
    def get_success_url(self):
        return reverse('doubt-detail', kwargs={'pk': self.object.doubt.pk})