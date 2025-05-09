# import logging
# from django.core.mail import EmailMultiAlternatives
# from django.template.loader import render_to_string
# from django.conf import settings

# logger = logging.getLogger(__name__)

# class EmailService:
#     @staticmethod
#     def send_templated_email(
#         subject: str, 
#         template_name: str, 
#         recipient_email: str, 
#         context: dict = None
#     ):
#         """
#         Send an email using HTML template with fallback to plain text
        
#         :param subject: Email subject line
#         :param template_name: Base name of the email template (without extension)
#         :param recipient_email: Recipient's email address
#         :param context: Dictionary of context variables for the template
#         """
#         try:
#             # Ensure context is a dictionary
#             context = context or {}
            
#             # Render HTML and plain text versions of the email
#             html_content = render_to_string(f'emails/{template_name}.html', context)
#             text_content = render_to_string(f'emails/{template_name}.txt', context)
            
#             # Create the email message
#             email = EmailMultiAlternatives(
#                 subject=subject,
#                 body=text_content,
#                 from_email=settings.DEFAULT_FROM_EMAIL,
#                 to=[recipient_email]
#             )
            
#             # Attach the HTML version
#             email.attach_alternative(html_content, "text/html")
            
#             # Send the email
#             email.send()
            
#             logger.info(f"Email sent successfully to {recipient_email}")
#         except Exception as e:
#             logger.error(f"Failed to send email to {recipient_email}: {str(e)}")
#             raise

#     @staticmethod
#     def send_registration_email(user, verification_link=None):
#         """
#         Send account registration email
        
#         :param user: User instance
#         :param verification_link: Optional email verification link
#         """
#         EmailService.send_templated_email(
#             subject='Welcome to Food Recipe Platform',
#             template_name='registration',
#             recipient_email=user.email,
#             context={
#                 'username': user.username or user.email.split('@')[0],
#                 'verification_link': verification_link
#             }
#         )

#     @staticmethod
#     def send_password_reset_email(user, reset_link):
#         """
#         Send password reset email
        
#         :param user: User instance
#         :param reset_link: Password reset link
#         """
#         EmailService.send_templated_email(
#             subject='Password Reset Request',
#             template_name='password_reset',
#             recipient_email=user.email,
#             context={
#                 'username': user.username or user.email.split('@')[0],
#                 'reset_link': reset_link
#             }
#         )
        
        
from django.conf import settings
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.template.loader import render_to_string
from django.utils.html import strip_tags



def send_notification(user, subject, template_path, context):

            """
                Sends an email notification to the user with the specified email template.

                Parameters:
                - user: The user to send the email to.
                - subject: The email subject.
                - template_path: Path to the email template file (e.g., 'emails/password_reset.html').
                - context: The context data for the email template.
             """
            sender_email = settings.EMAIL_HOST_USER  # Replace with your email address
            sender_password = settings.EMAIL_HOST_PASSWORD  # Replace with your email password
            send_host = settings.EMAIL_HOST
            send_port = settings.EMAIL_PORT
            receiver_email = user.email
            # print("host", send_host, send_port, sender_password)
            

        # Create a multipart message
            msg = MIMEMultipart()
            msg["From"] = sender_email
            msg["To"] = receiver_email
            msg["Subject"] = subject

            # Render the HTML and plain text versions of the email
            html_message = render_to_string(template_path, context)
    
            # Attach the message to the email
            # msg.attach(MIMEText(plain_message, "plain"))
            msg.attach(MIMEText(html_message, "html"))
            

            # Connect to the SMTP server
            server = smtplib.SMTP(send_host, send_port)
            server.ehlo()
            server.starttls()

            # Login to the SMTP server
            server.login(sender_email, sender_password)

            # Send the email
            server.sendmail(sender_email, receiver_email, msg.as_string())

            # Disconnect from the server
            server.quit()
            
