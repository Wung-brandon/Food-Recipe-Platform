# analytics/serializers.py
from rest_framework import serializers
from authentication.models import CustomUser
from django.db.models import Count, Sum, Avg
from datetime import datetime, timedelta
from django.utils import timezone
from .models import RecipeView, RecipeLike, RecipeComment, RecipeShare, RecipeSave, UserFollowing

class RecipePerformanceSerializer(serializers.Serializer):
    name = serializers.CharField()
    views = serializers.IntegerField()
    likes = serializers.IntegerField()
    comments = serializers.IntegerField()
    conversionRate = serializers.SerializerMethodField()
    
    def get_conversionRate(self, obj):
        if obj['views'] > 0:
            return round((obj['likes'] / obj['views']) * 100, 1)
        return 0.0

class ViewsDataSerializer(serializers.Serializer):
    name = serializers.CharField()
    views = serializers.IntegerField()
    uniqueVisitors = serializers.IntegerField()

class CategoryDistributionSerializer(serializers.Serializer):
    name = serializers.CharField()
    value = serializers.IntegerField()

class EngagementSerializer(serializers.Serializer):
    likes = serializers.IntegerField()
    comments = serializers.IntegerField()
    shares = serializers.IntegerField()
    saves = serializers.IntegerField()
    # Add percentage fields
    likesPercentage = serializers.FloatField(required=False, default=0)
    commentsPercentage = serializers.FloatField(required=False, default=0)
    sharesPercentage = serializers.FloatField(required=False, default=0)
    savesPercentage = serializers.FloatField(required=False, default=0)

class FollowersSerializer(serializers.Serializer):
    count = serializers.IntegerField()
    growth = serializers.IntegerField()
    growthPercentage = serializers.FloatField(required=False, default=0)

class AnalyticsDataSerializer(serializers.Serializer):
    viewsData = ViewsDataSerializer(many=True)
    recipesPerformance = RecipePerformanceSerializer(many=True)
    followers = FollowersSerializer()
    engagement = EngagementSerializer()
    topRecipes = RecipePerformanceSerializer(many=True)
    categoryDistribution = CategoryDistributionSerializer(many=True)

class ViewTrackingSerializer(serializers.Serializer):
    recipe_id = serializers.IntegerField()
    time_spent = serializers.IntegerField(default=0)

class EngagementActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['like', 'comment', 'share', 'save'])
    recipe_id = serializers.IntegerField()
    comment = serializers.CharField(required=False, allow_blank=True)
    platform = serializers.CharField(required=False, default='other')