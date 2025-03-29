import logging
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def send_templated_email(
        subject: str, 
        template_name: str, 
        recipient_email: str, 
        context: dict = None
    ):
        """
        Send an email using HTML template with fallback to plain text
        
        :param subject: Email subject line
        :param template_name: Base name of the email template (without extension)
        :param recipient_email: Recipient's email address
        :param context: Dictionary of context variables for the template
        """
        try:
            # Ensure context is a dictionary
            context = context or {}
            
            # Render HTML and plain text versions of the email
            html_content = render_to_string(f'emails/{template_name}.html', context)
            text_content = render_to_string(f'emails/{template_name}.txt', context)
            
            # Create the email message
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[recipient_email]
            )
            
            # Attach the HTML version
            email.attach_alternative(html_content, "text/html")
            
            # Send the email
            email.send()
            
            logger.info(f"Email sent successfully to {recipient_email}")
        except Exception as e:
            logger.error(f"Failed to send email to {recipient_email}: {str(e)}")
            raise

    @staticmethod
    def send_registration_email(user, verification_link=None):
        """
        Send account registration email
        
        :param user: User instance
        :param verification_link: Optional email verification link
        """
        EmailService.send_templated_email(
            subject='Welcome to Food Recipe Platform',
            template_name='registration',
            recipient_email=user.email,
            context={
                'username': user.username or user.email.split('@')[0],
                'verification_link': verification_link
            }
        )

    @staticmethod
    def send_password_reset_email(user, reset_link):
        """
        Send password reset email
        
        :param user: User instance
        :param reset_link: Password reset link
        """
        EmailService.send_templated_email(
            subject='Password Reset Request',
            template_name='password_reset',
            recipient_email=user.email,
            context={
                'username': user.username or user.email.split('@')[0],
                'reset_link': reset_link
            }
        )
        
        
        
# const login = async (email: string, password: string) => {
#     try {
#       const response = await axios.post(`${BaseUrl}api/auth/login/`, 
#         { email, password },
#         { headers: { "Content-Type": "application/json" } }
#       );
#       const { access, refresh, user: userData } = response.data;

#       // Store tokens
#       localStorage.setItem('access_token', access);
#       localStorage.setItem('refresh_token', refresh);

#       // Set user and authentication state
#       setUser(userData);
#       setToken(access);
#       setIsAuthenticated(true);
#       navigate("/dashboard")
#       toast.success("Login Successful")
#     } catch (error:any) {
#       toast.error(error?.response?.data?.error || "Login Failed");
#       throw new Error('Login failed');
#     }
#   };

# and here if the credentials are not correct it should display invalid credentials and also when displaying the error logout successful is showing and login failed shows twice i want you to fix that whereas i've not called the logout function but the toast success message shows when login fails
# const logout = () => {
#     // Clear tokens from storage
#     localStorage.removeItem('access_token');
#     localStorage.removeItem('refresh_token');

#     // Reset state
#     setUser(null);
#     setToken(null);
#     setIsAuthenticated(false);
#     navigate("/login")
#     toast.success("Logout Successful")
#   };
# fix it