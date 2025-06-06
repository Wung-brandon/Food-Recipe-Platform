from rest_framework import serializers
from recipe.models import Recipe

class RecommendedRecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ['id', 'title', 'image', 'category', 'rating']