from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView,
    TokenRefreshCookieView, ProfileView,
    GoogleLoginView, VerifyOTPView,  # Add VerifyOTPView here
)

urlpatterns = [
    path('register/',      RegisterView.as_view(),           name='auth-register'),
    path('login/',         LoginView.as_view(),              name='auth-login'),
    path('logout/',        LogoutView.as_view(),             name='auth-logout'),
    path('token/refresh/', TokenRefreshCookieView.as_view(), name='auth-token-refresh'),
    path('profile/',       ProfileView.as_view(),            name='auth-profile'),
    path('google/',        GoogleLoginView.as_view(),        name='auth-google'),
    path('verify-otp/',    VerifyOTPView.as_view(),          name='verify-otp'),  # ADD THIS LINE
]