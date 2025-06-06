from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from recipe.models import Recipe, Rating
from .serializers import RecommendedRecipeSerializer

class RecommendedRecipesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Get recipes the user has rated highly
        user_ratings = Rating.objects.filter(user=user, value__gte=4)
        categories = user_ratings.values_list('recipe__category', flat=True)
        tags = user_ratings.values_list('recipe__tags__id', flat=True)
        # Recommend recipes in those categories/tags, excluding already rated
        recipes = Recipe.objects.filter(
            category__in=categories
        ).exclude(ratings__user=user).distinct()[:10]
        serializer = RecommendedRecipeSerializer(recipes, many=True)
        return Response(serializer.data)