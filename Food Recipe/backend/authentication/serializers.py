from rest_framework import serializers
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .utils import send_notification
from .models import CustomUser, UserProfile, UserFollowing, ChefProfile
from django.contrib.auth import authenticate
import logging
from django.core.exceptions import ObjectDoesNotExist
import json
from django.db import transaction

# Configure logging
logger = logging.getLogger(__name__)

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Check if user exists and is verified before creating token
        email = attrs.get('email', '')
        password = attrs.get('password', '')
        
        user = authenticate(email=email, password=password)
        
        if not user:
            raise serializers.ValidationError(
                {'detail': 'Invalid credentials.'}
            )
            
        # Check if user is verified (only applies to chef accounts)
        if user.role == 'CHEF' and not user.is_verified:
            raise serializers.ValidationError(
                {'detail': 'Please verify your email before logging in.'}
            )
        
        # Get the token
        data = super().validate(attrs)
        
        return data
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["email"] = user.email
        token["is_verified"] = user.is_verified
        token["role"] = user.role
        token["full_name"] = user.profile.full_name if hasattr(user, 'profile') else ""
        token["bio"] = user.profile.bio if hasattr(user, 'profile') else ""
        token["followers_count"] = user.profile.followers_count if hasattr(user, 'profile') else 0
        token["following_count"] = user.profile.following_count if hasattr(user, 'profile') else 0
        token["profile_picture"] = str(user.profile.profile_picture) if hasattr(user, 'profile') and user.profile.profile_picture else ""
        
        # Add chef verification status if user is a chef
        if user.role == 'CHEF' and hasattr(user, 'chef_profile'):
            token["chef_verification_status"] = user.chef_profile.verification_status
            
        return token
class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=6, required=True)
    confirm_password = serializers.CharField(write_only=True, min_length=6, required=True)
    role = serializers.CharField(read_only=True)

    class Meta:
        model = CustomUser
        fields = ["username", "email", "password", "is_verified", "confirm_password", "role"]
        read_only_fields = ['id', 'is_verified']

class ChefProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChefProfile
        fields = [
            'id', 
            'profile_picture',
            'verification_status', 
            'years_of_experience', 
            'specialization',
            'certification', 
            'certification_number', 
            'issuing_authority',
            'identity_proof', 
            'food_safety_certification', 
            'has_accepted_terms',
            'verification_date'
        ]
        read_only_fields = ['id', 'verification_status', 'verification_date', 'rejection_reason']

class SignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, min_length=6, required=True)
    role = serializers.ChoiceField(choices=CustomUser.USER_TYPES, default='USER')

    class Meta:
        model = CustomUser
        fields = ["username", "email", "password", "confirm_password", "role"]

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        user = CustomUser.objects.create(
            username=validated_data["username"],
            email=validated_data["email"],
            role=validated_data.get("role", "USER")
        )
        user.set_password(validated_data["password"])
        user.save()
        
        return user

# Enhanced Backend ChefSignUpSerializer
class ChefSignUpSerializer(serializers.Serializer):
    # User fields - keeping them for backward compatibility
    email = serializers.EmailField(required=False)
    password = serializers.CharField(write_only=True, min_length=6, required=False)
    confirm_password = serializers.CharField(write_only=True, min_length=6, required=False)
    username = serializers.CharField(required=False)
    
    # User as JSON field
    user = serializers.JSONField(required=False)
    
    # Chef profile fields
    years_of_experience = serializers.IntegerField(min_value=0)
    specialization = serializers.ChoiceField(choices=ChefProfile.SPECIALIZATION_CHOICES)
    certification = serializers.FileField(required=True)
    certification_number = serializers.CharField(required=True)
    issuing_authority = serializers.CharField(required=True)
    identity_proof = serializers.FileField(required=True)
    food_safety_certification = serializers.FileField(required=True)
    has_accepted_terms = serializers.BooleanField(required=True)
    
    def validate_has_accepted_terms(self, value):
        if not value:
            raise serializers.ValidationError("You must accept the terms and conditions to register as a chef.")
        return value
    
    def validate(self, data):
        # Get user data either from top-level fields or from user field
        user_data = {}
        
        # Check if user field is provided
        if 'user' in data:
            # Parse user JSON data if it's a string
            if isinstance(data['user'], str):
                try:
                    user_data = json.loads(data['user'])
                except json.JSONDecodeError:
                    raise serializers.ValidationError({"user": "Invalid JSON format for user data"})
            else:
                user_data = data['user']
                
            # Validate required user fields
            required_fields = ['email', 'password', 'confirm_password', 'username']
            for field in required_fields:
                if field not in user_data or not user_data[field]:
                    raise serializers.ValidationError({f"user.{field}": f"{field} is required"})
        else:
            # Check for top-level user fields
            for field in ['email', 'password', 'confirm_password', 'username']:
                if field in data:
                    user_data[field] = data[field]
            
            # Validate all required user fields are present
            if len(user_data) > 0 and len(user_data) < 4:
                missing_fields = [field for field in ['email', 'password', 'confirm_password', 'username'] 
                                 if field not in user_data]
                raise serializers.ValidationError({field: "This field is required" for field in missing_fields})
        
        # If we have no user data at all, raise validation error
        if not user_data:
            raise serializers.ValidationError({
                "user": "User data is required. Provide either separate fields (email, password, confirm_password, username) or a 'user' JSON object."
            })
            
        # Password validation
        if 'password' in user_data and 'confirm_password' in user_data:
            if user_data['password'] != user_data['confirm_password']:
                raise serializers.ValidationError({"confirm_password": ["Passwords do not match."]})
        
        # Check if email already exists
        if 'email' in user_data:
            email = user_data['email']
            if CustomUser.objects.filter(email=email).exists():
                raise serializers.ValidationError({"email": ["A user with this email already exists."]})
        
        # Store validated user data for create method
        data['validated_user_data'] = user_data
        
        return data
    
    def create(self, validated_data):
        try:
            # Extract user data
            user_data = validated_data.pop('validated_user_data')
            
            # Remove original user field and other user fields if they exist
            validated_data.pop('user', None)
            for field in ['email', 'password', 'confirm_password', 'username']:
                validated_data.pop(field, None)
            
            # Force role to be CHEF
            user_data['role'] = 'CHEF'
            
            logger.info(f"Creating chef user: {user_data.get('email')}")
            
            # Begin a transaction to ensure consistency
            with transaction.atomic():
                # Create user
                user = CustomUser.objects.create(
                    email=user_data['email'],
                    username=user_data['username'],
                    role=user_data['role']
                )
                user.set_password(user_data['password'])
                user.save()
                
                # The signal might have already created a ChefProfile, so get or create
                chef_profile, created = ChefProfile.objects.get_or_create(user=user)
                
                # Update the chef profile with the provided data regardless of whether it was just created
                for key, value in validated_data.items():
                    setattr(chef_profile, key, value)
                chef_profile.save()
            
            logger.info(f"Chef registration successful: {user.email}")
            return chef_profile
            
        except Exception as e:
            # Log the error
            logger.error(f"Chef registration failed: {str(e)}")
            # If any error occurs during user creation, make sure we don't leave orphaned records
            if 'user' in locals() and user is not None:
                try:
                    user.delete()
                except Exception as delete_error:
                    logger.error(f"Failed to clean up user after error: {str(delete_error)}")
            
            # Re-raise the exception to be handled by the view
            raise
