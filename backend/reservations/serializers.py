# reservations/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import Reservation
from rooms.serializers import RoomListSerializer
from rooms.models import Room


class ReservationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Reservation
        fields = ('room', 'check_in', 'check_out', 'guests')

    def validate(self, attrs):
        check_in  = attrs['check_in']
        check_out = attrs['check_out']
        room      = attrs['room']

        if check_out <= check_in:
            raise serializers.ValidationError('check_out must be after check_in.')

        if check_in < timezone.now().date():
            raise serializers.ValidationError('check_in cannot be in the past.')

        if room.status == 'maintenance':
            raise serializers.ValidationError('This room is currently under maintenance.')

        # Check for overlapping reservations
        conflict = Reservation.objects.filter(
            room=room,
            status__in=['pending', 'confirmed', 'checked_in'],
            check_in__lt=check_out,
            check_out__gt=check_in,
        ).exists()
        if conflict:
            raise serializers.ValidationError('Room is not available for the selected dates.')

        # Validate guest count against room capacity
        if attrs['guests'] > room.room_type.capacity:
            raise serializers.ValidationError(
                f'This room type supports a maximum of {room.room_type.capacity} guests.'
            )

        return attrs

    def create(self, validated_data):
        room  = validated_data['room']
        nights = (validated_data['check_out'] - validated_data['check_in']).days
        price_per_night = room.room_type.base_price

        return Reservation.objects.create(
            user            = self.context['request'].user,
            price_per_night = price_per_night,
            total_price     = price_per_night * nights,
            **validated_data
        )


class ReservationListSerializer(serializers.ModelSerializer):
    room            = RoomListSerializer(read_only=True)
    can_cancel      = serializers.BooleanField(source='can_customer_cancel', read_only=True)
    nights          = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Reservation
        fields = (
            'id', 'booking_ref', 'room', 'check_in', 'check_out',
            'guests', 'nights', 'price_per_night', 'total_price',
            'status', 'can_cancel', 'created_at',
        )


class AdminReservationSerializer(serializers.ModelSerializer):
    """Full detail for admin — includes customer info."""
    room        = RoomListSerializer(read_only=True)
    customer_email    = serializers.EmailField(source='user.email', read_only=True)
    customer_name     = serializers.CharField(source='user.full_name', read_only=True)
    nights      = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Reservation
        fields = (
            'id', 'booking_ref', 'room',
            'customer_email', 'customer_name',
            'check_in', 'check_out', 'guests', 'nights',
            'price_per_night', 'total_price',
            'status', 'created_at', 'updated_at',
        )


class ReservationStatusUpdateSerializer(serializers.ModelSerializer):
    """Admin-only status transitions."""
    VALID_TRANSITIONS = {
        'pending':     ['confirmed', 'cancelled'],
        'confirmed':   ['checked_in', 'cancelled'],
        'checked_in':  ['checked_out'],
        'checked_out': [],
        'cancelled':   [],
    }

    class Meta:
        model  = Reservation
        fields = ('status',)

    def validate_status(self, value):
        current = self.instance.status
        allowed = self.VALID_TRANSITIONS.get(current, [])
        if value not in allowed:
            raise serializers.ValidationError(
                f'Cannot transition from "{current}" to "{value}". '
                f'Allowed: {allowed or "none"}'
            )
        return value

    def update(self, instance, validated_data):
        """Update reservation status and sync room status"""
        old_status = instance.status
        new_status = validated_data['status']
        
        # Update reservation status
        instance.status = new_status
        instance.save(update_fields=['status', 'updated_at'])
        
        # Get the room
        room = instance.room
        now = timezone.now().date()
        
        # Update room status based on the new reservation status
        if new_status == 'checked_in':
            # Guest checked in - mark room as occupied
            if room.status != 'occupied':
                room.status = 'occupied'
                room.save(update_fields=['status', 'updated_at'])
                
        elif new_status == 'checked_out':
            # Guest checked out - check if room has future reservations
            has_future_reservation = Reservation.objects.filter(
                room=room,
                status='confirmed',
                check_in__gt=now
            ).exists()
            
            if has_future_reservation:
                # Room will be used again soon, keep as occupied or set to maintenance
                room.status = 'occupied'  # Or 'maintenance' depending on your policy
            else:
                room.status = 'available'
            room.save(update_fields=['status', 'updated_at'])
            
        elif new_status == 'cancelled':
            # Reservation cancelled - check if room should be available
            # Check if there's any active reservation for this room
            has_active_reservation = Reservation.objects.filter(
                room=room,
                status__in=['checked_in', 'confirmed'],
                check_in__lte=now,
                check_out__gt=now
            ).exists()
            
            if not has_active_reservation:
                room.status = 'available'
                room.save(update_fields=['status', 'updated_at'])
        
        return instance