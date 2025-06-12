from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_amount', 'payment_status', 'booking_id', 'created_at')
    inlines = [OrderItemInline]
    search_fields = ('user__username', 'booking_id')
    list_filter = ('payment_status', 'created_at')

admin.site.register(Order, OrderAdmin)
admin.site.register(OrderItem)
