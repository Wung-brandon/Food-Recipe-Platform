# Food Recipe/backend/shop/urls.py
from django.urls import path
from .views import (
                    ProductListView, 
                    ProductDetailView, 
                    CartView, 
                    CheckoutView,
                    IngredientListView, 
                    IngredientDetailView,
                    PlatformIngredientListCreateView,
                    PlatformIngredientDetailView,
                    PlatformIngredientCartView,
                    CartClearView,
                    CartAddView,
                    CartItemView
                    )

urlpatterns = [
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/<int:pk>/', CartView.as_view(), name='cart-item-detail'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    
    path('ingredients/', IngredientListView.as_view(), name='ingredient-list'),
    path('ingredients/<int:pk>/', IngredientDetailView.as_view(), name='ingredient-detail'),
    path('platform-ingredients/', PlatformIngredientListCreateView.as_view(), name='platform-ingredient-list-create'),
    path('platform-ingredients/<int:pk>/', PlatformIngredientDetailView.as_view(), name='platform-ingredient-detail'),
    path('platform-ingredients-cart/', PlatformIngredientCartView.as_view(), name='cart-list'),
    path('platform-ingredients-cart/add/', CartAddView.as_view(), name='cart-add'),
    path('platform-ingredients-cart/item/<int:pk>/', CartItemView.as_view(), name='cart-item'),
    path('platform-ingredients-cart/clear/', CartClearView.as_view(), name='cart-clear'),
]
