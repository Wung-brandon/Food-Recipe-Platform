from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from recipe.models import Recipe, Rating, Category
from .serializers import RecommendedRecipeSerializer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from django.db.models import Avg
import numpy as np

class RecommendedRecipesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Get all recipes and their relevant features
        all_recipes = list(Recipe.objects.all())
        recipe_features = [
            f"{recipe.title} {' '.join([tag.name for tag in recipe.tags.all()])} {recipe.category.name}"
            for recipe in all_recipes
        ]

        # Use TF-IDF to vectorize the recipe features
        tfidf_vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = tfidf_vectorizer.fit_transform(recipe_features)

        # Get the user's rated recipes
        user_ratings = Rating.objects.filter(user=user, value__gte=4).select_related('recipe')

        if not user_ratings.exists():
            # If no ratings, recommend top-rated recipes by average rating
            recipes = (
                Recipe.objects.annotate(average_rating=Avg('ratings__value'))
                .order_by('-average_rating', '-created_at')[:10]
            )
            recommended_recipes = list(recipes)
        else:
            # Content-based filtering
            rated_recipe_ids = [rating.recipe.id for rating in user_ratings]
            rated_recipes = [recipe for recipe in all_recipes if recipe.id in rated_recipe_ids]

            if not rated_recipes:
                recommended_recipes = []
            else:
                rated_recipe_indices = [all_recipes.index(recipe) for recipe in rated_recipes]
                rated_tfidf_matrix = tfidf_matrix[rated_recipe_indices]

                cosine_similarities = cosine_similarity(rated_tfidf_matrix, tfidf_matrix)
                average_similarity = np.mean(cosine_similarities, axis=0)
                similar_recipe_indices = average_similarity.argsort()[::-1]

                recommended_recipes = []
                for index in similar_recipe_indices:
                    recipe = all_recipes[index]
                    if recipe.id not in rated_recipe_ids:
                        # Optional: filter by user profile dietary needs/exclusions if available
                        recommended_recipes.append(recipe)
                    if len(recommended_recipes) >= 10:
                        break

        # Annotate average_rating for serializer
        recipe_ids = [r.id for r in recommended_recipes]
        recipes_with_ratings = (
            Recipe.objects.filter(id__in=recipe_ids)
            .annotate(average_rating=Avg('ratings__value'))
        )
        # Keep the order as in recommended_recipes
        recipes_dict = {r.id: r for r in recipes_with_ratings}
        ordered_recipes = [recipes_dict[rid] for rid in recipe_ids if rid in recipes_dict]

        serializer = RecommendedRecipeSerializer(ordered_recipes, many=True)
        return Response(serializer.data)