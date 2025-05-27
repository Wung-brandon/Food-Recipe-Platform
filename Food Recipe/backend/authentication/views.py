from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.tokens import default_token_generator
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (
    MyTokenObtainPairSerializer, 
    UserProfileSerializer, 
    SignUpSerializer, 
    EmailSerializer, 
    UserSerializer, 
    ResetPasswordSerializer,
    UserFollowingSerializer,
    EmailVerificationSerializer,
    ResendVerificationEmailSerializer,
    ChefSignUpSerializer,
    ChefProfileSerializer,
    ChefProfileDetailSerializer
)
from rest_framework.generics import RetrieveAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.generics import GenericAPIView
from rest_framework import status, serializers
from rest_framework.response import Response
from django.urls import reverse
from django.shortcuts import redirect
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode 
from django.utils import timezone
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from .utils import send_notification
from django.conf import settings
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
import logging
import json

from .models import CustomUser, UserProfile, UserFollowing, ChefProfile


# Configure logging
logger = logging.getLogger(__name__)

# Custom permissions
class IsChef(BasePermission):
    """
    Permission to only allow chefs to access the view.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'CHEF'

class IsVerifiedChef(BasePermission):
    """
    Permission to only allow verified chefs to access the view.
    """
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.role == 'CHEF' and 
                hasattr(request.user, 'chef_profile') and 
                request.user.chef_profile.verification_status == 'VERIFIED')

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    permission_classes = [AllowAny]
# views.py modification - Modify the SignUpView class

class SignUpView(GenericAPIView):
    serializer_class = SignUpSerializer
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        logger.info("Signup request received")
        if serializer.is_valid():
            logger.info("User data is valid, saving user...")
            user = serializer.save()

            try:
                pass  # Add your code here
            except Exception as e:
                logger.error(f"An error occurred: {e}")
                # For regular users, set is_verified to True automatically
                if user.role == 'USER':
                    user.is_verified = True
                    user.save()
                    
                    # Send welcome email instead of verification
                    try:
                        context = {
                            "user": user,
                            "login_url": request.build_absolute_uri('/login')
                        }
                        
                        template_path = "Account_verify/welcome_email.html"
                        subject = "Welcome to PerfectRecipe!"
                        send_notification(user, subject, template_path, context)
                        email_status = "welcome_email_sent"
                    except Exception as email_error:
                        logger.error(f"Failed to send welcome email: {email_error}")
                        email_status = "welcome_email_failed"
                        
                    return Response(
                        {
                            "message": "Registration successful.",
                            "details": f"Account created and verified, {email_status}. You can now log in.",
                            "user_id": user.id,
                            "is_verified": True
                        },
                        status=status.HTTP_201_CREATED
                    )
                else:
                    # For chefs, keep the original verification flow
                    # Generate verification token and link
                    uid = urlsafe_base64_encode(force_bytes(user.pk))
                    token = PasswordResetTokenGenerator().make_token(user)
                    verification_link = request.build_absolute_uri(
                        reverse('verify-email', kwargs={'uidb64': uid, 'token': token})
                    )
                    
                    context = {
                        "user": user,
                        "verification_link": verification_link
                    }

                    # Try to send the verification email
                    try:
                        # Create the message as a string
                        template_path = "Account_verify/verification_email.html"
                        subject = "Verify your Account"

                        # Send verification email
                        send_notification(user, subject, template_path, context)
                    except Exception as email_error:
                        # Log email sending error but don't fail the signup
                        logger.error(f"Failed to send verification email: {email_error}")
                        # You can add these details to the response if desired
                        email_status = "verification_email_failed"
                    else:
                        email_status = "verification_email_sent"

                    return Response(
                        {
                            "message": "Chef registration successful.",
                            "details": f"Account created, {email_status}. Please check your email to verify your account or contact support if you don't receive it.",
                            "user_id": user.id
                        },
                        status=status.HTTP_201_CREATED
                    )
             
            except Exception as e:
                logger.error(f"Error in signup: {e}")
                return Response(
                    {"message": f"Registration failed: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
        return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
    serializer_class = SignUpSerializer
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        logger.info("Signup request received")
        if serializer.is_valid():
            logger.info("User data is valid, saving user...")
            user = serializer.save()

            try:
                # Generate verification token and link
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = PasswordResetTokenGenerator().make_token(user)
                verification_link = request.build_absolute_uri(
                    reverse('verify-email', kwargs={'uidb64': uid, 'token': token})
                )
                
                context = {
                    "user": user,
                    "verification_link": verification_link
                }

                # Try to send the verification email
                try:
                    # Create the message as a string
                    template_path = "Account_verify/verification_email.html"
                    subject = "Verify your Account"

                    # Send verification email
                    send_notification(user, subject, template_path, context)
                except Exception as email_error:
                    # Log email sending error but don't fail the signup
                    logger.error(f"Failed to send verification email: {email_error}")
                    # You can add these details to the response if desired
                    email_status = "verification_email_failed"
                else:
                    email_status = "verification_email_sent"

                return Response(
                    {
                        "message": "Registration successful.",
                        "details": f"Account created, {email_status}. Please check your email to verify your account or contact support if you don't receive it.",
                        "user_id": user.id
                    },
                    status=status.HTTP_201_CREATED
                )
             
            except Exception as e:
                logger.error(f"Error in signup: {e}")
                return Response(
                    {"message": f"Registration failed: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
        return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
# Enhanced ChefSignUpView
class ChefSignUpView(GenericAPIView):
    serializer_class = ChefSignUpSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        try:
            logger.info("Chef signup request received")
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                chef_profile = serializer.save()
                user = chef_profile.user

                # Generate verification token and link
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = PasswordResetTokenGenerator().make_token(user)
                verification_link = request.build_absolute_uri(
                    reverse('verify-email', kwargs={'uidb64': uid, 'token': token})
                )

                context = {
                    "user": user,
                    "verification_link": verification_link,
                    "chef_application": True,
                }

                # Send verification email
                template_path = "Account_verify/verification_email.html"
                subject = "Verify your Chef Account"
                send_notification(user, subject, template_path, context)

                logger.info(f"Chef registration successful for user: {user.email}")

                return Response(
                    {
                        "message": "Chef registration successful. Your application is under review. Please check your email to verify your account.",
                        "chef_id": chef_profile.id,
                    },
                    status=status.HTTP_201_CREATED,
                )
            else:
                logger.warning(f"Chef registration validation failed: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Unhandled exception in chef signup: {str(e)}", exc_info=True)
            return Response(
                {"message": "An unexpected error occurred during registration."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
            
class ListAllUsersView(ListAPIView):
    queryset = CustomUser.objects.all().order_by("id")
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    # def get_queryset(self):
    #     return self.queryset.exclude(id=self.request.user.id).order_by("id")
    
class ListAllChefsView(ListAPIView):
    serializer_class = ChefProfileDetailSerializer  # Use a serializer that includes chef-related details
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Filter users with the role of 'CHEF' and ensure they have a related chef profile
        return ChefProfile.objects.select_related('user').filter(user__role='CHEF').order_by("user__id")

class GetUserView(RetrieveAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user)
        data = serializer.data
        
        # Add chef profile data if the user is a chef
        if user.role == 'CHEF' and hasattr(user, 'chef_profile'):
            chef_serializer = ChefProfileSerializer(user.chef_profile)
            data['chef_profile'] = chef_serializer.data
            
        return Response(data, status=status.HTTP_200_OK)

class ListCreateUserProfileView(ListCreateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        return Response("Profile Created Successfully", status=status.HTTP_200_OK)
    
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user).order_by("id")
    
class RetrieveUpdateUserProfileView(RetrieveUpdateDestroyAPIView):
    queryset = UserProfile.objects.all()
    lookup_field = "id"
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user).order_by("id")

class RetrieveUpdateChefProfileView(RetrieveUpdateDestroyAPIView):
    queryset = ChefProfile.objects.all()
    lookup_field = "id"
    serializer_class = ChefProfileSerializer
    permission_classes = [IsAuthenticated, IsChef]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        # If the chef is already verified, limit which fields can be updated
        if instance.verification_status == 'VERIFIED':
            allowed_fields = ['years_of_experience', 'specialization']
            # Build a new dict with only allowed fields
            update_data = {field: request.data[field] for field in allowed_fields if field in request.data}
        else:
            update_data = request.data

        serializer = self.get_serializer(instance, data=update_data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # If updating chef profile resets verification status
        if instance.verification_status == 'VERIFIED' and any(field in request.data for field in ['certification', 'certification_number']):
            instance.verification_status = 'PENDING'
            instance.save()

        return Response(serializer.data)
    

class ListAllVerifiedChefsView(ListAPIView):
    """API endpoint to get all verified chefs"""
    serializer_class = ChefProfileDetailSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return ChefProfile.objects.filter(verification_status='VERIFIED')

class ForgotPasswordView(GenericAPIView):
    serializer_class = EmailSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Create token and send reset password email.
        """
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = CustomUser.objects.filter(email=email).first()
        if user:
            encoded_pk = urlsafe_base64_encode(force_bytes(user.pk))
            token = PasswordResetTokenGenerator().make_token(user)
           
            # Construct the frontend reset URL
            reset_url = f"http://localhost:5173/reset-password/{encoded_pk}/{token}/"

            # Create the message as a string
            context = {
                'user': user,
                'reset_url': reset_url,
            }

            # Use the 'password_reset.html' template
            subject = "Password Reset Request"
            template_path = "forgot_password/password_reset.html"
            send_notification(user, subject, template_path, context)
            
            return redirect(reset_url)
            
        else:
            return Response(
                {"message": "User does not exist."},
                status=status.HTTP_400_BAD_REQUEST,
            )

