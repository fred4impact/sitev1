from django.urls import path

from .views import CreateContactMessageView

urlpatterns = [
    path("", CreateContactMessageView.as_view(), name="contact-create"),
]
