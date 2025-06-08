# analytics/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework import status
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
from collections import defaultdict
from recipe.models import Recipe
import logging

from .models import (
    RecipeView, RecipeLike, RecipeComment, RecipeShare, 
    RecipeSave, UserFollowing, DailyAnalyticsSummary
)
from .serializers import AnalyticsDataSerializer

logger = logging.getLogger(__name__)

class RecipeAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        time_range = request.query_params.get('range', '30days')
        
        # Log the authentication details for debugging
        logger.info(f"Analytics request from user: {user.id}, time_range: {time_range}")
        print(f"DEBUG: Analytics request from user: {user.id}, time_range: {time_range}")
        print(f"DEBUG: Authorization header: {request.META.get('HTTP_AUTHORIZATION', 'Not found')}")
        
        # Calculate date range
        end_date = timezone.now().date()
        if time_range == '7days':
            start_date = end_date - timedelta(days=7)
        elif time_range == '90days':
            start_date = end_date - timedelta(days=90)
        elif time_range == '12months':
            start_date = end_date - timedelta(days=365)
        else:  # 30days
            start_date = end_date - timedelta(days=30)
        
        try:
            # Get user's recipes
            user_recipes = Recipe.objects.filter(author=user)
            logger.info(f"Found {user_recipes.count()} recipes for user {user.id}")
            
            # Calculate previous period for comparison
            period_length = (end_date - start_date).days
            previous_start = start_date - timedelta(days=period_length)
            previous_end = start_date
            
            analytics_data = {
                'viewsData': self._get_views_data(user_recipes, start_date, end_date, time_range),
                'recipesPerformance': self._get_recipes_performance(user_recipes, start_date, end_date),
                'followers': self._get_followers_data(user, start_date, end_date, previous_start, previous_end),
                'engagement': self._get_engagement_data(user_recipes, start_date, end_date, previous_start, previous_end),
                'topRecipes': self._get_top_recipes(user_recipes, start_date, end_date),
                'categoryDistribution': self._get_category_distribution(user_recipes, start_date, end_date)
            }
            
            # For debugging - let's return simplified data if serializer is not available
            try:
                serializer = AnalyticsDataSerializer(analytics_data)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as serializer_error:
                logger.warning(f"Serializer error: {serializer_error}, returning raw data")
                return Response(analytics_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching analytics data for user {user.id}: {str(e)}")
            print(f"DEBUG: Error details: {str(e)}")
            return Response(
                {'error': f'Failed to fetch analytics data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_views_data(self, user_recipes, start_date, end_date, time_range):
        """Get views data aggregated by time period"""
        views_data = []
        
        try:
            if time_range == '12months':
                # Monthly aggregation - simplified
                for i in range(12):
                    month_start = end_date.replace(day=1) - timedelta(days=30*i)
                    month_end = month_start + timedelta(days=30)
                    
                    views = RecipeView.objects.filter(
                        recipe__in=user_recipes,
                        viewed_at__date__range=[month_start, month_end]
                    ).count() if user_recipes.exists() else 0
                    
                    unique_visitors = RecipeView.objects.filter(
                        recipe__in=user_recipes,
                        viewed_at__date__range=[month_start, month_end]
                    ).values('ip_address').distinct().count() if user_recipes.exists() else 0
                    
                    views_data.append({
                        'name': month_start.strftime('%b %Y'),
                        'views': views,
                        'uniqueVisitors': unique_visitors
                    })
            else:
                # Daily aggregation
                days = 7 if time_range == '7days' else (90 if time_range == '90days' else 30)
                for i in range(days):
                    date = end_date - timedelta(days=i)
                    
                    views = RecipeView.objects.filter(
                        recipe__in=user_recipes,
                        viewed_at__date=date
                    ).count() if user_recipes.exists() else 0
                    
                    unique_visitors = RecipeView.objects.filter(
                        recipe__in=user_recipes,
                        viewed_at__date=date
                    ).values('ip_address').distinct().count() if user_recipes.exists() else 0
                    
                    views_data.append({
                        'name': date.strftime('%m/%d'),
                        'views': views,
                        'uniqueVisitors': unique_visitors
                    })
            
            return list(reversed(views_data))
        except Exception as e:
            logger.error(f"Error in _get_views_data: {str(e)}")
            return []
    
    def _get_recipes_performance(self, user_recipes, start_date, end_date):
        """Get performance data for all user recipes"""
        performance_data = []
        
        try:
            for recipe in user_recipes[:10]:  # Limit to top 10 for performance
                views = RecipeView.objects.filter(
                    recipe=recipe,
                    viewed_at__date__range=[start_date, end_date]
                ).count()
                
                likes = RecipeLike.objects.filter(
                    recipe=recipe,
                    created_at__date__range=[start_date, end_date]
                ).count()
                
                comments = RecipeComment.objects.filter(
                    recipe=recipe,
                    created_at__date__range=[start_date, end_date]
                ).count()
                
                performance_data.append({
                    'name': recipe.title[:30] + '...' if len(recipe.title) > 30 else recipe.title,
                    'views': views,
                    'likes': likes,
                    'comments': comments
                })
        except Exception as e:
            logger.error(f"Error in _get_recipes_performance: {str(e)}")
        
        return performance_data
    
    def _get_followers_data(self, user, start_date, end_date, previous_start, previous_end):
        """Get followers count and growth with percentage change"""
        try:
            total_followers = UserFollowing.objects.filter(following=user).count()
            
            current_new_followers = UserFollowing.objects.filter(
                following=user,
                created_at__date__range=[start_date, end_date]
            ).count()
            
            previous_new_followers = UserFollowing.objects.filter(
                following=user,
                created_at__date__range=[previous_start, previous_end]
            ).count()
            
            # Calculate growth percentage
            if previous_new_followers > 0:
                growth_percentage = round(((current_new_followers - previous_new_followers) / previous_new_followers) * 100, 1)
            else:
                growth_percentage = 100 if current_new_followers > 0 else 0
            
            return {
                'count': total_followers,
                'growth': current_new_followers,
                'growthPercentage': growth_percentage
            }
        except Exception as e:
            logger.error(f"Error in _get_followers_data: {str(e)}")
            return {'count': 0, 'growth': 0, 'growthPercentage': 0}
    
    def _get_engagement_data(self, user_recipes, start_date, end_date, previous_start, previous_end):
        """Get total engagement metrics with percentage changes"""
        try:
            # Current period
            current_likes = RecipeLike.objects.filter(
                recipe__in=user_recipes,
                created_at__date__range=[start_date, end_date]
            ).count() if user_recipes.exists() else 0
            
            current_comments = RecipeComment.objects.filter(
                recipe__in=user_recipes,
                created_at__date__range=[start_date, end_date]
            ).count() if user_recipes.exists() else 0
            
            current_shares = RecipeShare.objects.filter(
                recipe__in=user_recipes,
                shared_at__date__range=[start_date, end_date]
            ).count() if user_recipes.exists() else 0
            
            current_saves = RecipeSave.objects.filter(
                recipe__in=user_recipes,
                saved_at__date__range=[start_date, end_date]
            ).count() if user_recipes.exists() else 0
            
            # Previous period
            previous_likes = RecipeLike.objects.filter(
                recipe__in=user_recipes,
                created_at__date__range=[previous_start, previous_end]
            ).count() if user_recipes.exists() else 0
            
            previous_comments = RecipeComment.objects.filter(
                recipe__in=user_recipes,
                created_at__date__range=[previous_start, previous_end]
            ).count() if user_recipes.exists() else 0
            
            previous_shares = RecipeShare.objects.filter(
                recipe__in=user_recipes,
                shared_at__date__range=[previous_start, previous_end]
            ).count() if user_recipes.exists() else 0
            
            previous_saves = RecipeSave.objects.filter(
                recipe__in=user_recipes,
                saved_at__date__range=[previous_start, previous_end]
            ).count() if user_recipes.exists() else 0
            
            # Calculate percentage changes
            def calculate_percentage_change(current, previous):
                if previous == 0:
                    return 100 if current > 0 else 0
                return round(((current - previous) / previous) * 100, 1)
            
            return {
                'likes': current_likes,
                'comments': current_comments,
                'shares': current_shares,
                'saves': current_saves,
                'likesPercentage': calculate_percentage_change(current_likes, previous_likes),
                'commentsPercentage': calculate_percentage_change(current_comments, previous_comments),
                'sharesPercentage': calculate_percentage_change(current_shares, previous_shares),
                'savesPercentage': calculate_percentage_change(current_saves, previous_saves)
            }
        except Exception as e:
            logger.error(f"Error in _get_engagement_data: {str(e)}")
            return {
                'likes': 0, 'comments': 0, 'shares': 0, 'saves': 0,
                'likesPercentage': 0, 'commentsPercentage': 0, 
                'sharesPercentage': 0, 'savesPercentage': 0
            }
    
    def _get_top_recipes(self, user_recipes, start_date, end_date):
        """Get top 3 performing recipes"""
        performance_data = []
        
        try:
            for recipe in user_recipes:
                views = RecipeView.objects.filter(
                    recipe=recipe,
                    viewed_at__date__range=[start_date, end_date]
                ).count()
                
                likes = RecipeLike.objects.filter(
                    recipe=recipe,
                    created_at__date__range=[start_date, end_date]
                ).count()
                
                comments = RecipeComment.objects.filter(
                    recipe=recipe,
                    created_at__date__range=[start_date, end_date]
                ).count()
                
                # Calculate conversion rate (likes/views * 100)
                conversion_rate = round((likes / views * 100), 1) if views > 0 else 0
                
                performance_data.append({
                    'name': recipe.title[:30] + '...' if len(recipe.title) > 30 else recipe.title,
                    'views': views,
                    'likes': likes,
                    'comments': comments,
                    'conversionRate': str(conversion_rate)
                })
            
            # Sort by views and take top 3
            sorted_recipes = sorted(performance_data, key=lambda x: x['views'], reverse=True)[:3]
            return sorted_recipes
        except Exception as e:
            logger.error(f"Error in _get_top_recipes: {str(e)}")
            return []
    
    def _get_category_distribution(self, user_recipes, start_date, end_date):
        """Get recipe distribution by category"""
        category_data = defaultdict(int)
        
        try:
            # First, get all categories that the user's recipes belong to
            for recipe in user_recipes:
                category_name = recipe.category.name if recipe.category else 'Uncategorized'
                
                # Get views for this recipe in the date range (optional - you can remove this if you just want recipe counts)
                views = RecipeView.objects.filter(
                    recipe=recipe,
                    viewed_at__date__range=[start_date, end_date]
                ).count()
                
                # Add views to the category (or just count recipes by using += 1)
                category_data[category_name] += views
            
            # If no views data, fall back to just counting recipes per category
            if not any(category_data.values()):
                category_data.clear()
                for recipe in user_recipes:
                    category_name = recipe.category.name if recipe.category else 'Uncategorized'
                    category_data[category_name] += 1
            
            # Return all categories, even those with 0 views/recipes
            result = [
                {'name': category, 'value': count}
                for category, count in category_data.items()
            ]
            
            # If still empty, ensure we return at least something
            if not result:
                result = [{'name': 'No Categories', 'value': 0}]
                
            return result
            
        except Exception as e:
            logger.error(f"Error in _get_category_distribution: {str(e)}")
            
            # Fallback: Get categories directly from user recipes
            try:
                fallback_data = defaultdict(int)
                for recipe in user_recipes:
                    category_name = recipe.category.name if recipe.category else 'Uncategorized'
                    fallback_data[category_name] += 1
                
                return [
                    {'name': category, 'value': count}
                    for category, count in fallback_data.items()
                ] if fallback_data else [{'name': 'No Categories', 'value': 0}]
                
            except Exception as fallback_error:
                logger.error(f"Fallback error in _get_category_distribution: {str(fallback_error)}")
                return [{'name': 'Error', 'value': 0}]


class RecipeViewTrackingView(APIView):
    """Track recipe views - allow both authenticated and anonymous users"""
    authentication_classes = [TokenAuthentication]
    permission_classes = []  # Allow anonymous tracking
    
    def post(self, request):
        recipe_id = request.data.get('recipe_id')
        time_spent = request.data.get('time_spent', 0)
        
        if not recipe_id:
            return Response({'error': 'Recipe ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            recipe = Recipe.objects.get(id=recipe_id)
            
            # Get client IP
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0].strip()
            else:
                ip_address = request.META.get('REMOTE_ADDR', '')
            
            # Create view record
            RecipeView.objects.create(
                recipe=recipe,
                user=request.user if request.user.is_authenticated else None,
                ip_address=ip_address,
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                referrer=request.META.get('HTTP_REFERER', ''),
                session_key=request.session.session_key or '',
                time_spent=time_spent
            )
            
            logger.info(f"Tracked view for recipe {recipe_id} from IP {ip_address}")
            
            return Response({'status': 'success'}, status=status.HTTP_201_CREATED)
            
        except Recipe.DoesNotExist:
            return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error tracking recipe view: {str(e)}")
            return Response({'error': 'Failed to track view'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RecipeEngagementView(APIView):
    """Handle recipe engagement actions (like, comment, share, save)"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        action = request.data.get('action')
        recipe_id = request.data.get('recipe_id')
        
        if not action or not recipe_id:
            return Response(
                {'error': 'Action and recipe_id are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            recipe = Recipe.objects.get(id=recipe_id)
            
            if action == 'like':
                like, created = RecipeLike.objects.get_or_create(
                    recipe=recipe,
                    user=request.user
                )
                if not created:
                    like.delete()
                    return Response({'status': 'unliked'}, status=status.HTTP_200_OK)
                return Response({'status': 'liked'}, status=status.HTTP_201_CREATED)
            
            elif action == 'comment':
                comment_text = request.data.get('comment')
                if not comment_text:
                    return Response({'error': 'Comment text required'}, status=status.HTTP_400_BAD_REQUEST)
                
                comment = RecipeComment.objects.create(
                    recipe=recipe,
                    user=request.user,
                    comment=comment_text
                )
                return Response({'status': 'commented', 'comment_id': comment.id}, status=status.HTTP_201_CREATED)
            
            elif action == 'share':
                platform = request.data.get('platform', 'other')
                RecipeShare.objects.create(
                    recipe=recipe,
                    user=request.user,
                    platform=platform
                )
                return Response({'status': 'shared'}, status=status.HTTP_201_CREATED)
            
            elif action == 'save':
                save, created = RecipeSave.objects.get_or_create(
                    recipe=recipe,
                    user=request.user
                )
                if not created:
                    save.delete()
                    return Response({'status': 'unsaved'}, status=status.HTTP_200_OK)
                return Response({'status': 'saved'}, status=status.HTTP_201_CREATED)
            
            else:
                return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
                
        except Recipe.DoesNotExist:
            return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error handling engagement: {str(e)}")
            return Response({'error': 'Failed to process engagement'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)