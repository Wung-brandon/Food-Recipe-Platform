# Food Recipe/backend/shop/views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.http import Http404
from .models import Product, Cart, CartItem, Ingredient, PlatformIngredient, PlatformIngredientCart, PlatformIngredientCartItem, GuestSession
from .serializers import (
                          ProductSerializer, 
                          CartSerializer, 
                          CartItemSerializer, 
                          IngredientSerializer,
                          PlatformIngredientSerializer,
                          PlatformIngredientCartSerializer,
                          PlatformIngredientCartItemSerializer
)
# from .momo_api import initiate_momo_payment # You will need to create this module

import logging
from django.utils import timezone
from datetime import timedelta
from django.db import transaction
logger = logging.getLogger(__name__)

class ProductListView(generics.ListAPIView):
    permission_classes = [AllowAny]  # Allow anyone to view products
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ProductDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]  # Allow anyone to view product details
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)

        product = get_object_or_404(Product, id=product_id)
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)

        if not created:
            cart_item.quantity += int(quantity)
            cart_item.save()
        else:
             cart_item.quantity = int(quantity)
             cart_item.save()


        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        cart_item = get_object_or_404(CartItem, pk=pk, cart__user=request.user)
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        if not cart.items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        total_amount = sum(item.product.price * item.quantity for item in cart.items.all())
        phone_number = request.data.get('phone_number') # Get phone number from request

        # TODO: Implement actual Momo payment initiation
        # try:
        #     payment_response = initiate_momo_payment(phone_number, total_amount)
        #     # Process payment_response and handle success/failure
        #     if payment_response.get('status') == 'success':
        #         # Clear the cart after successful payment
        #         cart.items.all().delete()
        #         return Response({"message": "Payment successful and cart cleared"}, status=status.HTTP_200_OK)
        #     else:
        #         return Response({"error": "Payment failed", "details": payment_response.get('details')}, status=status.HTTP_400_BAD_REQUEST)
        # except Exception as e:
        #     return Response({"error": "Payment processing error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # For now, let's just clear the cart and return a success message
        cart.items.all().delete()
        return Response({"message": "Checkout successful (Momo payment simulation)"}, status=status.HTTP_200_OK)


class IngredientListView(generics.ListAPIView):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer

class IngredientDetailView(generics.RetrieveAPIView):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer


class PlatformIngredientListCreateView(generics.ListCreateAPIView):
    queryset = PlatformIngredient.objects.all()
    serializer_class = PlatformIngredientSerializer
    permission_classes = [AllowAny]

class PlatformIngredientDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PlatformIngredient.objects.all()
    serializer_class = PlatformIngredientSerializer
    permission_classes = [AllowAny]
