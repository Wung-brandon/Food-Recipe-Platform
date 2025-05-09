# recipes/serializers.py
from rest_framework import serializers
from .models import (
    Category, Tag, Recipe, Ingredient, Step, Tip,
    Comment, Rating, FavoriteRecipe, LikedRecipe
)
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile_image']
        
    # Assuming the User model has a profile_image field. If not, you'd need to adjust this.
    profile_image = serializers.SerializerMethodField()
    
    def get_profile_image(self, obj):
        # Check if user has a profile with an image
        # This depends on how your profile is structured
        if hasattr(obj, 'profile') and obj.profile.avatar:
            return obj.profile.avatar.url
        return None


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'amount']


class StepSerializer(serializers.ModelSerializer):
    class Meta:
        model = Step
        fields = ['id', 'description', 'order']


class TipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tip
        fields = ['id', 'description']


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'text', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        user = self.context['request'].user
        recipe = self.context['recipe']
        return Comment.objects.create(user=user, recipe=recipe, **validated_data)


class RatingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Rating
        fields = ['id', 'user', 'value', 'created_at']
        read_only_fields = ['user', 'created_at']
    
    def create(self, validated_data):
        user = self.context['request'].user
        recipe = self.context['recipe']
        # Update the rating if it exists, otherwise create it
        rating, created = Rating.objects.update_or_create(
            user=user,
            recipe=recipe,
            defaults={'value': validated_data['value']}
        )
        return rating


class RecipeListSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=1, read_only=True)
    rating_count = serializers.IntegerField(read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    is_favorited = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'slug', 'description', 'image', 
            'preparation_time', 'cooking_time', 'servings', 'difficulty',
            'calories', 'category', 'author', 'created_at',
            'average_rating', 'rating_count', 'like_count',
            'is_favorited', 'is_liked'
        ]
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return FavoriteRecipe.objects.filter(user=request.user, recipe=obj).exists()
        return False
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return LikedRecipe.objects.filter(user=request.user, recipe=obj).exists()
        return False


class RecipeDetailSerializer(RecipeListSerializer):
    ingredients = IngredientSerializer(many=True, read_only=True)
    steps = StepSerializer(many=True, read_only=True)
    tips = TipSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta(RecipeListSerializer.Meta):
        fields = RecipeListSerializer.Meta.fields + ['ingredients', 'steps', 'tips', 'tags', 'comments']


class RecipeCreateUpdateSerializer(serializers.ModelSerializer):
    ingredients = IngredientSerializer(many=True)
    steps = StepSerializer(many=True)
    tips = TipSerializer(many=True, required=False)
    tags = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Tag.objects.all(),
        required=False
    )
    
    class Meta:
        model = Recipe
        fields = [
            'title', 'description', 'image', 'preparation_time',
            'cooking_time', 'servings', 'difficulty', 'calories',
            'category', 'ingredients', 'steps', 'tips', 'tags'
        ]
    
    def create(self, validated_data):
        ingredients_data = validated_data.pop('ingredients')
        steps_data = validated_data.pop('steps')
        tips_data = validated_data.pop('tips', [])
        tags_data = validated_data.pop('tags', [])
        
        # Get the user from the request context
        user = self.context['request'].user
        
        # Create the recipe
        recipe = Recipe.objects.create(author=user, **validated_data)
        
        # Create ingredients
        for ingredient_data in ingredients_data:
            Ingredient.objects.create(recipe=recipe, **ingredient_data)
        
        # Create steps
        for step_data in steps_data:
            Step.objects.create(recipe=recipe, **step_data)
        
        # Create tips
        for tip_data in tips_data:
            Tip.objects.create(recipe=recipe, **tip_data)
        
        # Add tags
        if tags_data:
            recipe.tags.set(tags_data)
        
        return recipe
    
    def update(self, instance, validated_data):
        # Handle nested related data
        ingredients_data = validated_data.pop('ingredients', None)
        steps_data = validated_data.pop('steps', None)
        tips_data = validated_data.pop('tips', None)
        tags_data = validated_data.pop('tags', None)
        
        # Update recipe fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update ingredients
        if ingredients_data is not None:
            # Delete existing ingredients
            instance.ingredients.all().delete()
            # Create new ingredients
            for ingredient_data in ingredients_data:
                Ingredient.objects.create(recipe=instance, **ingredient_data)
        
        # Update steps
        if steps_data is not None:
            # Delete existing steps
            instance.steps.all().delete()
            # Create new steps
            for step_data in steps_data:
                Step.objects.create(recipe=instance, **step_data)
        
        # Update tips
        if tips_data is not None:
            # Delete existing tips
            instance.tips.all().delete()
            # Create new tips
            for tip_data in tips_data:
                Tip.objects.create(recipe=instance, **tip_data)
        
        # Update tags
        if tags_data is not None:
            instance.tags.set(tags_data)
        
        return instance


class FavoriteRecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteRecipe
        fields = ['id', 'recipe', 'added_at']
        read_only_fields = ['user', 'added_at']


class LikedRecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LikedRecipe
        fields = ['id', 'recipe', 'liked_at']
        read_only_fields = ['user', 'liked_at']