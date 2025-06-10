from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Q
from django.utils import timezone
from .models import UserPreference, RecipeView, AIRecommendation, IngredientSearchHistory
from recipe.models import Recipe
from .serializers import (
    UserPreferenceSerializer, 
    RecipeViewSerializer, 
    AIRecommendationSerializer,
    IngredientSearchSerializer,
    IngredientSearchResultSerializer
)
from .ai_service import DeepSeekAIService
import logging

logger = logging.getLogger(__name__)

class UserPreferencesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get user preferences"""
        try:
            preference = UserPreference.objects.get(user=request.user)
            serializer = UserPreferenceSerializer(preference)
            return Response(serializer.data)
        except UserPreference.DoesNotExist:
            return Response({
                'dietary_needs': [],
                'cuisine_preferences': [],
                'disliked_ingredients': [],
                'cooking_skill_level': 'beginner',
                'preferred_cooking_time': 30
            })

    def post(self, request):
        """Update user preferences"""
        preference, created = UserPreference.objects.get_or_create(user=request.user)
        serializer = UserPreferenceSerializer(preference, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AIRecommendationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get AI-powered recipe recommendations for the user"""
        try:
            limit = int(request.query_params.get('limit', 10))
            limit = min(limit, 20)  # Cap at 20 to avoid performance issues
            
            logger.info(f"[AIRecommendationsView] Getting recommendations for user {request.user.id}")
            
            ai_service = DeepSeekAIService()
            
            # Get AI recommendations
            ai_recommendations = ai_service.get_recipe_recommendations(request.user, limit)
            logger.info(f"[AIRecommendationsView] Got {len(ai_recommendations)} AI recommendations")
            
            recommended_recipes = []
            
            for rec in ai_recommendations:
                try:
                    recipe_id = rec.get('recipe_id')
                    if not recipe_id:
                        logger.warning(f"[AIRecommendationsView] No recipe_id in recommendation: {rec}")
                        continue
                        
                    recipe = Recipe.objects.get(id=recipe_id)
                    
                    # Store AI recommendation in database
                    ai_rec, created = AIRecommendation.objects.get_or_create(
                        user=request.user,
                        recipe=recipe,
                        defaults={
                            'confidence_score': rec.get('confidence_score', 0.0),
                            'reason': rec.get('reason', 'AI recommendation')
                        }
                    )
                    
                    # Update if not created
                    if not created:
                        ai_rec.confidence_score = rec.get('confidence_score', ai_rec.confidence_score)
                        ai_rec.reason = rec.get('reason', ai_rec.reason)
                        ai_rec.save()
                    
                    recommended_recipes.append(recipe)
                    
                except Recipe.DoesNotExist:
                    logger.warning(f"[AIRecommendationsView] Recipe {recipe_id} not found")
                    continue
                except Exception as e:
                    logger.error(f"[AIRecommendationsView] Error processing recommendation {rec}: {str(e)}")
                    continue
            
            # If no AI recommendations worked, fallback to recent recipes
            if not recommended_recipes:
                logger.info("[AIRecommendationsView] No AI recommendations found, using fallback")
                viewed_recipe_ids = RecipeView.objects.filter(user=request.user).values_list('recipe_id', flat=True)
                recommended_recipes = Recipe.objects.exclude(id__in=viewed_recipe_ids)[:limit]
            
            logger.info(f"[AIRecommendationsView] Returning {len(recommended_recipes)} recipes")
            serializer = RecipeViewSerializer(recommended_recipes, many=True)
            return Response({
                'recommendations': serializer.data,
                'total_count': len(recommended_recipes),
                'ai_powered': len(ai_recommendations) > 0
            })
            
        except Exception as e:
            logger.error(f"[AIRecommendationsView] Error getting AI recommendations: {str(e)}")
            return Response(
                {'error': 'Failed to get recommendations', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class IngredientBasedSearchView(APIView):
    permission_classes = [permissions.AllowAny]  # Allow anonymous users

    def get(self, request):
        """Search recipes based on available ingredients"""
        try:
            # Get ingredients from query params
            ingredients_param = request.query_params.get('ingredients', '')
            if not ingredients_param:
                return Response(
                    {'error': 'Please provide ingredients parameter'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            ingredients = [ing.strip() for ing in ingredients_param.split(',') if ing.strip()]
            max_results = int(request.query_params.get('max_results', 10))
            max_results = min(max_results, 20)  # Cap at 20
            
            if not ingredients:
                return Response(
                    {'error': 'Please provide at least one ingredient'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            logger.info(f"[IngredientBasedSearchView] Searching with ingredients: {ingredients}")
            
            # Validate input
            serializer = IngredientSearchSerializer(data={
                'ingredients': ingredients,
                'max_results': max_results
            })
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Use AI service to find matching recipes
            ai_service = DeepSeekAIService()
            search_result = ai_service.get_ingredient_based_recipes(ingredients, max_results)

            logger.info(f"[IngredientBasedSearchView] AI search result: {search_result}")

            # Use IngredientSearchResultSerializer to serialize the full result
            serializer = IngredientSearchResultSerializer(search_result)
            response_data = serializer.data
            response_data['total_found'] = len(search_result.get('recipes', []))
            response_data['search_ingredients'] = ingredients

            logger.info(f"[IngredientBasedSearchView] Returning response with {response_data['total_found']} recipes")
            return Response(response_data)
        except Exception as e:
            logger.error(f"[IngredientBasedSearchView] Error in ingredient search: {str(e)}")
            return Response(
                {'error': 'Search failed. Please try again.', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def track_recipe_view(request, recipe_id):
    """Track when a user views a recipe for better recommendations"""
    try:
        recipe = get_object_or_404(Recipe, id=recipe_id)
        
        # Create or update recipe view
        recipe_view, created = RecipeView.objects.get_or_create(
            user=request.user,
            recipe=recipe,
            defaults={'interaction_type': 'view'}
        )
        
        if not created:
            # Update timestamp if already exists
            recipe_view.viewed_at = timezone.now()
            recipe_view.save()
        
        return Response({'status': 'tracked'}, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error tracking recipe view: {str(e)}")
        return Response(
            {'error': 'Failed to track view'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_recommendation_history(request):
    """Get user's recommendation history"""
    try:
        recommendations = AIRecommendation.objects.filter(user=request.user).order_by('-created_at')[:20]
        serializer = AIRecommendationSerializer(recommendations, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error getting recommendation history: {str(e)}")
        return Response(
            {'error': 'Failed to get history'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_ingredient_search_history(request):
    """Get user's ingredient search history"""
    try:
        searches = IngredientSearchHistory.objects.filter(user=request.user).order_by('-search_timestamp')[:10]
        history_data = []
        
        for search in searches:
            history_data.append({
                'id': search.id,
                'ingredients': search.ingredients,
                'results_count': len(search.results) if search.results else 0,
                'search_timestamp': search.search_timestamp
            })
        
        return Response(history_data)
    except Exception as e:
        logger.error(f"Error getting search history: {str(e)}")
        return Response(
            {'error': 'Failed to get search history'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )