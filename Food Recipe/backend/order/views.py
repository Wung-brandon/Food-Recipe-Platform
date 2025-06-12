from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from .models import Order, OrderItem
from .serializers import OrderSerializer
from shop.models import Ingredient
import requests
import uuid

class OrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.all()

    def create(self, request, *args, **kwargs):
        items = request.data.get('items', [])
        if not items:
            return Response({'error': 'No items provided'}, status=status.HTTP_400_BAD_REQUEST)
        total = 0
        order_items = []
        for item in items:
            ingredient = get_object_or_404(Ingredient, pk=item['ingredient_id'])
            quantity = int(item.get('quantity', 1))
            price = float(ingredient.price or 0)
            total += price * quantity
            order_items.append({'ingredient': ingredient, 'quantity': quantity, 'price': price})
        booking_id = f"BOOK{uuid.uuid4().hex[:8].upper()}"
        order = Order.objects.create(user=request.user, total_amount=total, booking_id=booking_id)
        for oi in order_items:
            OrderItem.objects.create(order=order, ingredient=oi['ingredient'], quantity=oi['quantity'], price=oi['price'])
        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class OrderDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

class UserOrderListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)
    
@api_view(['POST'])
def initiate_fapshi_payment(request):
    try:
        amount = int(request.data.get("amount"))
        email = request.data.get("email")
        raw_phone = request.data.get("phone", "")
        booking_id = str(request.data.get("bookingId"))

        # Remove country code if present (assumes "+237" or "237")
        phone = raw_phone.replace("+237", "").replace("237", "").strip()

        # Validate fields
        if not (amount and email and phone and booking_id):
            return Response(
                {"message": "Missing or invalid fields", "details": {
                    "amount": amount, "email": email, "phone": phone, "bookingId": booking_id
                }},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = {
            "amount": amount,
            "email": email,
            "phone": phone,
            "bookingId": booking_id
        }

        response = requests.post("https://fapshi-node.onrender.com/initiatePayment/", json=data)

        if response.status_code == 200:
            return Response(response.json(), status=status.HTTP_200_OK)
        else:
            return Response({
                "message": "Failed to initiate payment",
                "details": response.json()
            }, status=response.status_code)

    except (ValueError, TypeError) as parse_error:
        return Response({
            "message": "Invalid input data",
            "error": str(parse_error)
        }, status=status.HTTP_400_BAD_REQUEST)
    except requests.RequestException as e:
        return Response({
            "message": "Something went wrong when contacting Fapshi",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        order_id = request.data.get('order_id')
        phone = request.data.get('phone')
        email = request.user.email

        if not order_id or not phone:
            return Response({'detail': 'Order ID and phone are required.'}, status=400)

        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=404)

        # Generate a unique bookingId if not already set
        if not order.booking_id:
            order.booking_id = f"ORDER-{uuid.uuid4().hex[:10].upper()}"
            order.save()

        payload = {
            "amount": float(order.total_amount),
            "email": email,
            "phone": phone,
            "bookingId": order.booking_id
        }

        try:
            resp = requests.post(
                "https://fapshi-node.onrender.com/initiatePayment",
                json=payload,
                timeout=15
            )
            data = resp.json()
            if resp.status_code == 200 and data.get('link'):
                return Response({"payment_link": data['link']})
            else:
                return Response({"detail": data.get('message', 'Payment initiation failed.')}, status=400)
        except Exception as e:
            return Response({"detail": f"Payment service error: {str(e)}"}, status=500)