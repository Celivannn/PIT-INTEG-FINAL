# reservations/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from .models import Reservation
from rooms.models import Room

@receiver([post_save, post_delete], sender=Reservation)
def sync_room_status(sender, instance, **kwargs):
    """
    Automatically update room status whenever a reservation is saved or deleted.
    This ensures room status stays in sync with all reservation changes.
    """
    room = instance.room
    now = timezone.now().date()
    
    # Check if room has any active reservation (checked_in or confirmed with current dates)
    has_active_reservation = Reservation.objects.filter(
        room=room,
        status__in=['checked_in', 'confirmed'],
        check_in__lte=now,
        check_out__gt=now
    ).exists()
    
    # Check if room has any future confirmed reservation
    has_future_reservation = Reservation.objects.filter(
        room=room,
        status='confirmed',
        check_in__gt=now
    ).exists()
    
    # Determine correct room status
    if has_active_reservation:
        # Room is currently occupied
        if room.status != 'occupied':
            room.status = 'occupied'
            room.save(update_fields=['status', 'updated_at'])
    elif not has_future_reservation:
        # No active or future reservations, room is available
        if room.status != 'available':
            room.status = 'available'
            room.save(update_fields=['status', 'updated_at'])
    # If has_future_reservation but no active, keep current status (usually available)