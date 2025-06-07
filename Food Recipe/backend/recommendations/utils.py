# Food Recipe/backend/recommendations/utils.py

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from ..recipe.models import Recipe, Ingredient, Category, Tag

def load_data_from_db():
    """Loads recipe data, ingredients, categories, and tags from the database."""
    recipes = Recipe.objects.all()
    ingredients = Ingredient.objects.all()
    categories = Category.objects.all()
    tags = Tag.objects.all()

    # Create dictionaries for quick lookups
    recipe_data = {recipe.id: {'title': recipe.title, 'description': recipe.description, 'category': recipe.category.name if recipe.category else '', 'tags': [tag.name for tag in recipe.tags.all()]} for recipe in recipes}
    ingredient_data = {ingredient.id: {'recipe_id': ingredient.recipe.id, 'name': ingredient.name} for ingredient in ingredients}
    category_data = {category.id: category.name for category in categories}
    tag_data = {tag.id: tag.name for tag in tags}

    return recipe_data, ingredient_data, category_data, tag_data


def load_recipe_data(filepath):
   pass # This function is no longer needed as data is loaded from the database

def load_user_data(filepath):
    """Loads user interaction data from a CSV file."""
    try:
        user_interactions_df = pd.read_csv(filepath)
        return user_interactions_df
    except FileNotFoundError:
        print(f"Error: User interaction data file not found at {filepath}")
        return None

def preprocess_recipe_data(recipes_df):
    """
    Preprocesses recipe data loaded from the database for content-based filtering.
    Combines relevant text fields (description, ingredients, category, tags) into a single string for TF-IDF vectorization.
    Returns a pandas DataFrame with 'id' and 'combined_features'.
    """
    if not recipes_df:
        return None

    processed_data = []
    for recipe_id, data in recipes_df.items():
        ingredients = " ".join([ing['name'] for ing_id, ing in load_data_from_db()[1].items() if ing['recipe_id'] == recipe_id])
        tags = " ".join(data['tags'])
        combined_features = f"{data['description']} {ingredients} {data['category']} {tags}"
        processed_data.append({'id': recipe_id, 'combined_features': combined_features})

    return pd.DataFrame(processed_data)

def create_content_based_model():
    """
    Creates a content-based filtering model by loading data from the database,
    preprocessing it, and training a TF-IDF and cosine similarity model.
    Returns the TF-IDF vectorizer and the cosine similarity matrix.
    """
    recipe_data, _, _, _ = load_data_from_db()
    recipes_df = preprocess_recipe_data(recipe_data)

    # Combine text fields
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(recipes_df['combined_features'])
    cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)

    return recipes_df

def train_content_based_model(recipes_df):
    """
    Trains a content-based filtering model using TF-IDF and cosine similarity.
    Returns the TF-IDF vectorizer, the cosine similarity matrix, and the recipes DataFrame.
    """
    recipe_data, _, _, _ = load_data_from_db()
    recipes_df = preprocess_recipe_data(recipe_data)

    if recipes_df is None or recipes_df.empty:
        return None, None, None

    # Reset index to ensure it aligns with similarity matrix indices
    recipes_df = recipes_df.reset_index(drop=True)

    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(recipes_df['combined_features'])
    cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)

    return tfidf, cosine_sim

def get_content_based_recommendations(recipe_id, tfidf, cosine_sim, recipes_df, num_recommendations=10):
    """
    Generates content-based recommendations for a given recipe ID using the trained model.
    Returns a list of recommended recipe IDs.
    """
    if recipes_df is None or cosine_sim is None or not tfidf:
        print("Error: Model not trained or data not loaded.")
        return []

    if recipe_id not in recipes_df['id'].values:
        print(f"Error: Recipe with ID {recipe_id} not found in the data.")
        return []

    # Get the index of the recipe that matches the id
    idx = recipes_df[recipes_df['id'] == recipe_id].index[0]

    # Get the pairwise similarity scores with that recipe
    sim_scores = list(enumerate(cosine_sim[idx]))

    # Sort the recipes based on the similarity scores
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    # Get the scores of the 10 most similar recipes (excluding the recipe itself)
    sim_scores = sim_scores[1:num_recommendations+1]

    # Get the recipe indices
    recipe_indices = [i[0] for i in sim_scores]

    # Return the top N most similar recipe IDs
    return recipes_df['id'].iloc[recipe_indices].tolist()

# Add functions for collaborative filtering if needed
# def create_user_item_matrix(user_interactions_df, recipes_df):
#     """Creates a user-item interaction matrix."""
#     pass

# def train_collaborative_filtering_model(user_item_matrix):
#     """Trains a collaborative filtering model."""
#     pass

# def get_collaborative_filtering_recommendations(user_id, user_item_matrix, model, num_recommendations=10):
#     """Generates collaborative filtering recommendations for a user."""
#     pass

# You might also need functions to combine content-based and collaborative filtering recommendations
# def get_hybrid_recommendations(user_id, recipe_id, user_item_matrix, content_model, collaborative_model, num_recommendations=10):
#     """Generates hybrid recommendations."""
#     pass

def find_recipes_by_ingredients(ingredients):
    """
    Finds recipes that contain the given list of ingredients.
    Loads data from the database and performs a case-insensitive search
    across the ingredients of all recipes.
    Returns a list of recipe IDs.
    """
    if not ingredients:
        return []

    recipe_data, ingredient_data, _, _ = load_data_from_db()

    if not recipe_data:
        return []

    # Convert ingredients to lowercase for case-insensitive matching
    ingredients_lower = [ing.lower() for ing in ingredients]

    matching_recipe_ids = []
    for recipe_id, data in recipe_data.items():
        recipe_ingredients = [ing['name'].lower() for ing_id, ing in ingredient_data.items() if ing['recipe_id'] == recipe_id]
        if all(ing in recipe_ingredients for ing in ingredients_lower):
            matching_recipe_ids.append(recipe_id)

    return matching_recipe_ids