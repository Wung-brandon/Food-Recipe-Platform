from rest_framework import serializers
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .utils import send_notification
from .models import CustomUser, UserProfile, UserFollowing, ChefProfile

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["email"] = user.email
        token["is_verified"] = user.is_verified
        token["role"] = user.role
        token["full_name"] = user.profile.full_name
        token["bio"] = user.profile.bio
        token["followers_count"] = user.profile.followers_count
        token["following_count"] = user.profile.following_count
        token["profile_picture"] = str(user.profile.profile_picture)
        
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
        read_only_fields = ['verification_status', 'verification_date', 'rejection_reason']

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

class ChefSignUpSerializer(serializers.Serializer):
    user = SignUpSerializer()
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
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['role'] = 'CHEF'  # Force role to be CHEF
        
        # Create user with chef role
        user_serializer = SignUpSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()
        
        # Create chef profile
        chef_profile = ChefProfile.objects.create(
            user=user,
            **validated_data
        )
        
        return chef_profile

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