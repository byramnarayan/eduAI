from django.db import models
from django.contrib.auth.models import User # Django's built-in User model  
# we are creating this because we want to add more fields to the User model
# like profile picture, bio, etc.
from PIL import Image

# Create your models here.
class Profile(models.Model):# Profile model inherits from models.Model that have one to one relationship with User model
    # Note: Dnt't forget to add models in admin.py 
    user = models.OneToOneField(User, on_delete=models.CASCADE) # one to one relationship with User model
    image = models.ImageField(default='default.jpg', upload_to='profile_pics') # profile picture
    position = models.CharField(default='Student', max_length=100) # position
    bio = models.TextField(default='No bio...', max_length=300) # bio
    insitute = models.CharField(default='APSIT', max_length=100) # insitute
    hobbies = models.CharField(default='Cricket', max_length=100) # hobbies
    phone = models.CharField(default='1234567890', max_length=10) # phone
    location = models.CharField(default='Mumbai', max_length=100) # location

    def __str__(self): #every time print it will show profile object so we want descriptive name that why we gonna use __str__ method
        return f'{self.user.username} Profile'
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)  # Save the image first

        # Resize Image
        img = Image.open(self.image.path)
        if img.height > 300 or img.width > 300:
            output_size = (300, 300)
            img.thumbnail(output_size)
            img.save(self.image.path)
    
# Note: Don't forget to add models in admin.py


# =================================================================================================

# Time for work with models in shell
# python manage.py shell # open shell
# from django.contrib.auth.models import User # import User model
# User.objects.all() # get all users
# User.objects.first() # get first user
# User.objects.filter(username='admin') # filter user by username
# user = User.objects.filter(username='admin').first() # get user by username
# user.id # get user's id
# user.profile # get user's profile
# user.profile.bio # get user's bio
# user.profile.image # get user's image
# user.profile.id # get user's profile id
# user.profile.bio = 'I am a software engineer' # update user's bio
# user.profile.save() # save user's profile
# user.profile.image.width # get user's image width
# user.profile.image.url # get user's image url
# user.profile.image.height # get user's image height