class ResetPasswordView(GenericAPIView):
    """
    Verify and Reset Password Token View.
    """
    permission_classes = [AllowAny]
    serializer_class = ResetPasswordSerializer

    def patch(self, request, *args, **kwargs):
        """
        Verify token & uidb64 and then reset the password.
        """
        uidb64 = self.kwargs.get('uidb64')
        token = self.kwargs.get('token')
        
        print(uidb64, token)

        if not uidb64 or not token:
            return Response(
                {"message": "Missing uidb64 or token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Deserialize password data
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        password = serializer.validated_data['password']

        # Decode the uidb64 to get the user
        try:
            user_id = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(id=user_id)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response(
                {"message": "Invalid token or user ID."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify the token
        if not PasswordResetTokenGenerator().check_token(user, token):
            return Response(
                {"message": "Invalid token or expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Reset the password
        user.set_password(password)
        user.save()
        
        # Send a success email
        subject = "Password Reset Successful"
        template_path = "forgot_password/reset_success.html"
        context = {"user": user}
        send_notification(user, subject, template_path, context)


        return Response(
            {"message": "Password reset successful."},)
        
class EmailVerificationView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, uidb64, token, *args, **kwargs):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            user = None

        if user is not None and PasswordResetTokenGenerator().check_token(user, token):
            user.is_verified = True
            user.save()
            
            # Construct the redirect URL with a success message
            redirect_url = f"http://localhost:5173/login?account_verified=True"
            
            context = {
                "user": user,
                "redirect_url": redirect_url,
            }
             # Send confirmation email
            template_path = "Account_verify/verification_success.html"
            subject = "Account Activated"
            send_notification(user, subject, template_path, context)
            
            # If the user is a chef, add a message about verification pending
            if user.role == 'CHEF':
                if hasattr(user, 'chef_profile'):
                    redirect_url = f"http://localhost:5173/login?account_verified=True&chef_verification_pending=True"
                
                # Notify admins about new verified chef account
                admin_users = CustomUser.objects.filter(is_staff=True)
                for admin in admin_users:
                    admin_context = {
                        "admin": admin,
                        "chef": user,
                        "chef_profile": user.chef_profile,
                        "admin_link": request.build_absolute_uri(f'/admin/app/chefprofile/{user.chef_profile.id}/change/')
                    }
                    
                    admin_template_path = "Chef_notifications/chef_email_verified.html"
                    admin_subject = f"Chef Email Verified: {user.username}"
                    send_notification(admin, admin_subject, admin_template_path, admin_context)

            # Redirect the user to the frontend login page
            return redirect(redirect_url)
        else:
            return Response({"message": "Activation link is invalid"}, status=status.HTTP_400_BAD_REQUEST)
        
class ResendVerificationEmailView(GenericAPIView):
    serializer_class = ResendVerificationEmailSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()  # This will trigger the email sending logic
        return Response({"message": "Verification link has been sent to your email."}, status=status.HTTP_200_OK)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def follow_user(request):
    target_user_id = request.data.get('user_id')
    
    try:
        target_user = CustomUser.objects.get(id=target_user_id)
        
        # Prevent self-following
        if target_user == request.user:
            return Response({'error': 'Cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already following
        existing_follow = UserFollowing.objects.filter(
            user=request.user, 
            target_user=target_user
        ).exists()
        
        if existing_follow:
            return Response({'error': 'Already following this user'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create follow relationship
        UserFollowing.objects.create(
            user=request.user,
            target_user=target_user
        )
        
        return Response({
            'message': 'User followed successfully',
            'followers_count': target_user.profile.followers_count
        }, status=status.HTTP_201_CREATED)
    
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

# Chef verification admin endpoints
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_chef(request, chef_id):
    """Admin endpoint to approve a chef application"""
    if not request.user.is_staff:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        chef_profile = ChefProfile.objects.get(id=chef_id)
        
        # Update chef verification status
        chef_profile.verification_status = 'VERIFIED'
        chef_profile.verification_date = timezone.now()
        chef_profile.save()
        
        # Send approval notification to chef
        user = chef_profile.user
        context = {
            "user": user,
            "chef_profile": chef_profile,
            "login_url": request.build_absolute_uri('/login')
        }
        
        template_path = "Chef_notifications/chef_approval.html"
        subject = "Your Chef Account Has Been Approved!"
        send_notification(user, subject, template_path, context)
        
        return Response({
            'message': 'Chef approved successfully',
            'chef_id': chef_profile.id
        }, status=status.HTTP_200_OK)
        
    except ChefProfile.DoesNotExist:
        return Response({'error': 'Chef not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_chef(request, chef_id):
    """Admin endpoint to reject a chef application"""
    if not request.user.is_staff:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    
    rejection_reason = request.data.get('rejection_reason')
    if not rejection_reason:
        return Response({'error': 'Rejection reason is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        chef_profile = ChefProfile.objects.get(id=chef_id)
        
        # Update chef verification status
        chef_profile.verification_status = 'REJECTED'
        chef_profile.rejection_reason = rejection_reason
        chef_profile.save()
        
        # Send rejection notification to chef
        user = chef_profile.user
        context = {
            "user": user,
            "chef_profile": chef_profile,
            "rejection_reason": rejection_reason,
            "update_url": request.build_absolute_uri('/chef/profile')
        }
        
        template_path = "Chef_notifications/chef_rejection.html"
        subject = "Your Chef Application Status"
        send_notification(user, subject, template_path, context)
        
        return Response({
            'message': 'Chef application rejected',
            'chef_id': chef_profile.id
        }, status=status.HTTP_200_OK)
        
    except ChefProfile.DoesNotExist:
        return Response({'error': 'Chef not found'}, status=status.HTTP_404_NOT_FOUND)

# List all pending chef applications
class PendingChefApplicationsView(ListAPIView):
    """Admin endpoint to list all pending chef applications"""
    serializer_class = ChefProfileDetailSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if not self.request.user.is_staff:
            return ChefProfile.objects.none()
        return ChefProfile.objects.filter(verification_status='PENDING')

# Chef verification status check
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsChef])
def check_chef_status(request):
    """Endpoint for chefs to check their verification status"""
    try:
        chef_profile = ChefProfile.objects.get(user=request.user)
        serializer = ChefProfileSerializer(chef_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except ChefProfile.DoesNotExist:
        return Response({'error': 'Chef profile not found'}, status=status.HTTP_404_NOT_FOUND)