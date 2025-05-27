from rest_framework import permissions

class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow authors of a recipe to edit or delete it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the author of the recipe
        return obj.author == request.user


class IsVerifiedChef(permissions.BasePermission):
    """
    Custom permission to only allow verified chefs to create recipes.
    """
    def has_permission(self, request, view):
        # Allow read permissions for everyone
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return False
            
        # Check if user is a chef
        if not request.user.role == 'CHEF':
            return False
            
        # Check if user is verified
        # if not request.user.is_verified:
        #     return False
            
        # # Check if chef profile exists and is verified
        # try:
        #     chef_profile = request.user.chef_profile
        #     return chef_profile.verification_status == 'VERIFIED'
        # except:
        #     return False
