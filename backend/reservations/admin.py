from django.contrib import admin
from .models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display   = ('booking_ref', 'user', 'room', 'check_in', 'check_out', 'status', 'total_price')
    list_filter    = ('status',)
    search_fields  = ('booking_ref', 'user__email', 'room__room_number')
    readonly_fields = ('booking_ref', 'price_per_night', 'total_price', 'created_at', 'updated_at')
    ordering       = ('-created_at',)
