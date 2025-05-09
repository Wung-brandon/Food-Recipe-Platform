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
    LikedRecipe
    
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
    list_display = ["recipe", "order", "description"]
    list_editable = ["order"]
class TipAdmin(admin.ModelAdmin):
    list_display = ["recipe", "description"]
    
class CommentAdmin(admin.ModelAdmin):
    list_display = ["user", "recipe", "text"]
    
class RatingAdmin(admin.ModelAdmin):
    list_display = ["user", "recipe", "value"]
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
admin.site.register(Comment, CommentAdmin)