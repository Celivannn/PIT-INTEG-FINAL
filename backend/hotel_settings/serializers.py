from rest_framework import serializers
from .models import HotelSettings


class HotelSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model  = HotelSettings
        fields = (
            'hotel_name', 'address', 'contact_email', 'contact_phone',
            'check_in_time', 'check_out_time', 'cancellation_policy', 'updated_at',
        )
        read_only_fields = ('updated_at',)
