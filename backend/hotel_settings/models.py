from django.db import models


class HotelSettings(models.Model):
    """Singleton table — only one row ever exists."""
    hotel_name          = models.CharField(max_length=150, default='My Hotel')
    address             = models.TextField(blank=True)
    contact_email       = models.EmailField(blank=True)
    contact_phone       = models.CharField(max_length=20, blank=True)
    check_in_time       = models.TimeField(default='14:00')
    check_out_time      = models.TimeField(default='12:00')
    cancellation_policy = models.TextField(blank=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        db_table  = 'hotel_settings'
        verbose_name = 'Hotel Settings'

    def __str__(self):
        return self.hotel_name

    def save(self, *args, **kwargs):
        self.pk = 1  # Force singleton
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
