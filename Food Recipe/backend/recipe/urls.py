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
    
    # Ingredient endpoints
    path('ingredients/', views.IngredientListCreateView.as_view(), name='ingredient-list'),
    # path('ingredients/<slug:slug>/', views.IngredientDetailView.as_view(), name='ingredient-detail'),

    # Recipe endpoints
    path('recipes/', views.RecipeListCreateView.as_view(), name='recipe-list'),
    path('recipes/<str:id>/', views.RecipeDetailView.as_view(), name='recipe-detail'),
    path('recipes/<str:recipe_id>/review/', views.RecipeReviewView.as_view(), name='recipe-review'),
    path('recipes/<str:recipe_id>/comments/<str:comment_id>/reply/', views.CommentReplyView.as_view(), name='comment-reply'),
    # User recipes
    path('my-recipes/', views.UserRecipesView.as_view(), name='user-recipes'),
    path('my-favorites/', views.UserFavoritesView.as_view(), name='user-favorites'),
    
    path('recipes/<int:recipe_id>/favorite/', views.toggle_favorite, name='toggle-favorite'),
    path('recipes/<int:recipe_id>/like/', views.toggle_like, name='toggle-like'),
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