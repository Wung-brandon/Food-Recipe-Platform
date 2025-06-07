# Food Recipe/backend/recipe/utils.py
import random
from datetime import date, timedelta

from .models import Recipe, Ingredient
from django.db.models import Q, Count, Avg, F


def find_recipes_by_ingredients(ingredient_list):
    """
    Finds recipes that can be made with the given list of ingredients.

    Args:
        ingredient_list (list): A list of ingredient names (strings).

    Returns:
        list: A list of Recipe objects that can be prepared.
    """
    matching_recipes = {}  # Using a dictionary to store recipes and their match count
    input_ingredients_lower = set(ingredient.lower() for ingredient in ingredient_list)

    for recipe in Recipe.objects.all():
        recipe_ingredients_lower = set(ingredient.name.lower() for ingredient in recipe.ingredient_items.all())
        
        # Calculate the number of matching ingredients
        match_count = len(input_ingredients_lower.intersection(recipe_ingredients_lower))
        
        if match_count > 0:
            matching_recipes[recipe] = match_count

    # Sort recipes by the number of matching ingredients in descending order
    sorted_matching_recipes = sorted(matching_recipes.items(), key=lambda item: item[1], reverse=True)
    return [recipe for recipe, count in sorted_matching_recipes]

def preprocess_ingredients(ingredient_string):
    """
    Preprocesses a string of ingredients into a list of individual ingredients.

    Args:
        ingredient_string (str): A comma-separated string of ingredients.

    Returns:
        list: A list of individual ingredient names (strings).
    """
    if not ingredient_string:
        return []
    ingredients = [ingredient.strip() for ingredient in ingredient_string.split(',')]
    return ingredients

def filter_recipes_by_preferences(preferences):
    """
    Filters recipes based on user preferences.

    Args:
        preferences (dict): A dictionary containing filtering preferences.
            Expected keys: 'categories' (list of category names),
                           'difficulty' (string),
                           'dietary_needs' (list of tag names),
                           'max_cooking_time' (integer in minutes).

    Returns:
        QuerySet: A filtered queryset of recipes.
    """
    queryset = Recipe.objects.all()

    if 'categories' in preferences and preferences['categories']:
        queryset = queryset.filter(category__name__in=preferences['categories'])

    if 'difficulty' in preferences and preferences['difficulty']:
        queryset = queryset.filter(difficulty=preferences['difficulty'])

    if 'dietary_needs' in preferences and preferences['dietary_needs']:
        # Filter for recipes that have ALL the specified dietary need tags
        for tag_name in preferences['dietary_needs']:
            queryset = queryset.filter(tags__name=tag_name)

    if 'max_cooking_time' in preferences and preferences['max_cooking_time'] is not None:
        try:
            max_time = int(preferences['max_cooking_time'])
            queryset = queryset.filter(cooking_time__lte=max_time)
        except (ValueError, TypeError):
            # Handle invalid max_cooking_time if necessary
            pass

    # You can add more filters here based on other preferences

    return queryset

def select_recipes_for_meal_plan(filtered_recipes, num_meals):
    """
    Selects a diverse set of recipes for a meal plan.

    Args:
        filtered_recipes (QuerySet): A filtered queryset of recipes.
        num_meals (int): The number of meals to select.

    Returns:
        list: A list of selected Recipe objects.
    """
    if not filtered_recipes:
        return []

    if filtered_recipes.count() <= num_meals:
        return list(filtered_recipes)

    # Simple random selection for now
    selected_recipes = random.sample(list(filtered_recipes), num_meals)
    return selected_recipes

def aggregate_ingredients(recipes):
    """
    Aggregates ingredients from a list of recipes into a shopping list (simple list of strings).
    """
    shopping_list = []
    for recipe in recipes:
        for ingredient in recipe.ingredient_items.all():
            shopping_list.append(f"{ingredient.amount} {ingredient.name}".strip())
    return shopping_list