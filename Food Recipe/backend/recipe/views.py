from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Count, Q, Prefetch
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Category, Tag, Recipe, Comment, Rating, Ingredient,
    FavoriteRecipe, LikedRecipe, MealPlan, MealPlanEntry
)
from .serializers import (
    CategorySerializer, TagSerializer, 
    RecipeListSerializer, RecipeDetailSerializer, RecipeCreateUpdateSerializer,
    CommentSerializer, RatingSerializer, IngredientSerializer,
    FavoriteRecipeSerializer, LikedRecipeSerializer, ReviewSerializer,
    CommentReplySerializer, ReviewListSerializer,
    MealPlanSerializer, MealPlanEntrySerializer, ShoppingListSerializer
)
from .permissions import IsAuthorOrReadOnly, IsVerifiedChef
from .filters import RecipeFilter
from django.contrib.postgres.search import TrigramSimilarity
from .utils import filter_recipes_by_preferences, select_recipes_for_meal_plan, aggregate_ingredients
from datetime import date, timedelta
import logging
import traceback
from analytics.signals import track_recipe_view, track_recipe_share

logger = logging.getLogger(__name__)

class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class RecipeReviewView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, recipe_id):
        """Get all reviews for a recipe"""
        recipe = get_object_or_404(Recipe, id=recipe_id)
        
        # Get all top-level comments (reviews) for this recipe
        reviews = Comment.objects.filter(
            recipe=recipe, 
            parent__isnull=True
        ).order_by('-created_at')
        
        serializer = ReviewListSerializer(reviews, many=True)

        # Calculate rating distribution
        rating_counts = {star: 0 for star in range(1, 6)}
        total_ratings = Rating.objects.filter(recipe=recipe).count()
        for star in range(1, 6):
            rating_counts[star] = Rating.objects.filter(recipe=recipe, value=star).count()
        rating_percentages = {
            star: round((rating_counts[star] / total_ratings) * 100, 1) if total_ratings else 0
            for star in range(1, 6)
        }
        return Response({
            'results': serializer.data,
            'count': reviews.count(),
            'rating_percentages': rating_percentages,  # <-- Add this
        })

    def post(self, request, recipe_id):
        """Submit a review for a recipe"""
        recipe = get_object_or_404(Recipe, id=recipe_id)
        serializer = ReviewSerializer(data=request.data, context={'request': request, 'recipe': recipe})
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        return Response(review, status=status.HTTP_201_CREATED)
        
        
class RecentReviewsView(generics.ListAPIView):
    """
    API endpoint to get recent 3 reviews for each recipe owned by the authenticated chef
    """
    serializer_class = ReviewListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Get recipes owned by the authenticated user (chef)
        chef_recipes = Recipe.objects.filter(
            chef=self.request.user
        ).prefetch_related(
            Prefetch(
                'comments',
                queryset=Comment.objects.filter(
                    text__isnull=False,
                    text__gt=''
                ).select_related('user').order_by('-created_at')[:3],
                to_attr='recent_comments'
            )
        )
        
        # Collect all recent comments from all recipes
        recent_comments = []
        for recipe in chef_recipes:
            for comment in recipe.recent_comments:
                recent_comments.append(comment)
        
        # Sort all comments by creation date and return the most recent ones
        recent_comments.sort(key=lambda x: x.created_at, reverse=True)
        
        # Return the most recent 3 comments overall
        return recent_comments[:3]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Add recipe title to each comment
        data = []
        for item in serializer.data:
            comment_obj = Comment.objects.get(id=item['id'])
            item['recipe_title'] = comment_obj.recipe.title
            data.append(item)
        
        return Response({
            'success': True,
            'data': data,
            'count': len(data)
        })

