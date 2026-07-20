from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .emails import send_contact_notification
from .serializers import ContactMessageSerializer


class CreateContactMessageView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        send_contact_notification(message)
        return Response(
            {"detail": "Thanks — we'll get back to you soon."},
            status=status.HTTP_201_CREATED,
        )