class ResetPasswordSerializer(serializers.Serializer):
    """
    Reset Password Serializer.
    """
    password = serializers.CharField(
        write_only=True,
        min_length=6,
        max_length=100
    )
    confirm_password = serializers.CharField(
        write_only=True,
        min_length=6,
        max_length=100
    )

    def validate(self, data):
        """
        Validate the password and ensure it matches confirmation.
        """
        password = data.get("password")
        confirm_password = data.get("confirm_password")

        if password != confirm_password:
            raise serializers.ValidationError("Passwords do not match.")

        return data

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    is_chef = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = [
            'user', 
            'full_name', 
            'bio', 
            'followers_count', 
            'following_count', 
            'profile_picture',
            'is_chef'
        ]
        
    def get_is_chef(self, obj):
        return obj.user.role == 'CHEF'
        
    def create(self, validated_data):
        # Create a new Profile instance linked to the authenticated user
        user = self.context['request'].user
        # Check if the profile already exists
        profile, created = UserProfile.objects.get_or_create(user=user, defaults=validated_data)
        
        if not created:
            # Update the existing profile with the new data
            for attr, value in validated_data.items():
                setattr(profile, attr, value)
            profile.save()
        
        return profile
        
    def update(self, instance, validated_data):
        # Handle user fields
        user_data = validated_data.pop('user', {})
        user = instance.user
        if 'email' in user_data:
            user.email = user_data['email']
        if 'username' in user_data:
            user.gender = user_data['username']
        user.save()

        # Handle profile fields
        return super().update(instance, validated_data)

class ChefProfileDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    profile = UserProfileSerializer(source='user.profile', read_only=True)
    
    class Meta:
        model = ChefProfile
        fields = [
            'id',
            'user',
            'profile',
            'verification_status',
            'years_of_experience',
            'specialization',
            'certification',
            'certification_number',
            'issuing_authority',
            'verification_date',
        ]
        read_only_fields = ['verification_status', 'verification_date']

class EmailVerificationSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()

    def validate(self, attrs):
        try:
            uid = urlsafe_base64_decode(attrs['uid']).decode()
            user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            raise serializers.ValidationError("Invalid token or user ID.")

        if not PasswordResetTokenGenerator().check_token(user, attrs['token']):
            raise serializers.ValidationError("Invalid token.")
        
        return attrs

    def save(self):
        uid = self.validated_data['uid']
        user_id = force_str(urlsafe_base64_decode(uid))
        user = CustomUser.objects.get(pk=user_id)
        user.is_active = True
        user.save()

class ResendVerificationEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    # Store the user after validation
    def validate_email(self, value):
        try:
            user = CustomUser.objects.get(email=value)
            if user.is_active:
                raise serializers.ValidationError("This account is already verified.")
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("No user with this email exists.")
        
        self.user = user  # Store the user object for use in save()
        return value

    def save(self):
        # Use the validated email and user instance stored in validation
        user = self.user
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = PasswordResetTokenGenerator().make_token(user)
        verification_link = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}"

        # Create context for email template
        context = {
            'user': user,
            'verification_link': verification_link,
        }

        # Send the verification email
        try:
            template_path = "Account_verify/verification_email.html"
            subject = "Verify your Account"
            send_notification(user, subject, template_path, context)
        except Exception as e:
            raise serializers.ValidationError(f"Failed to send email: {str(e)}")

class UserFollowingSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFollowing
        fields = ['user', 'target_user', 'created_at']
        
class EmailSerializer(serializers.Serializer):
    """
    Reset Password Email Request Serializer.
    """
    email = serializers.EmailField()

    class Meta:
        fields = ("email",)