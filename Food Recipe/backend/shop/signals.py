from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from .models import PlatformIngredientCart

@receiver(user_logged_in)
def merge_guest_cart(sender, request, user, **kwargs):
    if 'session_key' in request.session:
        guest_cart = PlatformIngredientCart.objects.filter(
            session_key=request.session.session_key,
            user=None
        ).first()
        
        if guest_cart:
            user_cart, _ = PlatformIngredientCart.objects.get_or_create(user=user)
            
            # Merge items
            for item in guest_cart.items.all():
                existing = user_cart.items.filter(ingredient=item.ingredient).first()
                if existing:
                    existing.quantity += item.quantity
                    existing.save()
                else:
                    item.cart = user_cart
                    item.save()
            
            guest_cart.delete()  # Clean up