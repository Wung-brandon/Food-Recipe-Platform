# Food Recipe/backend/shop/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from django.core.exceptions import ValidationError

class Product(models.Model):
    name = models.CharField(max_length=500)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(max_length=1000)
    amazon_url = models.URLField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart of {self.user.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('cart', 'product')

    def __str__(self):
        return f"{self.quantity} of {self.product.name} in {self.cart.user.username}'s cart"


class Ingredient(models.Model):
    name = models.CharField(max_length=500)
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True, max_length=1000) # Optional image URL for the ingredient
    source_url = models.URLField(max_length=1000) # URL on the African food supermarket website
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True) # Price might not always be available or relevant for raw ingredients
    unit = models.CharField(max_length=50, blank=True, null=True) # e.g., "kg", "g", "piece"
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class GuestSession(models.Model):
    """Track guest sessions for cart management"""
    session_key = models.CharField(max_length=100, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'guest_sessions'
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def extend_session(self):
        """Extend session by 7 days"""
        self.expires_at = timezone.now() + timedelta(days=7)
        self.save(update_fields=['expires_at', 'last_activity'])
class PlatformIngredient(models.Model):
    name = models.CharField(max_length=500)
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True, max_length=1000)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class PlatformIngredientCart(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, 
                           related_name='platformingredientcart', null=True, blank=True)
    session_key = models.CharField(max_length=100, null=True, blank=True, db_index=True)  # For guests
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Ensure either user or session_key is present, but not both
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(user__isnull=False, session_key__isnull=True) |
                    models.Q(user__isnull=True, session_key__isnull=False)
                ),
                name='cart_owner_constraint'
            )
        ]
    
    def clean(self):
        if self.user and self.session_key:
            raise ValidationError("Cart cannot have both user and session_key")
        if not self.user and not self.session_key:
            raise ValidationError("Cart must have either user or session_key")
    
    @property
    def total_items(self):
        return self.items.aggregate(total=models.Sum('quantity'))['total'] or 0
    
    @property
    def total_price(self):
        return sum(item.total_price for item in self.items.all())
    def __str__(self):
        return f"Cart ({self.user or 'Guest'})"

class PlatformIngredientCartItem(models.Model):
    cart = models.ForeignKey(PlatformIngredientCart, on_delete=models.CASCADE, related_name='items')
    ingredient = models.ForeignKey(PlatformIngredient, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('cart', 'ingredient')

    def __str__(self):
        return f"{self.quantity} of {self.ingredient.name} in {self.cart.user.username}'s platform ingredient cart"