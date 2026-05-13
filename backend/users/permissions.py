from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allow access only to users with role == 'admin'."""
    message = 'Admin access required.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_admin
        )


class IsCustomer(BasePermission):
    """Allow access only to users with role == 'customer'."""
    message = 'Customer access required.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_customer
        )


class IsAdminOrReadOnly(BasePermission):
    """Read access for everyone authenticated; write access for admins only."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return request.user.is_admin
