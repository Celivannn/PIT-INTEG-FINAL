from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, label='Confirm password')

    class Meta:
        model  = User
        fields = ('email', 'full_name', 'phone', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        # role is always 'customer' for public registration
        return User.objects.create_user(**validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ('id', 'email', 'full_name', 'phone', 'role', 'created_at')
        read_only_fields = ('id', 'email', 'role', 'created_at')


class AdminUserListSerializer(serializers.ModelSerializer):
    """Used by admin to list all customers."""
    total_reservations = serializers.IntegerField(read_only=True)

    class Meta:
        model  = User
        fields = ('id', 'email', 'full_name', 'phone', 'created_at', 'total_reservations')
