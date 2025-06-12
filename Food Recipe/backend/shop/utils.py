from django.utils import timezone
from django.db import transaction
from .models import PlatformIngredientCart, GuestSession
import logging

logger = logging.getLogger(__name__)

def merge_guest_cart_to_user(user, guest_session_key):
    """
    Merge guest cart items into user cart when user logs in
    """
    try:
        with transaction.atomic():
            # Get guest cart
            guest_cart = PlatformIngredientCart.objects.filter(
                session_key=guest_session_key,
                user__isnull=True
            ).first()
            
            if not guest_cart:
                return False
            
            # Get or create user cart
            user_cart, created = PlatformIngredientCart.objects.get_or_create(
                user=user,
                defaults={'session_key': None}
            )
            
            # Merge items
            merged_items = 0
            for guest_item in guest_cart.items.all():
                user_item, created = user_cart.items.get_or_create(
                    ingredient=guest_item.ingredient,
                    defaults={'quantity': guest_item.quantity}
                )
                
                if not created:
                    # Add quantities if item already exists
                    user_item.quantity += guest_item.quantity
                    user_item.save()
                
                merged_items += 1
            
            # Delete guest cart
            guest_cart.delete()
            
            logger.info(f"Merged {merged_items} items from guest cart to user {user.id}")
            return True
            
    except Exception as e:
        logger.error(f"Error merging guest cart to user: {e}")
        return False

def cleanup_old_guest_sessions(days_old=30):
    """
    Cleanup guest sessions older than specified days
    """
    cutoff_date = timezone.now() - timezone.timedelta(days=days_old)
    
    try:
        # Find old guest sessions
        old_sessions = GuestSession.objects.filter(created_at__lt=cutoff_date)
        session_keys = list(old_sessions.values_list('session_key', flat=True))
        
        # Delete associated carts first
        deleted_carts = PlatformIngredientCart.objects.filter(
            session_key__in=session_keys,
            user__isnull=True
        ).delete()[0]
        
        # Delete sessions
        deleted_sessions = old_sessions.delete()[0]
        
        logger.info(f"Cleaned up {deleted_sessions} old guest sessions and {deleted_carts} carts")
        return deleted_sessions, deleted_carts
        
    except Exception as e:
        logger.error(f"Error cleaning up old guest sessions: {e}")
        return 0, 0
