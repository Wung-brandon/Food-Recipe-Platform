# recipes/filters.py
import django_filters
from .models import Recipe


class RecipeFilter(django_filters.FilterSet):
    min_rating = django_filters.NumberFilter(method='filter_min_rating')
    max_preparation_time = django_filters.NumberFilter(field_name='preparation_time', lookup_expr='lte')
    max_total_time = django_filters.NumberFilter(method='filter_max_total_time')
    category = django_filters.CharFilter(field_name='category__slug')
    tags = django_filters.CharFilter(method='filter_tags')
    difficulty = django_filters.CharFilter(field_name='difficulty')
    servings = django_filters.NumberFilter(field_name='servings')
    
    class Meta:
        model = Recipe
        fields = [
            'author', 'category', 'difficulty', 'servings',
            'max_preparation_time', 'max_total_time', 'min_rating', 'tags'
        ]
    
    def filter_min_rating(self, queryset, name, value):
        """Filter recipes with average rating >= value"""
        return queryset.filter(ratings__value__gte=value).distinct()
    
    def filter_max_total_time(self, queryset, name, value):
        """Filter recipes where preparation_time + cooking_time <= value"""
        from django.db.models import F
        return queryset.annotate(
            total_time=F('preparation_time') + F('cooking_time')
        ).filter(total_time__lte=value)
    
    def filter_tags(self, queryset, name, value):
        """Filter recipes containing all provided tags (comma separated)"""
        tags = [tag.strip() for tag in value.split(',')]
        for tag in tags:
            queryset = queryset.filter(tags__name__icontains=tag)
        return queryset