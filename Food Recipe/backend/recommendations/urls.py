from django.urls import path

from . import views

urlpatterns = [
    path("", views.RecommendedRecipesView.as_view(), name="recipe-recommend"),
]