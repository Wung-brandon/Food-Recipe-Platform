from rest_framework import serializers
from .models import UserPreference, RecipeView, AIRecommendation, IngredientSearchHistory
from recipe.models import Recipe
from recipe.serializers import RecipeListSerializer
from django.db.models import Avg

class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = ['dietary_needs', 'cuisine_preferences', 'disliked_ingredients', 
                 'cooking_skill_level', 'preferred_cooking_time']

class RecipeViewSerializer(serializers.ModelSerializer):
    recipe = RecipeListSerializer(read_only=True)
    class Meta:
        model = RecipeView
        fields = ['recipe', 'viewed_at', 'interaction_type']

class AIRecommendationSerializer(serializers.ModelSerializer):
    recipe = RecipeListSerializer(read_only=True)
    class Meta:
        model = AIRecommendation
        fields = ['recipe', 'confidence_score', 'reason', 'created_at']

class IngredientSearchSerializer(serializers.Serializer):
    ingredients = serializers.ListField(
        child=serializers.CharField(max_length=100),
        min_length=1
    )
    max_results = serializers.IntegerField(default=10, min_value=1, max_value=50)

class IngredientSearchResultSerializer(serializers.Serializer):
    recipes = RecipeListSerializer(many=True)
    ai_suggestions = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )

class RecipeDetailSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()
    class Meta:
        model = Recipe
        fields = ['id', 'title', 'description', 'cooking_time', 'servings', 
                  'dietary_restrictions', 'cuisine', 'ingredients', 'instructions', 
                  'image', 'video', 'tags', 'created_at', 'updated_at', 
                  'user', 'is_favorited', 'favorited_times', 'views', 
                  'comments', 'average_rating']

    def get_average_rating(self, obj):
        # Use the correct field 'value' for aggregation
        if hasattr(obj, 'ratings') and obj.ratings.exists():
            return round(obj.ratings.aggregate(avg=Avg('value'))['avg'] or 0, 1)
        return 0