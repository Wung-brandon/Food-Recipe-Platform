from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Count, Q
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Category, Tag, Recipe, Comment, Rating, 
    FavoriteRecipe, LikedRecipe
)
from .serializers import (
    CategorySerializer, TagSerializer, 
    RecipeListSerializer, RecipeDetailSerializer, RecipeCreateUpdateSerializer,
    CommentSerializer, RatingSerializer,
    FavoriteRecipeSerializer, LikedRecipeSerializer
)
from .permissions import IsAuthorOrReadOnly, IsVerifiedChef
from .filters import RecipeFilter


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    permission_classes = [permissions.IsAdminUser]


class TagListCreateView(generics.ListCreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class TagDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.IsAdminUser]

class RecipeListCreateView(generics.ListCreateAPIView):
    queryset = Recipe.objects.all()
    # Change permission classes to include IsVerifiedChef
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsVerifiedChef]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = RecipeFilter
    search_fields = ['title', 'description', 'author__username', 'category__name', 'tags__name']
    ordering_fields = ['created_at', 'preparation_time', 'cooking_time', 'servings']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RecipeCreateUpdateSerializer
        return RecipeListSerializer
    
    def get_queryset(self):
        queryset = Recipe.objects.annotate(
            average_rating=Avg('ratings__value'),
            rating_count=Count('ratings', distinct=True),
            like_count=Count('likes', distinct=True)
        )
        
        # Filter by user if provided
        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(author_id=user_id)
        
        # Filter favorites
        favorites = self.request.query_params.get('favorites')
        if favorites and self.request.user.is_authenticated:
            queryset = queryset.filter(favorites=self.request.user)
        
        # Filter liked
        liked = self.request.query_params.get('liked')
        if liked and self.request.user.is_authenticated:
            queryset = queryset.filter(likes=self.request.user)
        
        return queryset
    
    def perform_create(self, serializer):
        # Get user object
        user = self.request.user
        
        # Double-check user's chef and verification status before creating
        if not user.role == 'CHEF':
            raise PermissionDenied("Only chefs can create recipes.")
        
        if not user.is_verified:
            raise PermissionDenied("Your account must be verified to create recipes.")
        
        try:
            chef_profile = user.chef_profile
            if chef_profile.verification_status != 'VERIFIED':
                raise PermissionDenied("Your chef profile must be verified to create recipes.")
        except:
            raise PermissionDenied("Chef profile not found or not properly set up.")
        
        # If all checks pass, save the recipe
        serializer.save(author=user)


class RecipeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Recipe.objects.all()
    lookup_field = 'slug'
    # Include IsVerifiedChef permission to ensure only verified chefs can update
    permission_classes = [IsAuthorOrReadOnly, IsVerifiedChef]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return RecipeCreateUpdateSerializer
        return RecipeDetailSerializer
    
    def get_queryset(self):
        return Recipe.objects.annotate(
            average_rating=Avg('ratings__value'),
            rating_count=Count('ratings', distinct=True),
            like_count=Count('likes', distinct=True)
        )


# Add this new view to create recipe drafts that will be ready for publishing once verified
class RecipeDraftCreateView(generics.CreateAPIView):
    serializer_class = RecipeCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        user = self.request.user
        
        # Check if user is a chef (but don't require verification)
        if not user.role == 'CHEF':
            raise PermissionDenied("Only chefs can create recipe drafts.")
        
        # Save the recipe as draft (assuming you add a 'is_draft' field to Recipe model)
        serializer.save(author=user, is_draft=True)

class UserRecipesView(generics.ListAPIView):
    serializer_class = RecipeListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Recipe.objects.filter(author=self.request.user).annotate(
            average_rating=Avg('ratings__value'),
            rating_count=Count('ratings', distinct=True),
            like_count=Count('likes', distinct=True)
        )


class UserFavoritesView(generics.ListAPIView):
    serializer_class = RecipeListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Recipe.objects.filter(favorites=self.request.user).annotate(
            average_rating=Avg('ratings__value'),
            rating_count=Count('ratings', distinct=True),
            like_count=Count('likes', distinct=True)
        )




class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        recipe_slug = self.kwargs.get('recipe_slug')
        return Comment.objects.filter(recipe__slug=recipe_slug)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        recipe_slug = self.kwargs.get('recipe_slug')
        context['recipe'] = get_object_or_404(Recipe, slug=recipe_slug)
        return context


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthorOrReadOnly]
    
    def get_queryset(self):
        recipe_slug = self.kwargs.get('recipe_slug')
        return Comment.objects.filter(recipe__slug=recipe_slug)


class RateRecipeView(generics.CreateAPIView):
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        recipe_slug = self.kwargs.get('recipe_slug')
        context['recipe'] = get_object_or_404(Recipe, slug=recipe_slug)
        return context


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_favorite(request, recipe_slug):
    recipe = get_object_or_404(Recipe, slug=recipe_slug)
    favorite, created = FavoriteRecipe.objects.get_or_create(
        user=request.user,
        recipe=recipe
    )
    
    if not created:
        # Recipe was already favorited, so remove it
        favorite.delete()
        return Response({'status': 'removed'}, status=status.HTTP_200_OK)
    
    return Response({'status': 'added'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_like(request, recipe_slug):
    recipe = get_object_or_404(Recipe, slug=recipe_slug)
    like, created = LikedRecipe.objects.get_or_create(
        user=request.user,
        recipe=recipe
    )
    
    if not created:
        # Recipe was already liked, so remove it
        like.delete()
        return Response({'status': 'removed'}, status=status.HTTP_200_OK)
    
    return Response({'status': 'added'}, status=status.HTTP_201_CREATED)


class SearchRecipesView(generics.ListAPIView):
    serializer_class = RecipeListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if not query:
            return Recipe.objects.none()
        
        queryset = Recipe.objects.filter(
            Q(title__icontains=query) | 
            Q(description__icontains=query) |
            Q(category__name__icontains=query) |
            Q(tags__name__icontains=query) |
            Q(author__username__icontains=query)
        ).distinct().annotate(
            average_rating=Avg('ratings__value'),
            rating_count=Count('ratings', distinct=True),
            like_count=Count('likes', distinct=True)
        )
        
        return queryset