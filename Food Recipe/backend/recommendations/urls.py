from django.urls import path
from . import views

app_name = 'recommendations'

urlpatterns = [
    # User preferences
    path('recommendations/preferences/', views.UserPreferencesView.as_view(), name='user-preferences'),
    
    # AI recommendations
    path('recommendations/', views.AIRecommendationsView.as_view(), name='ai-recommendations'),
    path('recommendations/history/', views.get_recommendation_history, name='recommendation-history'),
    
    # Ingredient-based search
    path('ingredient-search/', views.IngredientBasedSearchView.as_view(), name='ingredient-search'),
    path('ingredient-search/history/', views.get_ingredient_search_history, name='search-history'),
    
    # Tracking
    path('recommendations/track-view/<int:recipe_id>/', views.track_recipe_view, name='track-recipe-view'),
]