# Alternative approach - if you want to get recent reviews grouped by recipe
class RecentReviewsByRecipeView(generics.ListAPIView):
    """
    API endpoint to get recent 3 reviews for each recipe, grouped by recipe
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        # Get recipes owned by the authenticated user (chef)
        chef_recipes = Recipe.objects.filter(
            chef=request.user
        ).prefetch_related(
            Prefetch(
                'comments',
                queryset=Comment.objects.filter(
                    text__isnull=False,
                    text__gt=''
                ).select_related('user').order_by('-created_at')[:3],
                to_attr='recent_comments'
            )
        )
        
        data = []
        for recipe in chef_recipes:
            if recipe.recent_comments:  # Only include recipes with comments
                recipe_data = {
                    'recipe_id': recipe.id,
                    'recipe_title': recipe.title,
                    'recent_reviews': ReviewListSerializer(recipe.recent_comments, many=True).data
                }
                data.append(recipe_data)
        
        return Response({
            'success': True,
            'data': data,
            'count': len(data)
        })

class CommentReplyView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, recipe_id, comment_id):
        """Reply to a comment"""
        recipe = get_object_or_404(Recipe, id=recipe_id)
        parent_comment = get_object_or_404(Comment, id=comment_id, recipe=recipe)
        
        data = request.data.copy()
        data['parent'] = parent_comment.id
        
        serializer = CommentSerializer(
            data=data,
            context={'request': request, 'recipe': recipe}
        )
        
        if serializer.is_valid():
            reply = serializer.save()
            return Response({
                'detail': 'Reply submitted successfully.',
                'reply': CommentReplySerializer(reply).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class TagListCreateView(generics.ListCreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

class IngredientListCreateView(generics.ListCreateAPIView):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

class TagDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.IsAdminUser]

class RecipeListCreateView(generics.ListCreateAPIView):
    queryset = Recipe.objects.all()
    # Change permission classes to include IsVerifiedChef
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = RecipeFilter
    search_fields = ['title', 'description', 'author__username', 'category__name', 'tags__name']
    ordering_fields = ['created_at', 'preparation_time', 'cooking_time', 'servings']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RecipeCreateUpdateSerializer
        return RecipeListSerializer
    
    def get_queryset(self):
        queryset = Recipe.objects.annotate(
            average_rating=Avg('ratings__value'),
            rating_count=Count('ratings', distinct=True),
            like_count=Count('likes', distinct=True)
        )
        
        # Filter by user if provided
        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(author_id=user_id)
        
        # Filter favorites
        favorites = self.request.query_params.get('favorites')
        if favorites and self.request.user.is_authenticated:
            queryset = queryset.filter(favorites=self.request.user)
        
        # Filter liked
        liked = self.request.query_params.get('liked')
        if liked and self.request.user.is_authenticated:
            queryset = queryset.filter(likes=self.request.user)
        
        return queryset
    
    def perform_create(self, serializer):
        # Get user object
        user = self.request.user
        
        # Double-check user's chef and verification status before creating
        if not user.role == 'CHEF':
            raise PermissionDenied("Only chefs can create recipes.")
        
        # if not user.is_verified:
        #     raise PermissionDenied("Your account must be verified to create recipes.")
        
        # try:
        #     chef_profile = user.chef_profile
        #     if chef_profile.verification_status != 'VERIFIED':
        #         raise PermissionDenied("Your chef profile must be verified to create recipes.")
        # except:
        #     raise PermissionDenied("Chef profile not found or not properly set up.")
        
        # If all checks pass, save the recipe
        serializer.save(author=user)


class RecipeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Recipe.objects.all()
    lookup_field = 'id'
    # Include IsVerifiedChef permission to ensure only verified chefs can update
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return RecipeCreateUpdateSerializer
        return RecipeDetailSerializer
    
    def get_queryset(self):
        return Recipe.objects.annotate(
            average_rating=Avg('ratings__value'),
            rating_count=Count('ratings', distinct=True),
            like_count=Count('likes', distinct=True)
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Track the view
        track_recipe_view(
            recipe=instance,
            user=request.user if request.user.is_authenticated else None,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT'),
            referrer=request.META.get('HTTP_REFERER'),
            session_key=request.session.session_key if hasattr(request, 'session') else None,
            time_spent=0  # You can update this if you track time spent
        )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

# Add this new view to create recipe drafts that will be ready for publishing once verified
class RecipeDraftCreateView(generics.CreateAPIView):
    serializer_class = RecipeCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        user = self.request.user
        
        # Check if user is a chef (but don't require verification)
        if not user.role == 'CHEF':
            raise PermissionDenied("Only chefs can create recipe drafts.")
        
        # Save the recipe as draft (assuming you add a 'is_draft' field to Recipe model)
        serializer.save(author=user, is_draft=True)

class UserRecipesView(generics.ListAPIView):
    serializer_class = RecipeListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Recipe.objects.filter(author=self.request.user).annotate(
            average_rating=Avg('ratings__value'),
            rating_count=Count('ratings', distinct=True),
            like_count=Count('likes', distinct=True)
        )


class UserFavoritesView(generics.ListAPIView):
    serializer_class = RecipeListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Recipe.objects.filter(favorites=self.request.user).annotate(
            average_rating=Avg('ratings__value'),
            rating_count=Count('ratings', distinct=True),
            like_count=Count('likes', distinct=True)
        )

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        recipe_slug = self.kwargs.get('recipe_slug')
        return Comment.objects.filter(recipe__slug=recipe_slug)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        recipe_slug = self.kwargs.get('recipe_slug')
        context['recipe'] = get_object_or_404(Recipe, slug=recipe_slug)
        return context


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthorOrReadOnly]
    
    def get_queryset(self):
        recipe_slug = self.kwargs.get('recipe_slug')
        return Comment.objects.filter(recipe__slug=recipe_slug)


class RateRecipeView(generics.CreateAPIView):
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        recipe_slug = self.kwargs.get('recipe_slug')
        context['recipe'] = get_object_or_404(Recipe, slug=recipe_slug)
        return context


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_favorite(request, recipe_id):
    recipe = get_object_or_404(Recipe, id=recipe_id)
    favorite, created = FavoriteRecipe.objects.get_or_create(
        user=request.user,
        recipe=recipe
    )
    
    if not created:
        # Recipe was already favorited, so remove it
        favorite.delete()
        return Response({'status': 'removed'}, status=status.HTTP_200_OK)
    
    return Response({'status': 'added'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_like(request, recipe_id):
    recipe = get_object_or_404(Recipe, id=recipe_id)
    like, created = LikedRecipe.objects.get_or_create(
        user=request.user,
        recipe=recipe
    )
    
    if not created:
        # Recipe was already liked, so remove it
        like.delete()
        return Response({'status': 'removed'}, status=status.HTTP_200_OK)
    
    return Response({'status': 'added'}, status=status.HTTP_201_CREATED)


class SearchRecipesView(generics.ListAPIView):
    serializer_class = RecipeListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if not query:
            return Recipe.objects.none()
        
        queryset = Recipe.objects.filter(
            Q(title__icontains=query) | 
            Q(description__icontains=query) |
            Q(category__name__icontains=query) |
            Q(tags__name__icontains=query) |
            Q(author__username__icontains=query)
        ).distinct().annotate(
            average_rating=Avg('ratings__value'),
            rating_count=Count('ratings', distinct=True),
            like_count=Count('likes', distinct=True)
        )
        
        return queryset


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def ingredient_based_search(request):
    """
    Search for recipes based on a list of ingredients.
    """
    ingredients_str = request.query_params.get('ingredients', '')
    if not ingredients_str:
        return Response({'detail': 'Please provide a comma-separated list of ingredients.'}, status=status.HTTP_400_BAD_REQUEST)

    ingredients_list = [ingredient.strip().lower() for ingredient in ingredients_str.split(',') if ingredient.strip()]

    # Find recipes where at least one ingredient matches
    # Using Q objects for partial matching on ingredient names
    ingredient_q_objects = Q()
    for ingredient in ingredients_list:
        ingredient_q_objects |= Q(ingredients__name__icontains=ingredient)

    # Filter recipes based on the ingredient matches
    recipes = Recipe.objects.filter(ingredient_q_objects).distinct().annotate(
        # You might want to consider a scoring mechanism here
        # to prioritize recipes that use more of the provided ingredients.
        # For simplicity, this example just returns all matching recipes.
        # A more advanced approach could involve counting matched ingredients per recipe.
        # Example (requires adjusting the model and potentially using a RawSQL or a more complex aggregation):
        # matched_ingredient_count=Count('ingredients', filter=ingredient_q_objects)
    ).annotate(
        # Original annotations
        # Consider adding logic to sort by the number of matched ingredients
        # .order_by('-matched_ingredient_count')
        average_rating=Avg('ratings__value'),
        like_count=Count('likes', distinct=True)
    )
    serializer = RecipeListSerializer(recipes, many=True)
    return Response(serializer.data)

class MealPlanListCreateView(generics.ListCreateAPIView):
    serializer_class = MealPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MealPlan.objects.filter(user=self.request.user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        """Override create method to provide detailed error handling"""
        try:
            user = request.user
            preferences = request.data.get('preferences', {})
            
            # Log the incoming request data
            logger.info(f"Meal plan creation request from user {user.id}")
            logger.info(f"Request data: {request.data}")
            logger.info(f"Preferences: {preferences}")

            # Validate that we have preferences
            if not preferences:
                error_msg = "No preferences provided in the request"
                logger.error(error_msg)
                return Response(
                    {'error': error_msg, 'detail': 'Preferences object is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate preference structure
            required_fields = ['num_days', 'meal_types']
            for field in required_fields:
                if field not in preferences:
                    error_msg = f"Missing required preference field: {field}"
                    logger.error(error_msg)
                    return Response(
                        {'error': error_msg, 'detail': f'Field {field} is required in preferences'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Extract and validate preferences
            try:
                num_days = int(preferences.get('num_days', 7))
                if num_days <= 0 or num_days > 30:
                    raise ValueError("num_days must be between 1 and 30")
            except (ValueError, TypeError) as e:
                error_msg = f"Invalid num_days value: {preferences.get('num_days')}"
                logger.error(f"{error_msg}. Error: {str(e)}")
                return Response(
                    {'error': error_msg, 'detail': 'num_days must be a valid integer between 1 and 30'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            meal_types = preferences.get('meal_types', [])
            if not isinstance(meal_types, list) or not meal_types:
                error_msg = "meal_types must be a non-empty list"
                logger.error(error_msg)
                return Response(
                    {'error': error_msg, 'detail': 'meal_types must be an array with at least one meal type'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate meal types
            valid_meal_types = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
            invalid_types = [mt for mt in meal_types if mt not in valid_meal_types]
            if invalid_types:
                error_msg = f"Invalid meal types: {invalid_types}"
                logger.error(error_msg)
                return Response(
                    {'error': error_msg, 'detail': f'Valid meal types are: {valid_meal_types}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Use utility function to filter recipes based on preferences
            try:
                filtered_recipes = filter_recipes_by_preferences(preferences)
                logger.info(f"Found {len(filtered_recipes)} recipes matching preferences")
            except Exception as e:
                error_msg = f"Error filtering recipes: {str(e)}"
                logger.error(error_msg)
                logger.error(traceback.format_exc())
                return Response(
                    {'error': error_msg, 'detail': 'Failed to filter recipes based on preferences'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            if not filtered_recipes:
                error_msg = "No recipes found matching your preferences"
                logger.error(f"{error_msg}. Preferences: {preferences}")
                return Response(
                    {'error': error_msg, 'detail': 'Try adjusting your dietary preferences or cooking time limits'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            num_meals = num_days * len(meal_types)
            logger.info(f"Planning {num_meals} meals for {num_days} days")

            try:
                selected_recipes = select_recipes_for_meal_plan(filtered_recipes, num_meals)
                logger.info(f"Selected {len(selected_recipes)} recipes for meal plan")
            except Exception as e:
                error_msg = f"Error selecting recipes for meal plan: {str(e)}"
                logger.error(error_msg)
                logger.error(traceback.format_exc())
                return Response(
                    {'error': error_msg, 'detail': 'Failed to generate recipe selection'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Create the meal plan with transaction to ensure atomicity
            start_date = date.today()
            end_date = start_date + timedelta(days=num_days - 1)

            with transaction.atomic():
                # Delete any existing meal plan for the user
                deleted_count = MealPlan.objects.filter(user=user).count()
                if deleted_count > 0:
                    MealPlan.objects.filter(user=user).delete()
                    logger.info(f"Deleted {deleted_count} existing meal plans for user {user.id}")

                # Create new meal plan
                meal_plan = MealPlan.objects.create(
                    user=user,
                    start_date=start_date,
                    end_date=end_date
                )
                logger.info(f"Created meal plan {meal_plan.id} for user {user.id}")

                # Create meal plan entries
                current_date = start_date
                recipe_index = 0
                entries_created = 0

                for day in range(num_days):
                    for meal_type in meal_types:
                        if recipe_index < len(selected_recipes):
                            MealPlanEntry.objects.create(
                                meal_plan=meal_plan,
                                recipe=selected_recipes[recipe_index],
                                date=current_date,
                                meal_type=meal_type
                            )
                            recipe_index += 1
                            entries_created += 1
                        else:
                            # Cycle back to beginning if we run out of recipes
                            recipe_index = 0
                            if selected_recipes:
                                MealPlanEntry.objects.create(
                                    meal_plan=meal_plan,
                                    recipe=selected_recipes[recipe_index],
                                    date=current_date,
                                    meal_type=meal_type
                                )
                                recipe_index += 1
                                entries_created += 1
                    current_date += timedelta(days=1)

                logger.info(f"Created {entries_created} meal plan entries")

            # Serialize the response
            serializer = self.get_serializer(meal_plan)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            logger.error(f"Validation error in meal plan creation: {str(e)}")
            return Response(
                {'error': 'Validation failed', 'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error in meal plan creation: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': 'Internal server error', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        # This method is no longer used since we override create()
        pass

class MealPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MealPlan.objects.all()
    serializer_class = MealPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionDenied("You do not have permission to access this meal plan.")
        return obj

class UserMealPlanView(generics.RetrieveAPIView):
    """Get the current user's active meal plan"""
    serializer_class = MealPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        # Get the user's most recent meal plan
        meal_plan = MealPlan.objects.filter(user=user).order_by('-start_date').first()
        if not meal_plan:
            from rest_framework.exceptions import NotFound
            raise NotFound("No meal plan found for this user.")
        return meal_plan

