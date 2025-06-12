import re
from django.contrib.sessions.models import Session
from django.utils import timezone
from datetime import timedelta

class GuestSessionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Handle custom guest session header
        guest_session_key = request.headers.get('X-Guest-Session')
        
        if guest_session_key:
            # Validate session key format (should start with 'guest_' and be 64+ chars)
            if self.is_valid_guest_session_key(guest_session_key):
                request.guest_session_key = guest_session_key
            else:
                request.guest_session_key = None
        else:
            request.guest_session_key = None

        # Create Django session for unauthenticated users if needed
        user = getattr(request, 'user', None)
        if (user is None or not getattr(user, 'is_authenticated', False)) and not request.session.session_key:
            request.session.create()

        return self.get_response(request)

    def is_valid_guest_session_key(self, session_key):
        """Validate guest session key format"""
        if not session_key or not isinstance(session_key, str):
            return False
        
        # Should match pattern: guest_[64 hex characters]
        pattern = r'^guest_[a-f0-9]{64}$'
        return bool(re.match(pattern, session_key))
