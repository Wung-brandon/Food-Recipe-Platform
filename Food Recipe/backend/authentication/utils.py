# utils.py - Add error handling to make send_notification more robust

from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_notification(user, subject, template_path, context):
    """
    Send email notification to a user with better error handling.
    
    Args:
        user: The user to send the email to
        subject: Email subject
        template_path: Path to the email template
        context: Context data for the template
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Render the email content using the template
        message_html = render_to_string(template_path, context)
        
        # Log email attempt
        logger.info(f"Attempting to send email to {user.email}: {subject}")
        
        # Check if we have valid SMTP settings
        if not all([
            settings.EMAIL_HOST,
            settings.EMAIL_PORT,
            settings.EMAIL_HOST_USER,
            settings.EMAIL_HOST_PASSWORD
        ]):
            logger.error("Missing email configuration - cannot send emails")
            raise ValueError("Email configuration is incomplete")
        
        # Send the email
        send_mail(
            subject=subject,
            message="",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=message_html,
            fail_silently=False
        )
        
        logger.info(f"Email sent successfully to {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {user.email}: {str(e)}")
        # Re-raise to be handled by the caller
        raise