class MealPlanEntryListCreateView(generics.ListCreateAPIView):
    serializer_class = MealPlanEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        meal_plan_pk = self.kwargs.get('meal_plan_pk')
        return MealPlanEntry.objects.filter(meal_plan__pk=meal_plan_pk, meal_plan__user=self.request.user)

    def perform_create(self, serializer):
        meal_plan_pk = self.kwargs.get('meal_plan_pk')
        meal_plan = get_object_or_404(MealPlan, pk=meal_plan_pk, user=self.request.user)
        serializer.save(meal_plan=meal_plan)

class MealPlanEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MealPlanEntry.objects.all()
    serializer_class = MealPlanEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        if obj.meal_plan.user != self.request.user:
            raise PermissionDenied("You do not have permission to access this meal plan entry.")
        return obj

    def perform_update(self, serializer):
        if serializer.instance.meal_plan.user != self.request.user:
            raise PermissionDenied("You do not have permission to update this meal plan entry.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.meal_plan.user != self.request.user:
            raise PermissionDenied("You do not have permission to delete this meal plan entry.")
        instance.delete()

class ShoppingListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        meal_plan = get_object_or_404(MealPlan, pk=pk, user=request.user)
        recipes_in_plan = [entry.recipe for entry in meal_plan.entries.all()]

        if not recipes_in_plan:
            return Response({'ingredients': []})

        # Use utility function to aggregate ingredients
        shopping_list = aggregate_ingredients(recipes_in_plan)

        serializer = ShoppingListSerializer({'ingredients': shopping_list})
        return Response(serializer.data)