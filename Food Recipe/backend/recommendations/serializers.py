from rest_framework import serializers
from recipe.models import Recipe, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class RecommendedRecipeSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    average_rating = serializers.FloatField(read_only=True)

    class Meta:
        model = Recipe
        fields = ['id', 'title', 'image', 'slug', 'category', 'average_rating']