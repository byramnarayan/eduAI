from django.contrib import admin
from .models import Chat, Message

class MessageInline(admin.TabularInline):
    model = Message
    extra = 0

class ChatAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('title', 'user__username')
    inlines = [MessageInline]

admin.site.register(Chat, ChatAdmin)
admin.site.register(Message)