from django.urls import path
from . import views

# app_name = 'analytics'

urlpatterns = [
    path('recipe-analytics/', views.RecipeAnalyticsView.as_view(), name='recipe-analytics'),
    path('track-view/', views.RecipeViewTrackingView.as_view(), name='track-view'),
    path('engagement/', views.RecipeEngagementView.as_view(), name='engagement'),
]