from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.db.models.signals import post_save
from django.core.exceptions import ObjectDoesNotExist

class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not username:
            raise ValueError("The username must be provided")
        if not email:
            raise ValueError("The Email field must be set")
        
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(username=username, email=email, password=password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    USER_TYPES = (
        ('USER', 'Regular User'),
        ('CHEF', 'Chef'),
    )
    
    email = models.EmailField(unique=True, blank=False, null=False)
    username = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    role = models.CharField(max_length=10, choices=USER_TYPES, default='USER')
    
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email
    
    @property
    def is_chef(self):
        return self.role == 'CHEF'

class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=100)
    bio = models.TextField(blank=True, null=True)
    followers_count = models.PositiveIntegerField(default=0)
    following_count = models.PositiveIntegerField(default=0)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.email}'s Profile"

class ChefProfile(models.Model):
    VERIFICATION_STATUS = (
        ('PENDING', 'Pending Verification'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected'),
    )
    
    SPECIALIZATION_CHOICES = (
        ('ITALIAN', 'Italian Cuisine'),
        ('FRENCH', 'French Cuisine'),
        ('AFRICAN', 'Afican Cuisine'),
        ('INDIAN', 'Indian Cuisine'),
        ('CHINESE', 'Chinese Cuisine'),
        ('JAPANESE', 'Japanese Cuisine'),
        ('MEXICAN', 'Mexican Cuisine'),
        ('MEDITERRANEAN', 'Mediterranean Cuisine'),
        ('AMERICAN', 'American Cuisine'),
        ('THAI', 'Thai Cuisine'),
        ('OTHER', 'Other Cuisine'),
    )
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='chef_profile')
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS, default='PENDING')
    years_of_experience = models.PositiveIntegerField(default=0)
    specialization = models.CharField(max_length=20, choices=SPECIALIZATION_CHOICES, default='OTHER')
    certification = models.FileField(upload_to='chef/chef_certifications/', blank=True, null=True)
    certification_number = models.CharField(max_length=50, blank=True, null=True)
    issuing_authority = models.CharField(max_length=100, blank=True, null=True)
    identity_proof = models.FileField(upload_to='chef/chef_identity_proofs/', blank=True, null=True)
    food_safety_certification = models.FileField(upload_to='chef/food_safety_certs/', blank=True, null=True)
    has_accepted_terms = models.BooleanField(default=False)
    rejection_reason = models.TextField(blank=True, null=True)
    verification_date = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.email}'s Chef Profile"

class UserFollowing(models.Model):
    user = models.ForeignKey(CustomUser, related_name='following', on_delete=models.CASCADE)
    target_user = models.ForeignKey(CustomUser, related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'target_user')
        verbose_name_plural = 'User Followings'

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        
        if is_new:
            # Update followers and following counts
            self.user.profile.following_count += 1
            self.user.profile.save()
            
            self.target_user.profile.followers_count += 1
            self.target_user.profile.save()
            
def create_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
        # Create chef profile if user role is chef
        if instance.role == 'CHEF':
            ChefProfile.objects.create(user=instance)

def save_profile(sender, instance, **kwargs):
    try:
        instance.profile.save()
    except ObjectDoesNotExist:
        UserProfile.objects.create(user=instance)

post_save.connect(create_profile, sender=CustomUser)
post_save.connect(save_profile, sender=CustomUser)