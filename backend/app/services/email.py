import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_reset_password_email(to_email: str, reset_token: str) -> None:
    reset_url = f"{settings.frontend_url}/reset-password?token={reset_token}"

    if not settings.smtp_host:
        # Dev mode: log the reset link instead of sending email
        logger.warning("SMTP not configured — reset link: %s", reset_url)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Reset your Arcwise password"
    msg["From"] = settings.smtp_from_email
    msg["To"] = to_email

    text = f"Reset your password: {reset_url}\n\nThis link expires in 1 hour."
    html = f"""
    <p>You requested a password reset for your Arcwise account.</p>
    <p><a href="{reset_url}">Reset your password</a></p>
    <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    """
    msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(html, "html"))

    await aiosmtplib.send(
        msg,
        hostname=settings.smtp_host,
        port=settings.smtp_port,
        username=settings.smtp_user,
        password=settings.smtp_password,
        start_tls=True,
    )
