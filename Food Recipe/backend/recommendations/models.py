from django.db import models
from django.conf import settings
from recipe.models import Recipe
from authentication.models import CustomUser
import json


class RecipeView(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='recommendation_recipe_views')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='recommendation_views')
    viewed_at = models.DateTimeField(auto_now_add=True)
    interaction_type = models.CharField(max_length=50, default='view')  # view, like, bookmark, etc.

    class Meta:
        unique_together = ['user', 'recipe']

class UserPreference(models.Model):
    DIETARY_CHOICES = [
        ('vegetarian', 'Vegetarian'),
        ('vegan', 'Vegan'),
        ('gluten-free', 'Gluten Free'),
        ('keto', 'Keto'),
        ('paleo', 'Paleo'),
        ('low-carb', 'Low Carb'),
        ('dairy-free', 'Dairy Free'),
        ('nut-free', 'Nut Free'),
    ]
    
    CUISINE_CHOICES = [
        ('central-african', 'Central African'),
        ('east-african', 'East African'),
        ('north-african', 'North African'),
        ('southern-african', 'Southern African'),
        ('west-african', 'West African'),
        ('traditional-african', 'Traditional African'),
        # Optionally include these if you want to allow meal types as cuisine (not typical):
        # ('breakfast', 'Breakfast'),
        # ('lunch', 'Lunch'),
        # ('dinner', 'Dinner'),
    ]

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='recommendation_preference')
    dietary_needs = models.JSONField(default=list, blank=True)  # Store multiple dietary needs
    cuisine_preferences = models.JSONField(default=list, blank=True)  # Store multiple cuisines
    disliked_ingredients = models.JSONField(default=list, blank=True)  # Ingredients to avoid
    cooking_skill_level = models.CharField(max_length=20, choices=[
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced')
    ], default='beginner')
    preferred_cooking_time = models.IntegerField(default=30)  # in minutes
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Preferences for {self.user.username}"

class AIRecommendation(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='ai_recommendations')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ai_recommendations')
    confidence_score = models.FloatField(default=0.0)  # AI confidence in recommendation
    reason = models.TextField(blank=True)  # Why this recipe was recommended
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'recipe']
        ordering = ['-confidence_score', '-created_at']

class IngredientSearchHistory(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='ingredient_searches', null=True, blank=True)
    ingredients = models.JSONField()  # List of ingredients searched
    results = models.JSONField()  # Store recipe IDs that were returned
    search_timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ['-search_timestamp']