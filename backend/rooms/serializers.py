from rest_framework import serializers
from .models import RoomType, Room, RoomImage


class RoomImageSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = RoomImage
        fields = ('id', 'image', 'image_url', 'is_primary', 'order')

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class RoomTypeSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    class Meta:
        model = RoomType
        fields = ('id', 'name', 'description', 'capacity', 'base_price', 'amenities')


class RoomListSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    room_type = RoomTypeSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    images = RoomImageSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ('id', 'room_number', 'room_type', 'floor', 'status', 'primary_image', 'images')

    def get_primary_image(self, obj):
        request = self.context.get('request')
        primary = obj.images.filter(is_primary=True).first()
        if primary:
            return request.build_absolute_uri(primary.image.url) if request else primary.image.url
        first = obj.images.first()
        if first:
            return request.build_absolute_uri(first.image.url) if request else first.image.url
        return None


class RoomDetailSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    room_type = RoomTypeSerializer(read_only=True)
    images = RoomImageSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ('id', 'room_number', 'room_type', 'floor', 'status', 'images')


class RoomWriteSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)  # needed so createRoom response contains the new room's ID
    room_type = serializers.CharField()          # accept as string, skip DRF int coercion

    class Meta:
        model = Room
        fields = ('id', 'room_number', 'room_type', 'floor', 'status')

    def validate_room_type(self, value):
        from .models import RoomType
        # Keep as string — never convert to int (prevents JS float precision corruption)
        try:
            room_type = RoomType.objects.get(pk=str(value))
            return room_type
        except RoomType.DoesNotExist:
            raise serializers.ValidationError(f"Room type with ID {value} does not exist.")