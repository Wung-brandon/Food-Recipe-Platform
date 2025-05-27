# recipes/serializers.py
from rest_framework import serializers
from .models import (
    Category, Tag, Recipe, Ingredient, Step, Tip,
    Comment, Rating, FavoriteRecipe, LikedRecipe
)
from django.contrib.auth import get_user_model
import json
from decimal import Decimal

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile_image']
        
    # Assuming the User model has a profile_image field. If not, you'd need to adjust this.
    profile_image = serializers.SerializerMethodField()
    
    def get_profile_image(self, obj):
        # Check if user has a profile with an image
        # This depends on how your profile is structured
        if hasattr(obj, 'profile') and obj.profile.profile_picture:
            return obj.profile.profile_picture.url
        return None


class CategorySerializer(serializers.ModelSerializer):
    recipe_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image', 'description', 'recipe_count']

    def get_recipe_count(self, obj):
        # Use the related_name 'recipes' from Recipe.category FK
        return obj.recipes.count()


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'amount']
        read_only_fields = ['id']


class StepSerializer(serializers.ModelSerializer):
    class Meta:
        model = Step
        fields = ['id', 'description']


class TipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tip
        fields = ['id', 'description']


class CommentReplySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'username', 'text', 'created_at']
        read_only_fields = ['user', 'created_at']

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    replies = CommentReplySerializer(many=True, read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'username', 'text', 'created_at', 'updated_at', 'parent', 'replies']
        read_only_fields = ['user', 'created_at', 'updated_at']

    def create(self, validated_data):
        user = self.context['request'].user if self.context['request'].user.is_authenticated else None
        recipe = self.context['recipe']
        parent = validated_data.pop('parent', None)
        
        return Comment.objects.create(
            user=user, 
            recipe=recipe, 
            parent=parent,
            **validated_data
        )

class RatingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Rating
        fields = ['id', 'user', 'username', 'value', 'created_at']
        read_only_fields = ['user', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user if self.context['request'].user.is_authenticated else None
        recipe = self.context['recipe']
        username = validated_data.get('username', user.username if user else 'Anonymous')
        
        # Update the rating if it exists, otherwise create it
        rating, created = Rating.objects.update_or_create(
            user=user,
            recipe=recipe,
            defaults={
                'value': validated_data['value'],
                'username': username
            }
        )
        return rating

class ReviewSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=100)
    rating = serializers.DecimalField(
        max_digits=3,
        decimal_places=1,
        min_value=Decimal('1.0'),
        max_value=Decimal('5.0')
    )
    review = serializers.CharField()
    created_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        recipe = self.context['recipe']
        user = self.context['request'].user if self.context['request'].user.is_authenticated else None
        username = validated_data['username']
        rating_value = validated_data['rating']
        review_text = validated_data['review']

        # Create comment
        comment = Comment.objects.create(
            recipe=recipe,
            user=user,
            username=username,
            text=review_text
        )

        # Create or update rating
        rating, created = Rating.objects.update_or_create(
            recipe=recipe,
            user=user,
            defaults={
                'value': rating_value,
                'username': username
            }
        )

        return {
            "id": comment.id,
            "username": username,
            "rating": float(rating_value),
            "review": review_text,
            "created_at": comment.created_at,
            "user": {
                "name": username,
                "avatar": user.profile_picture.url if user and hasattr(user, 'profile_picture') and user.profile_picture else '/api/placeholder/50/50'
            }
        }

    def to_representation(self, instance):
        return instance

class ReviewListSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    rating = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'username', 'text', 'created_at', 'rating', 'replies']
    
    def get_rating(self, obj):
        # Get the rating for this comment's user and recipe
        try:
            rating = Rating.objects.get(
                recipe=obj.recipe,
                user=obj.user if obj.user else None,
                username=obj.username
            )
            return float(rating.value)
        except Rating.DoesNotExist:
            return 0
    
    def get_replies(self, obj):
        # Get replies to this comment
        replies = Comment.objects.filter(parent=obj).order_by('created_at')
        return CommentReplySerializer(replies, many=True).data

class ReviewSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=100)
    rating = serializers.DecimalField(max_digits=3, decimal_places=1)
    review = serializers.CharField()
    created_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        recipe = self.context['recipe']
        user = self.context['request'].user if self.context['request'].user.is_authenticated else None
        username = validated_data['username']
        rating_value = validated_data['rating']
        review_text = validated_data['review']

        comment = Comment.objects.create(
            recipe=recipe,
            user=user,
            username=username,
            text=review_text
        )
        rating = Rating.objects.create(
            recipe=recipe,
            user=user,
            username=username,
            value=rating_value
        )
        # Return created_at from comment (or rating)
        return {
            "username": username,
            "rating": float(rating.value),
            "review": review_text,
            "created_at": comment.created_at
        }

    def to_representation(self, instance):
        # instance is the dict returned from create()
        return {
            "username": instance["username"],
            "rating": instance["rating"],
            "review": instance["review"],
            "created_at": instance["created_at"]
        }
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
            'id', 'title', 'slug', 'description', 'image', 'video',
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
    ingredients = IngredientSerializer(many=True, read_only=True, source='ingredient_items')
    steps = StepSerializer(many=True, read_only=True)
    tips = TipSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta(RecipeListSerializer.Meta):
        fields = RecipeListSerializer.Meta.fields + ['ingredients', 'steps', 'tips', 'tags', 'comments']



