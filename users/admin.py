from django.contrib import admin

# Register your models here.
from .models import Profile

admin.site.register(Profile) # Registering Profile model to admin site

