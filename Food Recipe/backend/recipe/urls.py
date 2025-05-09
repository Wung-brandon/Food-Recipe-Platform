# recipes/urls.py
from django.urls import path
from . import views

app_name = 'recipes'

urlpatterns = [
    # Category endpoints
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list'),
    path('categories/<slug:slug>/', views.CategoryDetailView.as_view(), name='category-detail'),
    
    # Tag endpoints
    path('tags/', views.TagListCreateView.as_view(), name='tag-list'),
    path('tags/<slug:slug>/', views.TagDetailView.as_view(), name='tag-detail'),
    
    # Recipe endpoints
    path('recipes/', views.RecipeListCreateView.as_view(), name='recipe-list'),
    path('recipes/<slug:slug>/', views.RecipeDetailView.as_view(), name='recipe-detail'),
    
    # User recipes
    path('my-recipes/', views.UserRecipesView.as_view(), name='user-recipes'),
    path('my-favorites/', views.UserFavoritesView.as_view(), name='user-favorites'),
    
    # Comment endpoints
    path('recipes/<slug:recipe_slug>/comments/', views.CommentListCreateView.as_view(), name='comment-list'),
    path('recipes/<slug:recipe_slug>/comments/<int:pk>/', views.CommentDetailView.as_view(), name='comment-detail'),
    
    # Rating endpoint
    path('recipes/<slug:recipe_slug>/rate/', views.RateRecipeView.as_view(), name='rate-recipe'),
    
    # Favorite and Like toggles
    path('recipes/<slug:recipe_slug>/favorite/', views.toggle_favorite, name='toggle-favorite'),
    path('recipes/<slug:recipe_slug>/like/', views.toggle_like, name='toggle-like'),
    
    # Search endpoint
    path('search/', views.SearchRecipesView.as_view(), name='search-recipes'),
]