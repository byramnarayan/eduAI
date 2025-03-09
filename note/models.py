from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.urls import reverse




class Note(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    date_created = models.DateTimeField(default=timezone.now)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('note-detail', kwargs={'pk': self.pk})
