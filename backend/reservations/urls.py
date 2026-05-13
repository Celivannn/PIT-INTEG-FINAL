from django.urls import path
from .views import (
    CustomerReservationListCreateView,
    CustomerReservationDetailView,
    CustomerCancelView,
    AdminReservationListView,
    AdminReservationDetailView,
    AdminReservationStatusView,
)

urlpatterns = [
    # Customer endpoints
    path('',                          CustomerReservationListCreateView.as_view(), name='reservation-list-create'),
    path('<int:pk>/',                 CustomerReservationDetailView.as_view(),     name='reservation-detail'),
    path('<int:pk>/cancel/',          CustomerCancelView.as_view(),                name='reservation-cancel'),

    # Admin endpoints
    path('admin/',                    AdminReservationListView.as_view(),          name='admin-reservation-list'),
    path('admin/<int:pk>/',           AdminReservationDetailView.as_view(),        name='admin-reservation-detail'),
    path('admin/<int:pk>/status/',    AdminReservationStatusView.as_view(),        name='admin-reservation-status'),
]
