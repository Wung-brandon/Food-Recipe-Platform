from django.db import models
from authentication.models import CustomUser
from recipe.models import Recipe

class RecipeView(models.Model):
    """Track individual recipe views"""
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='analytics_views')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True, related_name='analytics_recipe_views_user')  # null if anonymous
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    referrer = models.URLField(blank=True, null=True)
    session_key = models.CharField(max_length=40, blank=True, null=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    time_spent = models.IntegerField(default=0, help_text="Time spent viewing recipe in seconds")
    
    class Meta:
        db_table = 'analytics_recipe_views'
        indexes = [
            models.Index(fields=['recipe', 'viewed_at']),
            models.Index(fields=['user', 'viewed_at']),
            models.Index(fields=['ip_address', 'viewed_at']),
        ]

class RecipeLike(models.Model):
    """Track recipe likes (separate from main recipe likes for analytics)"""
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='analytics_likes', null=True, blank=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='analytics_recipe_likes_user')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    session_key = models.CharField(max_length=40, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'analytics_recipe_likes'
        unique_together = ['recipe', 'user']

class RecipeComment(models.Model):
    """Track recipe comments"""
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='analytics_comments')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='analytics_recipe_comments_user', null=True, blank=True)
    comment = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    session_key = models.CharField(max_length=40, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'analytics_recipe_comments'

class RecipeShare(models.Model):
    """Track recipe shares"""
    SHARE_PLATFORMS = [
        ('facebook', 'Facebook'),
        ('twitter', 'Twitter'),
        ('instagram', 'Instagram'),
        ('whatsapp', 'WhatsApp'),
        ('email', 'Email'),
        ('copy_link', 'Copy Link'),
        ('other', 'Other'),
    ]
    
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='analytics_shares')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True, related_name='analytics_recipe_shares_user')
    platform = models.CharField(max_length=20, choices=SHARE_PLATFORMS)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    session_key = models.CharField(max_length=40, null=True, blank=True)
    shared_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'analytics_recipe_shares'

class RecipeSave(models.Model):
    """Track recipe saves/bookmarks"""
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='analytics_saves')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='analytics_recipe_saves_user')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    session_key = models.CharField(max_length=40, null=True, blank=True)
    saved_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'analytics_recipe_saves'
        unique_together = ['recipe', 'user']

class UserFollowing(models.Model):
    """Track user followers"""
    follower = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='analytics_following')
    following = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='analytics_followers')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'analytics_user_following'
        unique_together = ['follower', 'following']

class DailyAnalyticsSummary(models.Model):
    """Daily aggregated analytics data"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='analytics_daily_analytics')
    date = models.DateField()
    total_views = models.IntegerField(default=0)
    unique_visitors = models.IntegerField(default=0)
    total_likes = models.IntegerField(default=0)
    total_comments = models.IntegerField(default=0)
    total_shares = models.IntegerField(default=0)
    total_saves = models.IntegerField(default=0)
    new_followers = models.IntegerField(default=0)
    recipe_count = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'analytics_daily_summary'
        unique_together = ['user', 'date']
        indexes = [
            models.Index(fields=['user', 'date']),
        ]