from django.urls import path
from .views import OrderListCreateView, OrderDetailView, UserOrderListView, InitiatePaymentView, initiate_fapshi_payment

urlpatterns = [
    path('', OrderListCreateView.as_view(), name='order-list-create'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('my/', UserOrderListView.as_view(), name='user-orders'),
    path('initiate-payment/', initiate_fapshi_payment, name='initiate_fapshi_payment'),
    # path('initiate-payment/', InitiatePaymentView.as_view(), name='initiate-payment'),
]
