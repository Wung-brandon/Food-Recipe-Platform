from django.contrib import admin
from .models import CustomUser, UserFollowing, UserProfile, ChefProfile


# Register your models here.
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ["username", "email", "date_joined"]
   
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "full_name", "followers_count", "following_count"]
    
class ChefProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "verification_status", "years_of_experience", "specialization"]
class UserFollowingAdmin(admin.ModelAdmin):
    list_display = ["user", "target_user"]
    
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(UserFollowing, UserFollowingAdmin)