import logging

import resend
from django.conf import settings

logger = logging.getLogger(__name__)


def send_contact_notification(message):
    """Email the venue about a new contact form submission. No-op (logged) if Resend isn't configured."""
    if not settings.RESEND_API_KEY:
        logger.info(
            "RESEND_API_KEY not set — skipping contact notification from %s",
            message.email,
        )
        return

    html = f"""
    <h1>New contact message from {message.name}</h1>
    <p><strong>Email:</strong> {message.email}</p>
    <p>{message.message}</p>
    """

    resend.api_key = settings.RESEND_API_KEY
    try:
        resend.Emails.send(
            {
                "from": settings.DEFAULT_FROM_EMAIL,
                "to": settings.CONTACT_EMAIL,
                "reply_to": message.email,
                "subject": f"Jazz91 contact form: {message.name}",
                "html": html,
            }
        )
    except Exception:
        logger.exception("Failed to send contact notification for message %s", message.pk)
