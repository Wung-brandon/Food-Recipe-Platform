from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'actor', 'notification_type', 'timestamp', 'is_read')
    list_filter = ('notification_type', 'is_read', 'timestamp')
    search_fields = ('recipient__username', 'actor__username', 'message')
    ordering = ('-timestamp',)
    
# Register your models here.
