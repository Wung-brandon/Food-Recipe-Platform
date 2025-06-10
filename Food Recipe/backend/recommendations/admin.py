from django.contrib import admin
from .models import UserPreference, RecipeView, AIRecommendation, IngredientSearchHistory

@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'dietary_needs', 'cuisine_preferences', 'cooking_skill_level', 'preferred_cooking_time', 'updated_at')
    search_fields = ('user__username', 'user__email')

@admin.register(RecipeView)
class RecipeViewAdmin(admin.ModelAdmin):
    list_display = ('user', 'recipe', 'viewed_at', 'interaction_type')
    search_fields = ('user__username', 'recipe__title')
    list_filter = ('interaction_type',)

@admin.register(AIRecommendation)
class AIRecommendationAdmin(admin.ModelAdmin):
    list_display = ('user', 'recipe', 'confidence_score', 'reason', 'created_at')
    search_fields = ('user__username', 'recipe__title', 'reason')
    list_filter = ('created_at',)

@admin.register(IngredientSearchHistory)
class IngredientSearchHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'ingredients', 'search_timestamp', 'ip_address')
    search_fields = ('user__username', 'ingredients')
    list_filter = ('search_timestamp',)
