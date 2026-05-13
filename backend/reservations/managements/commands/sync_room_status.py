# reservations/management/commands/sync_room_status.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from reservations.models import Reservation
from rooms.models import Room

class Command(BaseCommand):
    help = 'Sync room status based on current reservations'

    def handle(self, *args, **options):
        now = timezone.now().date()
        
        # Get all rooms with active reservations
        active_room_ids = Reservation.objects.filter(
            status__in=['checked_in', 'confirmed'],
            check_in__lte=now,
            check_out__gt=now
        ).values_list('room_id', flat=True).distinct()
        
        # Update occupied rooms
        occupied_count = Room.objects.filter(id__in=active_room_ids).exclude(status='occupied').update(status='occupied')
        
        # Update available rooms
        available_count = Room.objects.exclude(id__in=active_room_ids).exclude(status='available').update(status='available')
        
        self.stdout.write(
            self.style.SUCCESS(f'Synced room status: {occupied_count} set to occupied, {available_count} set to available')
        )