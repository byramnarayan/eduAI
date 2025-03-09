from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class Chat(models.Model):
    title = models.CharField(max_length=200)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-updated_at']

class Message(models.Model):
    MESSAGE_TYPES = (
        ('user', 'User'),
        ('ai', 'AI'),
    )
    chat = models.ForeignKey(Chat, related_name='messages', on_delete=models.CASCADE)
    content = models.TextField()
    message_type = models.CharField(max_length=4, choices=MESSAGE_TYPES)
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.message_type}: {self.content[:50]}"
    
    class Meta:
        ordering = ['timestamp']