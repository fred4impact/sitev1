from django.urls import path

from .views import ticket_check_in, ticket_qr

urlpatterns = [
    path("<uuid:qr_token>/qr/", ticket_qr, name="ticket-qr"),
    path("<uuid:qr_token>/check-in/", ticket_check_in, name="ticket-check-in"),
]
