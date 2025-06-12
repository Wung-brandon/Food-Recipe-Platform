from rest_framework import serializers
from .models import Order, OrderItem
from shop.models import Ingredient

class OrderItemSerializer(serializers.ModelSerializer):
    ingredient = serializers.StringRelatedField()
    ingredient_id = serializers.PrimaryKeyRelatedField(queryset=Ingredient.objects.all(), source='ingredient', write_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'ingredient', 'ingredient_id', 'quantity', 'price']
        read_only_fields = ['id', 'ingredient', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'created_at', 'updated_at', 'total_amount', 'payment_status', 'booking_id', 'items']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'total_amount', 'payment_status', 'booking_id', 'items']