class PlatformIngredientCartView(APIView):
    permission_classes = []

    def get_cart(self, request):
        """Get or create cart for user/guest"""
        if request.user.is_authenticated:
            cart, created = PlatformIngredientCart.objects.get_or_create(
                user=request.user,
                defaults={'session_key': None}
            )
            if created:
                logger.info(f"Created new user cart for user {request.user.id}")
        else:
            # Use guest session key
            guest_session_key = getattr(request, 'guest_session_key', None)
            if not guest_session_key:
                # Fallback to Django session
                guest_session_key = request.session.session_key
                if not guest_session_key:
                    request.session.create()
                    guest_session_key = request.session.session_key
            
            cart, created = PlatformIngredientCart.objects.get_or_create(
                session_key=guest_session_key,
                user=None,
                defaults={'session_key': guest_session_key}
            )
            if created:
                logger.info(f"Created new guest cart for session {guest_session_key}")
                
            # Track guest session
            if hasattr(request, 'guest_session_key') and request.guest_session_key:
                self.track_guest_session(request.guest_session_key)
        
        return cart

    def track_guest_session(self, session_key):
        """Track guest session for analytics and cleanup"""
        try:
            guest_session, created = GuestSession.objects.get_or_create(
                session_key=session_key,
                defaults={
                    'expires_at': timezone.now() + timedelta(days=7)
                }
            )
            if not created and not guest_session.is_expired():
                guest_session.extend_session()
        except Exception as e:
            logger.warning(f"Failed to track guest session {session_key}: {e}")

    def get(self, request):
        """Get cart contents"""
        try:
            cart = self.get_cart(request)
            serializer = PlatformIngredientCartSerializer(cart)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error getting cart: {e}")
            return Response(
                {'error': 'Failed to retrieve cart'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CartAddView(APIView):
    """Separate view for adding items to cart"""
    permission_classes = []

    def get_cart(self, request):
        """Get or create cart for user/guest - same logic as main view"""
        if request.user.is_authenticated:
            cart, created = PlatformIngredientCart.objects.get_or_create(
                user=request.user,
                defaults={'session_key': None}
            )
            if created:
                logger.info(f"Created new user cart for user {request.user.id}")
        else:
            # Use guest session key
            guest_session_key = getattr(request, 'guest_session_key', None)
            if not guest_session_key:
                # Fallback to Django session
                guest_session_key = request.session.session_key
                if not guest_session_key:
                    request.session.create()
                    guest_session_key = request.session.session_key
            
            cart, created = PlatformIngredientCart.objects.get_or_create(
                session_key=guest_session_key,
                user=None,
                defaults={'session_key': guest_session_key}
            )
            if created:
                logger.info(f"Created new guest cart for session {guest_session_key}")
        
        return cart

    def post(self, request):
        """Add item to cart"""
        try:
            ingredient_id = request.data.get('ingredient_id')
            quantity = int(request.data.get('quantity', 1))
            
            if not ingredient_id:
                return Response(
                    {'error': 'ingredient_id is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if quantity <= 0:
                return Response(
                    {'error': 'Quantity must be greater than 0'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            ingredient = get_object_or_404(PlatformIngredient, id=ingredient_id)
            cart = self.get_cart(request)
            
            with transaction.atomic():
                cart_item, created = PlatformIngredientCartItem.objects.get_or_create(
                    cart=cart, 
                    ingredient=ingredient,
                    defaults={'quantity': quantity}
                )
                
                if not created:
                    cart_item.quantity += quantity
                    cart_item.save()
                
                logger.info(f"Added {quantity} of ingredient {ingredient_id} to cart")
            
            return Response(
                PlatformIngredientCartItemSerializer(cart_item).data,
                status=status.HTTP_201_CREATED
            )
            
        except ValueError:
            return Response(
                {'error': 'Invalid quantity format'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error adding item to cart: {e}")
            return Response(
                {'error': 'Failed to add item to cart'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CartItemView(APIView):
    """Handle individual cart item operations"""
    permission_classes = []

    def get_cart(self, request):
        """Get cart for user/guest"""
        if request.user.is_authenticated:
            try:
                return PlatformIngredientCart.objects.get(user=request.user)
            except PlatformIngredientCart.DoesNotExist:
                raise Http404("Cart not found")
        else:
            guest_session_key = getattr(request, 'guest_session_key', None)
            if not guest_session_key:
                guest_session_key = request.session.session_key
            
            if not guest_session_key:
                raise Http404("Cart not found")
                
            try:
                return PlatformIngredientCart.objects.get(
                    session_key=guest_session_key, 
                    user=None
                )
            except PlatformIngredientCart.DoesNotExist:
                raise Http404("Cart not found")

    def put(self, request, pk):
        """Update cart item quantity"""
        try:
            quantity = int(request.data.get('quantity', 1))
            
            if quantity <= 0:
                return Response(
                    {'error': 'Quantity must be greater than 0'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            cart = self.get_cart(request)
            cart_item = get_object_or_404(PlatformIngredientCartItem, pk=pk, cart=cart)
            
            cart_item.quantity = quantity
            cart_item.save()
            
            logger.info(f"Updated cart item {pk} quantity to {quantity}")
            
            return Response(PlatformIngredientCartItemSerializer(cart_item).data)
            
        except ValueError:
            return Response(
                {'error': 'Invalid quantity format'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Http404:
            return Response(
                {'error': 'Cart item not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error updating cart item: {e}")
            return Response(
                {'error': 'Failed to update cart item'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, pk):
        """Remove item from cart"""
        try:
            cart = self.get_cart(request)
            cart_item = get_object_or_404(PlatformIngredientCartItem, pk=pk, cart=cart)
            
            ingredient_name = cart_item.ingredient.name
            cart_item.delete()
            
            logger.info(f"Removed {ingredient_name} from cart")
            
            return Response(
                {'message': f'{ingredient_name} removed from cart'}, 
                status=status.HTTP_200_OK
            )
            
        except Http404:
            return Response(
                {'error': 'Cart item not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error removing cart item: {e}")
            return Response(
                {'error': 'Failed to remove item from cart'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CartClearView(APIView):
    """Clear entire cart"""
    permission_classes = []
    
    def post(self, request):  # Changed from delete to post to match frontend
        """Clear all items from cart"""
        try:
            if request.user.is_authenticated:
                try:
                    cart = PlatformIngredientCart.objects.get(user=request.user)
                except PlatformIngredientCart.DoesNotExist:
                    return Response(
                        {'message': 'Cart is already empty'}, 
                        status=status.HTTP_200_OK
                    )
            else:
                guest_session_key = getattr(request, 'guest_session_key', None)
                if not guest_session_key:
                    guest_session_key = request.session.session_key
                
                if not guest_session_key:
                    return Response(
                        {'message': 'Cart is already empty'}, 
                        status=status.HTTP_200_OK
                    )
                
                try:
                    cart = PlatformIngredientCart.objects.get(
                        session_key=guest_session_key,
                        user=None
                    )
                except PlatformIngredientCart.DoesNotExist:
                    return Response(
                        {'message': 'Cart is already empty'}, 
                        status=status.HTTP_200_OK
                    )
            
            items_count = cart.items.count()
            cart.items.all().delete()
            
            logger.info(f"Cleared {items_count} items from cart")
            
            return Response(
                {'message': f'Cleared {items_count} items from cart'}, 
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error clearing cart: {e}")
            return Response(
                {'error': 'Failed to clear cart'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )