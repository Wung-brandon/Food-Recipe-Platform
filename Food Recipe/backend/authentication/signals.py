from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ChefProfile
from .utils import send_notification
from django.utils import timezone

@receiver(post_save, sender=ChefProfile)
def verify_chef_on_admin_update(sender, instance, created, **kwargs):
    """
    Signal to verify chef when is_verified is set to True in the admin panel.
    """
    if not created and instance.verification_status == 'VERIFIED' and instance.verification_date is None:
        # Set the verification date
        instance.verification_date = timezone.now()
        instance.save()

        # Send approval notification to the chef
        user = instance.user
        context = {
            "user": user,
            "chef_profile": instance,
            "login_url": "/login"  # Adjust the URL as needed
        }
        template_path = "Chef_notifications/chef_approval.html"
        subject = "Your Chef Account Has Been Approved!"
        send_notification(user, subject, template_path, context)