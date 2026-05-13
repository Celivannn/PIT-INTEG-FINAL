from django.conf import settings
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User
from .serializers import RegisterSerializer, UserProfileSerializer
from .permissions import IsAdmin


class RegisterView(generics.CreateAPIView):
    """Public endpoint — creates customer accounts only."""
    queryset           = User.objects.all()
    serializer_class   = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {'detail': 'Account created successfully.', 'email': user.email},
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    """
    Authenticates user.
    - Web: returns access token in body, sets refresh in HttpOnly cookie.
    - Mobile: returns BOTH access and refresh tokens in body.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email    = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({'detail': 'Account is disabled.'}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        access  = str(refresh.access_token)

        response = Response({
            'access':  access,
            'refresh': str(refresh),   # included for mobile clients
            'user': {
                'id':        user.id,
                'email':     user.email,
                'full_name': user.full_name,
                'role':      user.role,
            }
        })

        # Also set HttpOnly cookie for web clients
        jwt_settings = settings.SIMPLE_JWT
        response.set_cookie(
            key      = jwt_settings.get('AUTH_COOKIE', 'refresh_token'),
            value    = str(refresh),
            httponly = jwt_settings.get('AUTH_COOKIE_HTTP_ONLY', True),
            samesite = jwt_settings.get('AUTH_COOKIE_SAMESITE', 'Lax'),
            secure   = jwt_settings.get('AUTH_COOKIE_SECURE', False),
            max_age  = int(jwt_settings['REFRESH_TOKEN_LIFETIME'].total_seconds()),
        )
        return response


class LogoutView(APIView):
    """
    Blacklists refresh token.
    Accepts token from cookie (web) or request body (mobile).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        jwt_settings  = settings.SIMPLE_JWT
        cookie_name   = jwt_settings.get('AUTH_COOKIE', 'refresh_token')

        # Try body first (mobile), fallback to cookie (web)
        refresh_token = request.data.get('refresh') or request.COOKIES.get(cookie_name)

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass

        response = Response({'detail': 'Logged out successfully.'})
        response.delete_cookie(cookie_name)
        return response


class TokenRefreshCookieView(APIView):
    """
    Silent token refresh.
    Accepts refresh token from HttpOnly cookie (web) or request body (mobile).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        jwt_settings  = settings.SIMPLE_JWT
        cookie_name   = jwt_settings.get('AUTH_COOKIE', 'refresh_token')

        refresh_token = request.data.get('refresh') or request.COOKIES.get(cookie_name)

        if not refresh_token:
            return Response({'detail': 'Refresh token not found.'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            refresh = RefreshToken(refresh_token)
            access  = str(refresh.access_token)

            response = Response({
                'access':  access,
                'refresh': str(refresh),
            })

            if jwt_settings.get('ROTATE_REFRESH_TOKENS', False):
                response.set_cookie(
                    key      = cookie_name,
                    value    = str(refresh),
                    httponly = jwt_settings.get('AUTH_COOKIE_HTTP_ONLY', True),
                    samesite = jwt_settings.get('AUTH_COOKIE_SAMESITE', 'Lax'),
                    secure   = jwt_settings.get('AUTH_COOKIE_SECURE', False),
                    max_age  = int(jwt_settings['REFRESH_TOKEN_LIFETIME'].total_seconds()),
                )
            return response

        except TokenError as e:
            return Response({'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)


class ProfileView(generics.RetrieveUpdateAPIView):
    """Logged-in user can view and update their own profile."""
    serializer_class   = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user