from django.contrib import admin
from .models import (
    RecipeView, RecipeLike, RecipeComment, RecipeShare, 
    RecipeSave, UserFollowing, DailyAnalyticsSummary
)

@admin.register(RecipeView)
class RecipeViewAdmin(admin.ModelAdmin):
    list_display = ['recipe', 'user', 'ip_address', 'viewed_at', 'time_spent']
    list_filter = ['viewed_at', 'recipe__category']
    search_fields = ['recipe__title', 'user__username', 'ip_address']
    readonly_fields = ['id', 'viewed_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('recipe', 'user')

@admin.register(RecipeLike)
class RecipeLikeAdmin(admin.ModelAdmin):
    list_display = ['recipe', 'user', 'created_at']
    list_filter = ['created_at', 'recipe__category']
    search_fields = ['recipe__title', 'user__username']
    readonly_fields = ['created_at']

@admin.register(RecipeComment)
class RecipeCommentAdmin(admin.ModelAdmin):
    list_display = ['recipe', 'user', 'comment_preview', 'created_at']
    list_filter = ['created_at', 'recipe__category']
    search_fields = ['recipe__title', 'user__username', 'comment']
    readonly_fields = ['created_at', 'updated_at']
    
    def comment_preview(self, obj):
        return obj.comment[:50] + "..." if len(obj.comment) > 50 else obj.comment
    comment_preview.short_description = 'Comment Preview'

@admin.register(RecipeShare)
class RecipeShareAdmin(admin.ModelAdmin):
    list_display = ['recipe', 'user', 'platform', 'shared_at']
    list_filter = ['platform', 'shared_at', 'recipe__category']
    search_fields = ['recipe__title', 'user__username']
    readonly_fields = ['shared_at']

@admin.register(RecipeSave)
class RecipeSaveAdmin(admin.ModelAdmin):
    list_display = ['recipe', 'user', 'saved_at']
    list_filter = ['saved_at', 'recipe__category']
    search_fields = ['recipe__title', 'user__username']
    readonly_fields = ['saved_at']

@admin.register(UserFollowing)
class UserFollowingAdmin(admin.ModelAdmin):
    list_display = ['follower', 'following', 'created_at']
    list_filter = ['created_at']
    search_fields = ['follower__username', 'following__username']
    readonly_fields = ['created_at']

@admin.register(DailyAnalyticsSummary)
class DailyAnalyticsSummaryAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'total_views', 'unique_visitors', 'total_likes', 'new_followers']
    list_filter = ['date']
    search_fields = ['user__username']
    readonly_fields = ['date']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')