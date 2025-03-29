from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
import logging
# from google.oauth2 import id_token
# from google.auth.transport import requests

from .models import CustomUser, UserProfile, UserFollowing
from .serializers import UserSerializer, UserProfileSerializer


# Configure logging
logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    logger.info("Register API called with data: %s", request.data)
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            logger.info("User created successfully: %s", user.email)

            # Create user profile
            UserProfile.objects.create(
                user=user,
                full_name=request.data.get('username', user.email.split('@')[0])
            )
            logger.info("User profile created for: %s", user.email)

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token)
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error("Error while creating user: %s", str(e))
            return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    logger.warning("Invalid registration data: %s", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    logger.info("Login API called with email: %s", request.data.get('email'))

    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(request, email=email, password=password)

    if user:
        login(request, user)
        logger.info("User logged in: %s", email)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        })

    logger.warning("Invalid login attempt for email: %s", email)
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# @api_view(['POST'])
# @permission_classes([AllowAny])
# def google_login(request):
    token = request.data.get('token')
    
    try:
        # Verify Google ID token
        id_info = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )
        
        # Check if user exists
        email = id_info['email']
        user, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={
                'username': id_info.get('name'),
                'is_active': True
            }
        )
        
        # Create profile if new user
        if created:
            UserProfile.objects.create(
                user=user,
                display_name=id_info.get('name', email.split('@')[0])
            )
        
        # Login user
        login(request, user)
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'created': created
        })
    
    except ValueError:
        return Response({'error': 'Invalid Google token'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get('email')
    
    try:
        user = CustomUser.objects.get(email=email)
        
        # Generate password reset token
        token = default_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}&email={email}"
        
        # Send password reset email
        send_mail(
            'Password Reset Request',
            f'Click the following link to reset your password: {reset_url}',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        
        return Response({'message': 'Password reset link sent'}, status=status.HTTP_200_OK)
    
    except CustomUser.DoesNotExist:
        return Response({'error': 'Email not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    email = request.data.get('email')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    try:
        user = CustomUser.objects.get(email=email)
        
        # Verify token
        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password reset successful'}, status=status.HTTP_200_OK)
        
        return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
    
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    profile = request.user.profile
    serializer = UserProfileSerializer(profile)
    return Response(serializer.data)