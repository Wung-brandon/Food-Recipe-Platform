from rest_framework import serializers
from .models import CustomUser, UserProfile, UserFollowing
# from django.core.validators import EmailValidator

class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=6, required=True)
    confirm_password = serializers.CharField(write_only=True, min_length=6, required=True)

    class Meta:
        model = CustomUser
        fields = ["username", "email", "password", "confirm_password"]

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value
        
    def validate_username(self, value):
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        user = CustomUser.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        return user
    

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'user', 
            'full_name', 
            'bio', 
            'followers_count', 
            'following_count', 
            'profile_picture'
        ]

class UserFollowingSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFollowing
        fields = ['user', 'target_user', 'created_at']