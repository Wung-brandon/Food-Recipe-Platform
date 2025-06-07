from django.db import models
from django.conf import settings
from recipe.models import Recipe

User = settings.AUTH_USER_MODEL

class RecipeView(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    viewed_at = models.DateTimeField(auto_now_add=True)

class UserPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    dietary_needs = models.CharField(max_length=255, blank=True, null=True)
    cuisine_preferences = models.CharField(max_length=255, blank=True, null=True)
    # Add more preference fields as needed

    def __str__(self):
        return f"Preferences for {self.user.username}"

# Add other models related to recommendations as needed,
# e.g., for storing collaborative filtering data or model parameters