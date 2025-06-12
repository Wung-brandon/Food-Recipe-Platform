# Food Recipe/backend/shop/serializers.py
from rest_framework import serializers
from .models import Product, Cart, CartItem, Ingredient, PlatformIngredient, PlatformIngredientCart, PlatformIngredientCartItem

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), source='product')

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity']
        read_only_fields = ['id', 'product']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_price']
        read_only_fields = ['id', 'user', 'items', 'total_price']

    def get_total_price(self, obj):
        return sum(item.product.price * item.quantity for item in obj.items.all())


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = '__all__'

class PlatformIngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformIngredient
        fields = ['id', 'name', 'description', 'image_url', 'price', 'unit']

class PlatformIngredientCartItemSerializer(serializers.ModelSerializer):
    ingredient = PlatformIngredientSerializer(read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = PlatformIngredientCartItem
        fields = ['id', 'ingredient', 'quantity', 'total_price', 'created_at', 'updated_at']

class PlatformIngredientCartSerializer(serializers.ModelSerializer):
    items = PlatformIngredientCartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = PlatformIngredientCart
        fields = ['id', 'items', 'total_items', 'total_price', 'created_at', 'updated_at']