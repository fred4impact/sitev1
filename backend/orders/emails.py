import logging

import resend
from django.conf import settings

logger = logging.getLogger(__name__)


def send_order_confirmation(order):
    """Email the guest their tickets. No-op (logged) if Resend isn't configured."""
    if not settings.RESEND_API_KEY:
        logger.info(
            "RESEND_API_KEY not set — skipping confirmation email to %s for order %s",
            order.email,
            order.public_id,
        )
        return

    confirmation_url = f"{settings.FRONTEND_URL}/orders/{order.public_id}/confirmation"
    ticket_items = "".join(
        f"<li>Ticket {str(ticket.qr_token)[:8]}</li>" for ticket in order.tickets.all()
    )
    ticket_count = order.tickets.count()

    html = f"""
    <h1>You're going to {order.event.title}!</h1>
    <p>{ticket_count} ticket(s) confirmed at {order.event.venue.name}.</p>
    <ul>{ticket_items}</ul>
    <p><a href="{confirmation_url}">View your tickets and QR codes</a></p>
    """

    resend.api_key = settings.RESEND_API_KEY
    try:
        resend.Emails.send(
            {
                "from": settings.DEFAULT_FROM_EMAIL,
                "to": order.email,
                "subject": f"Your tickets for {order.event.title}",
                "html": html,
            }
        )
    except Exception:
        logger.exception("Failed to send confirmation email for order %s", order.public_id)
