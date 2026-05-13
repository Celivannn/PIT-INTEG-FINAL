from django.db import models


class RoomType(models.Model):
    # Remove TYPE_CHOICES - allow any custom name
    name        = models.CharField(max_length=50, unique=True)  # Removed choices parameter
    description = models.TextField(blank=True)
    capacity    = models.PositiveSmallIntegerField(default=2)
    base_price  = models.DecimalField(max_digits=10, decimal_places=2)
    amenities   = models.JSONField(default=list, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'room_types'

    def __str__(self):
        return self.name  # Changed from get_name_display()


class Room(models.Model):
    STATUS_CHOICES = (
        ('available',   'Available'),
        ('occupied',    'Occupied'),
        ('maintenance', 'Maintenance'),
    )

    room_number = models.CharField(max_length=10, unique=True)
    room_type   = models.ForeignKey(RoomType, on_delete=models.PROTECT, related_name='rooms')
    floor       = models.PositiveSmallIntegerField()
    status      = models.CharField(max_length=15, choices=STATUS_CHOICES, default='available')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rooms'
        ordering = ['floor', 'room_number']

    def __str__(self):
        return f'Room {self.room_number} ({self.room_type})'

    @property
    def is_bookable(self):
        return self.status != 'maintenance'


class RoomImage(models.Model):
    room       = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='images')
    image      = models.ImageField(upload_to='rooms/%Y/%m/')
    is_primary = models.BooleanField(default=False)
    order      = models.PositiveSmallIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'room_images'
        ordering = ['order', 'uploaded_at']

    def save(self, *args, **kwargs):
        # Enforce max 5 images per room
        if not self.pk:
            count = RoomImage.objects.filter(room=self.room).count()
            if count >= 5:
                raise ValueError('A room cannot have more than 5 images.')
        super().save(*args, **kwargs)
