from django.contrib import admin
from .models import (
    Category,
    Tag,
    Recipe,
    Ingredient,
    Step,   
    Tip,
    Comment,
    Rating,
    FavoriteRecipe,
    LikedRecipe,
    MealPlan,
    MealPlanEntry,
    
)
# Register your models here.
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "description"]

class TagAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    
class RecipeAdmin(admin.ModelAdmin):
    list_display = ["author", "title", "difficulty", "category", "favorites_count", "likes_count"]

    def favorites_count(self, obj):
        return obj.favorites.count()
    favorites_count.short_description = "Favorites Count"

    def likes_count(self, obj):
        return obj.likes.count()
    likes_count.short_description = "Likes Count"
class IngredientAdmin(admin.ModelAdmin):
    list_display = ["recipe", "name", "amount"]
    list_editable = ["amount"]
    
class StepAdmin(admin.ModelAdmin):
    list_display = ["recipe", "description"]
    
class TipAdmin(admin.ModelAdmin):
    list_display = ["recipe", "description"]
    
class CommentAdmin(admin.ModelAdmin):
    list_display = ["user", "username", "recipe", "text"]

class RatingAdmin(admin.ModelAdmin):
    list_display = ["user", "username", "recipe", "value"]
    list_editable = ["value"]

class FavoriteRecipeAdmin(admin.ModelAdmin):
    list_display = ["user", "recipe"]
    
class LikedRecipeAdmin(admin.ModelAdmin):
    list_display = ["user", "recipe"]
    
admin.site.register(Category, CategoryAdmin)
admin.site.register(Tag, TagAdmin)
admin.site.register(Recipe, RecipeAdmin)
admin.site.register(Tip, TipAdmin)
admin.site.register(FavoriteRecipe, FavoriteRecipeAdmin)
admin.site.register(LikedRecipe, LikedRecipeAdmin)
admin.site.register(Ingredient, IngredientAdmin)
admin.site.register(Step, StepAdmin)
admin.site.register(Rating, RatingAdmin)

class MealPlanAdmin(admin.ModelAdmin):
    list_display = ["user", "start_date", "end_date"]

class MealPlanEntryAdmin(admin.ModelAdmin):
    list_display = ["meal_plan", "recipe", "date", "meal_type"]
    
admin.site.register(MealPlan, MealPlanAdmin)
admin.site.register(MealPlanEntry, MealPlanEntryAdmin)
admin.site.register(Comment, CommentAdmin)