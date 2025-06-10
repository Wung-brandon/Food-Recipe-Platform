from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from recipe.models import Recipe, Comment, LikedRecipe, FavoriteRecipe
from .models import RecipeView, RecipeLike, RecipeComment, RecipeShare, RecipeSave
from datetime import timedelta
from django.utils import timezone

User = get_user_model()

# Track when a recipe is liked
@receiver(post_save, sender=LikedRecipe)
def track_recipe_like(sender, instance, created, **kwargs):
    if created:
        RecipeLike.objects.create(recipe=instance.recipe, user=instance.user)

# Track when a recipe is saved/bookmarked
@receiver(post_save, sender=FavoriteRecipe)
def track_recipe_save(sender, instance, created, **kwargs):
    if created:
        RecipeSave.objects.create(recipe=instance.recipe, user=instance.user)

# Track when a comment is made
@receiver(post_save, sender=Comment)
def track_recipe_comment(sender, instance, created, **kwargs):
    if created:
        RecipeComment.objects.create(recipe=instance.recipe, user=instance.user)

def track_recipe_view(recipe, user=None, ip_address=None, user_agent=None, referrer=None, session_key=None, time_spent=0):
    """
    Track a unique recipe view.
    - For authenticated users: only one view per user per recipe ever (no repeat views).
    - For anonymous users: only one view per session_key (or IP) per recipe ever.
    - Do NOT count views from the recipe's author (chef).
    """
    # Do not count views from the recipe's author
    if user and user.is_authenticated and hasattr(recipe, 'author') and recipe.author == user:
        return

    # Defensive: also check for author by id if possible
    if user and user.is_authenticated and hasattr(recipe, 'author_id') and recipe.author_id == user.id:
        return

    filters = {'recipe': recipe}
    if user and user.is_authenticated:
        filters['user'] = user
    elif session_key:
        filters['session_key'] = session_key
    elif ip_address:
        filters['ip_address'] = ip_address
    else:
        filters['session_key'] = None
        filters['ip_address'] = None
        filters['user'] = None

    # Only count a view if it does not already exist
    if not RecipeView.objects.filter(**filters).exists():
        RecipeView.objects.create(
            recipe=recipe,
            user=user if user and user.is_authenticated else None,
            ip_address=ip_address,
            user_agent=user_agent,
            referrer=referrer,
            session_key=session_key,
            time_spent=time_spent
        )

# Example: Track when a recipe is shared (call this manually in your share logic)
def track_recipe_share(recipe, user=None, platform=None, ip_address=None, session_key=None):
    """Track when a recipe is shared"""
    RecipeShare.objects.create(
        recipe=recipe,
        user=user,
        platform=platform,
        ip_address=ip_address,
        session_key=session_key
    )
    
def track_recipe_comment_manual(recipe, user=None, ip_address=None, session_key=None, comment=''):
    RecipeComment.objects.create(
        recipe=recipe,
        user=user,
        comment=comment,
        ip_address=ip_address,
        session_key=session_key
    )

def track_recipe_save_manual(recipe, user=None, ip_address=None, session_key=None, **kwargs):
    """Track when a recipe is saved/bookmarked"""
    RecipeSave.objects.create(
        recipe=recipe,
        user=user,
        ip_address=ip_address,
        session_key=session_key
    )
    
def track_recipe_like_manual(recipe, user=None, ip_address=None, session_key=None, **kwargs):
    """Track when a recipe is liked"""
    RecipeLike.objects.create(
        recipe=recipe,
        user=user,
        ip_address=ip_address,
        session_key=session_key
    )