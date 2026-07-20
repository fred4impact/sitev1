from rest_framework.permissions import BasePermission


def HasRole(*roles):
    """Permission factory: allows only authenticated users whose role is in `roles`."""

    class _HasRole(BasePermission):
        def has_permission(self, request, view):
            user = request.user
            return bool(user and user.is_authenticated and user.role in roles)

    return _HasRole


IsAdministrator = HasRole("admin")
IsHostOrAdministrator = HasRole("host", "admin")
IsArtistOrAdministrator = HasRole("artist", "admin")
