"""
URL configuration for main project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include # <include> URL pattern to specify the route to the view.
from users import views as user_views # <import views from users app> | <as user_views> <alias name for views>
from django.contrib.auth import views as auth_views # <import views from django.contrib.auth> | <as auth_views> <alias name for views>
# From django Doc 
from django.conf import settings # <import settings from django.conf>
from django.conf.urls.static import static # <import static from django.conf.urls.static>


urlpatterns = [
    path('admin/', admin.site.urls),
    # path('base/', include('base.urls')), # ('base/'<goes to base app>, include('base.urls')< Work like chop off the base/ from the URL and pass the rest of the URL to the base app's URL configuration file.>),
    # path('base_dev/', include('base.urls')), | 'base_dev/' <optonal for testing> work like same chop off thing.
    path('', include('base.urls')), # home Step 01. path(''<empty to make base home  page also match with base urls and make this as our home page>, NOTE: we will not get 404 error after that.  include('base.urls')) < Work like chop off the base/ from the URL and pass the rest of the URL to the base app's URL configuration file.>),
    path('community/', include('community.urls')),
    path('note/', include('note.urls')),
    path('learn/', include('learn.urls')),
    path('ai/', include('ai.urls')),
    path('user/', include('users.urls')),
    path('register/', user_views.register, name='register'), # <register> <URL pattern> <user_views.register> <view function> <name='register'> <name for the URL pattern> | <name> is used to refer to the URL pattern in the templates.
    # path('login/', auth_views.LoginView.as_view(), name='login'), TemplateDoesNotExist at /login/ this error will show where it trying to find the template. Exception Value: registration/login.html that whee django look for by default. to fix this 
    # Option 1. we need to create a folder named registration inside the templates folder and then create a file named login.html inside the registration folder.
    # Option 2. we can specify the template_name in the LoginView.as_view() function.
    path('login/', auth_views.LoginView.as_view(template_name='users/login.html'), name='login'), # <login> <URL pattern> <auth_views.LoginView.as_view()> <view function> <name='login'> <name for the URL pattern> | <name> is used to refer to the URL pattern in the templates.
    
    path('logout/', auth_views.LogoutView.as_view(template_name='users/logout.html'), name='logout'), # <logout> <URL pattern> <auth_views.LogoutView.as_view()> <view function> <name='logout'> <name for the URL pattern> | <name> is used to refer to the URL pattern in the templates.
    path('profile/', user_views.profile, name='profile'), # <profile> <URL pattern> <user_views.profile> <view function> <name='profile'> <name for the URL pattern> | <name> is used to refer to the URL pattern in the templates.
    

] 

if settings.DEBUG: # <if> settings.DEBUG <is True> <then> urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) # <then> urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) <this will add the URL pattern to serve media files during development.>
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) # <urlpatterns> += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) <this will add the URL pattern to serve media files during development.>
