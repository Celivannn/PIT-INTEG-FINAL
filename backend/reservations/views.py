from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Reservation
from .serializers import (
    ReservationCreateSerializer,
    ReservationListSerializer,
    AdminReservationSerializer,
    ReservationStatusUpdateSerializer,
)
from users.permissions import IsAdmin, IsCustomer


# ─── Customer Views ───────────────────────────────────────────────────────────

class CustomerReservationListCreateView(generics.ListCreateAPIView):
    """
    GET  — list own reservations only
    POST — create a new reservation
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reservation.objects.filter(
            user=self.request.user
        ).select_related('room', 'room__room_type').prefetch_related('room__images')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReservationCreateSerializer
        return ReservationListSerializer

    def create(self, request, *args, **kwargs):
        # Block admins from making reservations
        if request.user.is_admin:
            return Response(
                {'detail': 'Admin accounts cannot make reservations.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)


class CustomerReservationDetailView(generics.RetrieveAPIView):
    """Customer views their own reservation detail."""
    serializer_class   = ReservationListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user)


class CustomerCancelView(APIView):
    """Customer cancels their own reservation (within policy)."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            reservation = Reservation.objects.get(pk=pk, user=request.user)
        except Reservation.DoesNotExist:
            return Response({'detail': 'Reservation not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not reservation.can_customer_cancel:
            return Response(
                {'detail': 'This reservation can no longer be cancelled. '
                           'Cancellation is only allowed within 24 hours of booking '
                           'and while status is Pending or Confirmed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reservation.status = 'cancelled'
        reservation.save(update_fields=['status', 'updated_at'])
        return Response({'detail': 'Reservation cancelled successfully.'})


# ─── Admin Views ──────────────────────────────────────────────────────────────

class AdminReservationListView(generics.ListAPIView):
    """Admin views ALL reservations with search and filter."""
    serializer_class   = AdminReservationSerializer
    permission_classes = [IsAdmin]
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['booking_ref', 'user__email', 'user__full_name', 'room__room_number']
    ordering_fields    = ['created_at', 'check_in', 'check_out', 'total_price']
    ordering           = ['-created_at']

    def get_queryset(self):
        qs = Reservation.objects.select_related(
            'user', 'room', 'room__room_type'
        ).prefetch_related('room__images')

        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        date_from = self.request.query_params.get('date_from')
        date_to   = self.request.query_params.get('date_to')
        if date_from:
            qs = qs.filter(check_in__gte=date_from)
        if date_to:
            qs = qs.filter(check_in__lte=date_to)

        return qs


class AdminReservationDetailView(generics.RetrieveAPIView):
    queryset           = Reservation.objects.select_related('user', 'room', 'room__room_type')
    serializer_class   = AdminReservationSerializer
    permission_classes = [IsAdmin]


class AdminReservationStatusView(APIView):
    """Admin updates reservation status."""
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        try:
            reservation = Reservation.objects.get(pk=pk)
        except Reservation.DoesNotExist:
            return Response({'detail': 'Reservation not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReservationStatusUpdateSerializer(
            reservation, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(AdminReservationSerializer(reservation).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
