from django.urls import path

from .views import ConfirmOrderView, CreateOrderView, OrderDetailView

urlpatterns = [
    path("", CreateOrderView.as_view(), name="order-create"),
    path("<uuid:public_id>/", OrderDetailView.as_view(), name="order-detail"),
    path("<uuid:public_id>/confirm/", ConfirmOrderView.as_view(), name="order-confirm"),
]
