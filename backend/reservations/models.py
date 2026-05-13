import random
import string
from django.db import models
from django.utils import timezone
from django.conf import settings


def generate_booking_ref():
    """Generates HR-YYYYMMDD-XXXX format."""
    date_str   = timezone.now().strftime('%Y%m%d')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f'HR-{date_str}-{random_str}'


class Reservation(models.Model):
    STATUS_CHOICES = (
        ('pending',     'Pending'),
        ('confirmed',   'Confirmed'),
        ('checked_in',  'Checked In'),
        ('checked_out', 'Checked Out'),
        ('cancelled',   'Cancelled'),
    )

    # Core fields
    booking_ref = models.CharField(max_length=20, unique=True, editable=False)
    user        = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='reservations'
    )
    room        = models.ForeignKey(
        'rooms.Room',
        on_delete=models.PROTECT,
        related_name='reservations'
    )

    # Stay details
    check_in    = models.DateField()
    check_out   = models.DateField()
    guests      = models.PositiveSmallIntegerField(default=1)

    # Pricing — locked at booking time
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    total_price     = models.DecimalField(max_digits=10, decimal_places=2)

    # Status
    status      = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')

    # Timestamps
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reservations'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.booking_ref} — {self.user.email}'

    def save(self, *args, **kwargs):
        # Auto-generate booking ref on first save
        if not self.booking_ref:
            ref = generate_booking_ref()
            while Reservation.objects.filter(booking_ref=ref).exists():
                ref = generate_booking_ref()
            self.booking_ref = ref
        super().save(*args, **kwargs)

    @property
    def nights(self):
        return (self.check_out - self.check_in).days

    @property
    def can_customer_cancel(self):
        """
        Customer can cancel if:
        - Status is 'pending' or 'confirmed'
        - AND reservation was created within the last 24 hours
        """
        from datetime import timedelta
        if self.status not in ('pending', 'confirmed'):
            return False
        cutoff = self.created_at + timedelta(hours=24)
        return timezone.now() <= cutoff
