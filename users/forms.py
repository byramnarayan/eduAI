from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import Profile

class UserRegisterForm(UserCreationForm):   # UserRegisterForm class inherits from UserCreationForm
    email = forms.EmailField()    # add email field to the form
    class Meta: # give nested name space for configurations in on place and give 
        model = User
        fields = ['username', 'email', 'password1', 'password2']    # fields to be displayed in the form

class UserUpdateForm(forms.ModelForm):
    email = forms.EmailField()

    class Meta:
        model = User
        fields = ['username', 'email']


class ProfileUpdateForm(forms.  ModelForm):
    class Meta:
        model = Profile
        fields = ['image','position', 'bio', 'insitute', 'hobbies', 'phone', 'location']