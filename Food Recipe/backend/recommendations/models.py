from django.db import models
from django.conf import settings
from recipe.models import Recipe

User = settings.AUTH_USER_MODEL

class RecipeView(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    viewed_at = models.DateTimeField(auto_now_add=True)