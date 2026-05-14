from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
import random
import string
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required.')
        email = self.normalize_email(email)
        extra_fields.setdefault('role', 'customer')
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_admin(self, email, password=None, **extra_fields):
        """Used by management command only — never via public API."""
        extra_fields['role'] = 'admin'
        extra_fields.setdefault('is_staff', True)
        return self.create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields['role'] = 'admin'
        extra_fields['is_staff'] = True
        extra_fields['is_superuser'] = True
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('admin', 'Admin'),
    )

    email       = models.EmailField(unique=True)
    full_name   = models.CharField(max_length=150)
    phone       = models.CharField(max_length=20, blank=True)
    role        = models.CharField(max_length=10, choices=ROLE_CHOICES, default='customer')
    is_active   = models.BooleanField(default=True)
    is_staff    = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)  # ADD THIS FIELD
    created_at  = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f'{self.email} ({self.role})'

    @property
    def is_admin(self):
        return self.role == 'admin'

    @property
    def is_customer(self):
        return self.role == 'customer'


# ADD THIS OTP MODEL AT THE BOTTOM
class OTPVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    @classmethod
    def generate_otp(cls):
        return ''.join(random.choices(string.digits, k=6))
    
    def is_valid(self):
        return not self.is_used and self.expires_at > timezone.now()
    
    def __str__(self):
        return f"{self.user.email} - {self.otp_code}"