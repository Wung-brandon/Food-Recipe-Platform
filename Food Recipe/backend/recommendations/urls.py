from django.urls import path

from . import views

urlpatterns = [
    path("recommendations/", views.RecommendedRecipesView.as_view(), name="recipe-recommend"),
]