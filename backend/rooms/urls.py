from django.urls import path
from .views import (
    RoomTypeListCreateView, RoomTypeDetailView,
    RoomListCreateView, RoomDetailView,
    AvailabilityView, RoomImageUploadView,
)

urlpatterns = [
    # Room types
    path('types/',           RoomTypeListCreateView.as_view(), name='room-type-list'),
    path('types/<int:pk>/',  RoomTypeDetailView.as_view(),     name='room-type-detail'),

    # Availability (before <pk> to avoid conflict)
    path('availability/',    AvailabilityView.as_view(),        name='room-availability'),

    # Rooms
    path('',                 RoomListCreateView.as_view(),      name='room-list'),
    path('<int:pk>/',        RoomDetailView.as_view(),          name='room-detail'),

    # Images
    path('<int:room_pk>/images/',              RoomImageUploadView.as_view(), name='room-image-upload'),
    path('<int:room_pk>/images/<int:image_pk>/', RoomImageUploadView.as_view(), name='room-image-delete'),
]
