from django.conf import settings
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from .models import User
from .serializers import RegisterSerializer, UserProfileSerializer
from .permissions import IsAdmin

GOOGLE_CLIENT_ID = '980255551628-8d082bil9atm1fd8b8m2t03v60pi3k2j.apps.googleusercontent.com'


class RegisterView(generics.CreateAPIView):
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
            'refresh': str(refresh),
            'user': {
                'id':        user.id,
                'email':     user.email,
                'full_name': user.full_name,
                'role':      user.role,
            }
        })

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


class GoogleLoginView(APIView):
    """
    Accepts a Google ID token from web (credential) or
    access token from mobile (expo-auth-session).
    Creates the user account automatically if first login.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        token      = request.data.get('token')
        email      = request.data.get('email')
        full_name  = request.data.get('name', '')

        if not token:
            return Response({'detail': 'Token required.'}, status=400)

        # ── Web: verify Google ID token ──────────────────────────────────────
        if not email:
            try:
                idinfo    = id_token.verify_oauth2_token(
                    token, google_requests.Request(), GOOGLE_CLIENT_ID
                )
                email     = idinfo.get('email')
                full_name = idinfo.get('name', '')
            except ValueError as e:
                return Response({'detail': f'Invalid Google token: {str(e)}'}, status=401)

        if not email:
            return Response({'detail': 'Email not provided.'}, status=400)

        # ── Get or create user ───────────────────────────────────────────────
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'full_name': full_name,
                'role':      'customer',
                'is_active': True,
            }
        )

        if not created and not user.full_name and full_name:
            user.full_name = full_name
            user.save(update_fields=['full_name'])

        # ── Generate JWT ─────────────────────────────────────────────────────
        refresh = RefreshToken.for_user(user)

        response = Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id':        user.id,
                'email':     user.email,
                'full_name': user.full_name,
                'role':      user.role,
            },
            'created': created,
        })

        jwt_settings = settings.SIMPLE_JWT
        response.set_cookie(
            key      = jwt_settings.get('AUTH_COOKIE', 'refresh_token'),
            value    = str(refresh),
            httponly = True,
            samesite = 'Lax',
            secure   = False,
            max_age  = int(jwt_settings['REFRESH_TOKEN_LIFETIME'].total_seconds()),
        )
        return response


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        jwt_settings  = settings.SIMPLE_JWT
        cookie_name   = jwt_settings.get('AUTH_COOKIE', 'refresh_token')
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
            response = Response({'access': access, 'refresh': str(refresh)})

            if jwt_settings.get('ROTATE_REFRESH_TOKENS', False):
                response.set_cookie(
                    key      = cookie_name,
                    value    = str(refresh),
                    httponly = True,
                    samesite = 'Lax',
                    secure   = False,
                    max_age  = int(jwt_settings['REFRESH_TOKEN_LIFETIME'].total_seconds()),
                )
            return response

        except TokenError as e:
            return Response({'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class   = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user