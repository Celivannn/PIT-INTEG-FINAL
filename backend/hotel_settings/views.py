from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import HotelSettings
from .serializers import HotelSettingsSerializer
from users.permissions import IsAdmin


class HotelSettingsView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdmin()]

    def get(self, request):
        settings = HotelSettings.get()
        return Response(HotelSettingsSerializer(settings).data)

    def put(self, request):
        settings   = HotelSettings.get()
        serializer = HotelSettingsSerializer(settings, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def patch(self, request):
        settings   = HotelSettings.get()
        serializer = HotelSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
