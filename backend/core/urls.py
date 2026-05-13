from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('django-admin/', admin.site.urls),

    # API routes
    path('api/auth/',         include('users.urls')),
    path('api/rooms/',        include('rooms.urls')),
    path('api/reservations/', include('reservations.urls')),
    path('api/admin/',        include('reports.urls')),
    path('api/settings/',     include('hotel_settings.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
