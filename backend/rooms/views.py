from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from django.utils.dateparse import parse_date

from .models import RoomType, Room, RoomImage
from .serializers import (
    RoomTypeSerializer, RoomListSerializer,
    RoomDetailSerializer, RoomWriteSerializer, RoomImageSerializer
)
from users.permissions import IsAdmin


# ─── Room Types ──────────────────────────────────────────────────────────────

class RoomTypeListCreateView(generics.ListCreateAPIView):
    queryset         = RoomType.objects.all()
    serializer_class = RoomTypeSerializer
    pagination_class = None

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdmin()]


class RoomTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset         = RoomType.objects.all()
    serializer_class = RoomTypeSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdmin()]


# ─── Rooms ───────────────────────────────────────────────────────────────────

class RoomListCreateView(generics.ListCreateAPIView):
    filter_backends  = [filters.SearchFilter]
    search_fields    = ['room_number', 'room_type__name']

    def get_queryset(self):
        qs = Room.objects.select_related('room_type').prefetch_related('images')
        room_type = self.request.query_params.get('type')
        if room_type:
            qs = qs.filter(room_type__name=room_type)
        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RoomWriteSerializer
        return RoomListSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdmin()]

    # No custom create() needed — serializer handles string IDs correctly now


class RoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Room.objects.select_related('room_type').prefetch_related('images')

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return RoomWriteSerializer
        return RoomDetailSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdmin()]

    # No custom update() needed — serializer handles string IDs correctly now


# ─── Availability ────────────────────────────────────────────────────────────

class AvailabilityView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        check_in_str  = request.query_params.get('check_in')
        check_out_str = request.query_params.get('check_out')
        room_type     = request.query_params.get('type')

        if not check_in_str or not check_out_str:
            return Response(
                {'detail': 'check_in and check_out query parameters are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        check_in  = parse_date(check_in_str)
        check_out = parse_date(check_out_str)

        if not check_in or not check_out:
            return Response(
                {'detail': 'Invalid date format. Use YYYY-MM-DD.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if check_out <= check_in:
            return Response(
                {'detail': 'check_out must be after check_in.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from reservations.models import Reservation
        booked_room_ids = Reservation.objects.filter(
            status__in=['pending', 'confirmed', 'checked_in'],
            check_in__lt=check_out,
            check_out__gt=check_in,
        ).values_list('room_id', flat=True)

        available = Room.objects.select_related('room_type').prefetch_related('images').filter(
            status='available'
        ).exclude(id__in=booked_room_ids)

        if room_type:
            available = available.filter(room_type__name=room_type)

        serializer = RoomListSerializer(available, many=True, context={'request': request})
        return Response(serializer.data)


# ─── Room Images ─────────────────────────────────────────────────────────────

class RoomImageUploadView(APIView):
    permission_classes = [IsAdmin]
    parser_classes     = [MultiPartParser, FormParser]

    def post(self, request, room_pk):
        try:
            room = Room.objects.get(pk=room_pk)
        except Room.DoesNotExist:
            return Response({'detail': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)

        current_count = RoomImage.objects.filter(room=room).count()
        if current_count >= 5:
            return Response(
                {'detail': f'Maximum 5 images per room. Current: {current_count}/5'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = RoomImageSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                is_primary = request.data.get('is_primary', False)
                if current_count == 0:
                    is_primary = True

                serializer.save(room=room, is_primary=is_primary)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except ValueError as e:
                return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({'detail': f'Upload failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, room_pk, image_pk):
        try:
            image = RoomImage.objects.get(pk=image_pk, room_id=room_pk)
            image.image.delete(save=False)
            image.delete()

            # If deleted image was primary, promote the next one
            remaining = RoomImage.objects.filter(room_id=room_pk)
            if remaining.exists() and not remaining.filter(is_primary=True).exists():
                first = remaining.first()
                first.is_primary = True
                first.save(update_fields=['is_primary'])

            return Response(status=status.HTTP_204_NO_CONTENT)
        except RoomImage.DoesNotExist:
            return Response({'detail': 'Image not found.'}, status=status.HTTP_404_NOT_FOUND)