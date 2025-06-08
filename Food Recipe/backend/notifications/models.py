from django.db import models
from authentication.models import CustomUser  # Assuming CustomUser is in authentication app
from recipe.models import Recipe # Assuming Recipe is in recipe app


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('follow', 'New Follower'),
        ('like', 'Recipe Liked'),
        ('comment', 'New Comment'),
        # Add other notification types as needed
    )

    recipient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    actor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    message = models.TextField(null=True, blank=True)  # Optional message for the notification
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Notification for {self.recipient.username} from {self.actor.username} ({self.notification_type})"