from django.db import models
from django.utils import timezone # timezone.now() is used to get the current time
from django.contrib.auth.models import User # User model is used to get the user details | they have one to many relationship
from django.urls import reverse
# Create your models here.
class doubt(models.Model):
    title = models.CharField(max_length=100)
    content= models.TextField()
    date = models.DateTimeField(default=timezone.now)
    author = models.ForeignKey(User, on_delete=models.CASCADE) # on_delete=models.CASCADE is used to delete doubt the user if the user is deleted
    def __str__(self):
        return self.title # This will return the title of the doubt Make Description of the doubt in the admin panel
    

    def get_absolute_url(self): # to tackel ImproperlyConfigured afer creating Doubts
        return reverse('doubt-detail', kwargs={'pk': self.pk})
#  redirect return to specific line and reverse return full url to that route as the String


# Add to your models.py file
class Comment(models.Model):
    doubt = models.ForeignKey(doubt, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    date_posted = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f'Comment by {self.author.username} on {self.doubt.title}'
    
    class Meta:
        ordering = ['-date_posted']  # Show newest comments first

# To check if it run in SQL Shell we need to run the following command
# python manage.py sqlmigrate appname<community> no<0001>
# This will show the SQL code that will be executed in the database
# >>> from community.models import doubt # Importing the doubt model
# >>> from django.contrib.auth.models import User # Importing the User model
# >>> User.objects.all() # To check the users in the database
# >>> User.objects.first() # To get the first user in the database
# >>> User.objects.last() # Assigning the last user to the user variable
# >>> doubt.objects.filter(author=User.objects.first()) # To get the doubts of the first user
# >>> User.objects.filter(username='admin') # To get the user with the username 'admin'
# >>> User.objects.filter(username='admin').first() # To get the first user with the username 'admin'
# >>> user = User.objects.filter(username='admin').first() # Assigning the first user with the username 'admin' to the user variable
# >>> user.id # To get the id of the user
# >>> user.pk # To get the primary key of the user
# >>> user = User.objects.get(id=1) # Assigning the user with the id 1 to the user variable
# >>> doubt.objects.all() # To get all the doubts
# >>> doubt_1=doubt(title='Doubt 1', content='Content of the doubt 1', author=user) # Creating a doubt with the title 'Doubt 1', content 'Content of the doubt 1' and author as the user
# >>> doubt_1=doubt(title='Doubt 1', content='Content of the doubt 1', author_id=user.id) 
# >>> doubt_1.save() # Saving the doubt
# >>> doubt = doubt.objects.first() # Assigning the first doubt to the doubt variable
# >>> doubt.author # To get the author of the doubt
# >>> doubt.author.email # To get the email of the author of the doubt
# >>> doubt.author.username # To get the username of the author of the doubt
# >>> doubt.date # To get the date of the doubt
# >>> doubt.content # To get the content of the doubt
# >>> doubt.title # To get the title of the doubt
# >>> doubt.id # To get the id of the doubt
# >>> doubt.pk # To get the primary key of the doubt
# >>> doubt.date_posted # To get the date of the doubt
# >>> doubt.date_posted = '2025-02-16 07:20' # Changing the date of the doubt
# >>> doubt.save() # Saving the doubt
# >>> doubt.delete() # Deleting the doubt
# >>> user.doubt_set # To get the posts of the doubt
# >>> user.doubt_set.all() # To get all the posts of the doubt
# >>> user.doubt_set.create(title='Doubt 3', content='Content of the doubt 3') # Creating a post with the title 'Doubt 2', content 'Content of the doubt 2' and author as the user Remember to save the post Rememder we don't add the author as the author is already assigned to the user