class RecipeCreateUpdateSerializer(serializers.ModelSerializer):
    # These will be handled as raw data and processed manually
    ingredients = serializers.ListField(required=True, allow_empty=False, write_only=True)
    steps = serializers.ListField(required=True, allow_empty=False, write_only=True)
    tips = serializers.ListField(required=False, allow_empty=True, write_only=True)
    tags = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Tag.objects.all(),
        required=False
    )
    category = serializers.CharField()
    
    class Meta:
        model = Recipe
        fields = [
            'title', 'description', 'image', 'video', 'preparation_time',
            'cooking_time', 'servings', 'difficulty', 'calories',
            'category', 'ingredients', 'steps', 'tips', 'tags'
        ]
    
    def to_internal_value(self, data):
        # Don't copy the whole QueryDict if it contains files!
        # Instead, parse only the JSON string fields and build a dict for DRF
        parsed_data = {}
        for field in ['ingredients', 'steps', 'tips', 'tags']:
            value = data.get(field)
            if value and isinstance(value, str):
                try:
                    loaded = json.loads(value)
                    # Handle double-nested arrays
                    if isinstance(loaded, list) and len(loaded) == 1 and isinstance(loaded[0], list):
                        loaded = loaded[0]
                    parsed_data[field] = loaded
                except (json.JSONDecodeError, ValueError) as e:
                    raise serializers.ValidationError({field: f"Invalid JSON format: {str(e)}"})
            elif value is not None:
                parsed_data[field] = value

        # Add all other fields (including files) as-is
        for key in data:
            if key not in parsed_data:
                parsed_data[key] = data.get(key)

        return super().to_internal_value(parsed_data)
    def validate_ingredients(self, value):
        """Custom validation for ingredients"""
        print(f"Validating ingredients: {value}")  # Debug log
        
        # Handle double-nested arrays
        if isinstance(value, list) and len(value) == 1 and isinstance(value[0], list):
            value = value[0]
            print(f"Fixed double-nested ingredients: {value}")
        
        if not value or len(value) == 0:
            raise serializers.ValidationError("At least one ingredient is required.")
        
        validated_ingredients = []
        for i, ingredient in enumerate(value):
            print(f"Processing ingredient {i+1}: {ingredient} (type: {type(ingredient)})")  # Debug log
            
            if not isinstance(ingredient, dict):
                raise serializers.ValidationError(f"Ingredient {i+1} must be an object with name and amount.")
            
            name = str(ingredient.get('name', '')).strip() if ingredient.get('name') is not None else ''
            amount = str(ingredient.get('amount', '')).strip() if ingredient.get('amount') is not None else ''
            
            if not name:
                raise serializers.ValidationError(f"Ingredient {i+1} name is required.")
            if not amount:
                raise serializers.ValidationError(f"Ingredient {i+1} amount is required.")
            
            validated_ingredients.append({
                'name': name,
                'amount': amount
            })
        
        print(f"Validated ingredients: {validated_ingredients}")  # Debug log
        return validated_ingredients
    
    def validate_steps(self, value):
        """Custom validation for steps"""
        print(f"Validating steps: {value}")  # Debug log
        
        # Handle double-nested arrays
        if isinstance(value, list) and len(value) == 1 and isinstance(value[0], list):
            value = value[0]
            print(f"Fixed double-nested steps: {value}")
        
        if not value or len(value) == 0:
            raise serializers.ValidationError("At least one step is required.")
        
        validated_steps = []
        for i, step in enumerate(value):
            print(f"Processing step {i+1}: {step} (type: {type(step)})")  # Debug log
            
            if not isinstance(step, dict):
                raise serializers.ValidationError(f"Step {i+1} must be an object with description.")
            
            description = str(step.get('description', '')).strip() if step.get('description') is not None else ''
            if not description:
                raise serializers.ValidationError(f"Step {i+1} description is required.")
            
            validated_steps.append({
                'description': description
            })
        
        print(f"Validated steps: {validated_steps}")  # Debug log
        return validated_steps
    
    def validate_tips(self, value):
        """Custom validation for tips"""
        print(f"Validating tips: {value}")  # Debug log
        
        # Handle double-nested arrays
        if isinstance(value, list) and len(value) == 1 and isinstance(value[0], list):
            value = value[0]
            print(f"Fixed double-nested tips: {value}")
        
        if not value:
            return []
        
        validated_tips = []
        for i, tip in enumerate(value):
            print(f"Processing tip {i+1}: {tip} (type: {type(tip)})")  # Debug log
            
            if isinstance(tip, str):
                tip_desc = tip.strip()
            elif isinstance(tip, dict):
                tip_desc = str(tip.get('description', '')).strip() if tip.get('description') is not None else ''
            else:
                continue
            
            if tip_desc:
                validated_tips.append({'description': tip_desc})
        
        print(f"Validated tips: {validated_tips}")  # Debug log
        return validated_tips
    
    def validate_category(self, value):
        """Handle category as either ID or name"""
        print(f"Validating category: {value}")  # Debug log
        
        if isinstance(value, str) and not value.isdigit():
            try:
                category = Category.objects.get(name=value)
                return category.id
            except Category.DoesNotExist:
                # Create new category if it doesn't exist
                category = Category.objects.create(name=value)
                return category.id
        else:
            try:
                category_id = int(value)
                if not Category.objects.filter(id=category_id).exists():
                    raise serializers.ValidationError("Invalid category ID")
                return category_id
            except (ValueError, TypeError):
                raise serializers.ValidationError("Invalid category format")
    
    def validate_tags(self, value):
        """Handle tags as either IDs or names"""
        print(f"Validating tags: {value}")  # Debug log
        
        if not value:
            return []
        
        tag_ids = []
        for tag_value in value:
            if isinstance(tag_value, str) and not str(tag_value).isdigit():
                tag, created = Tag.objects.get_or_create(name=tag_value)
                tag_ids.append(tag.id)
            else:
                try:
                    tag_id = int(tag_value)
                    if Tag.objects.filter(id=tag_id).exists():
                        tag_ids.append(tag_id)
                    else:
                        raise serializers.ValidationError(f"Invalid tag ID: {tag_id}")
                except (ValueError, TypeError):
                    raise serializers.ValidationError(f"Invalid tag format: {tag_value}")
        
        return tag_ids
    
    def validate(self, data):
        print(f"Final validation data: {data}")  # Debug log
        
        user = self.context['request'].user
        
        if not user.role == 'CHEF':
            raise serializers.ValidationError("Only chefs can create recipes.")
        
        return data
    
    def create(self, validated_data):
        print(f"Creating recipe with data: {validated_data}")  # Debug log
        
        ingredients_data = validated_data.pop('ingredients')
        steps_data = validated_data.pop('steps')
        tips_data = validated_data.pop('tips', [])
        tags_data = validated_data.pop('tags', [])
        
        user = self.context['request'].user
        category_id = validated_data.pop('category')
        category = Category.objects.get(id=category_id)
        
        recipe = Recipe.objects.create(category=category, **validated_data)
        
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
        
        print(f"Recipe created successfully: {recipe}")  # Debug log
        return recipe
    
    def update(self, instance, validated_data):
        ingredients_data = validated_data.pop('ingredients', None)
        steps_data = validated_data.pop('steps', None)
        tips_data = validated_data.pop('tips', None)
        tags_data = validated_data.pop('tags', None)
        
        if 'category' in validated_data:
            category_id = validated_data.pop('category')
            instance.category = Category.objects.get(id=category_id)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if ingredients_data is not None:
            instance.ingredient_items.all().delete()
            for ingredient_data in ingredients_data:
                Ingredient.objects.create(recipe=instance, **ingredient_data)
        
        if steps_data is not None:
            instance.steps.all().delete()
            for step_data in steps_data:
                Step.objects.create(recipe=instance, **step_data)
        
        if tips_data is not None:
            instance.tips.all().delete()
            for tip_data in tips_data:
                Tip.objects.create(recipe=instance, **tip_data)
        
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