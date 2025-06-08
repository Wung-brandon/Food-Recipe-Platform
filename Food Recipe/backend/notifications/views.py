from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(generics.ListAPIView):
    """
    List notifications for the authenticated user.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter notifications by the authenticated user as the recipient
        and order them by timestamp in descending order.
        """
        user = self.request.user
        return Notification.objects.filter(recipient=user).order_by('-timestamp')