from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from recipe.models import Recipe, Comment, LikedRecipe, FavoriteRecipe
from .models import RecipeView, RecipeLike, RecipeComment, RecipeShare, RecipeSave

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

# Example: Track when a recipe is viewed (call this manually in your view logic)
def track_recipe_view(recipe, user=None, ip_address=None, user_agent=None, referrer=None, session_key=None, time_spent=0):
    RecipeView.objects.create(
        recipe=recipe,
        user=user,
        ip_address=ip_address,
        user_agent=user_agent,
        referrer=referrer,
        session_key=session_key,
        time_spent=time_spent
    )

# Example: Track when a recipe is shared (call this manually in your share logic)
def track_recipe_share(recipe, user=None, platform=None):
    RecipeShare.objects.create(
        recipe=recipe,
        user=user,
        platform=platform
    )