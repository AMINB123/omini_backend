import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import settings


def send_reset_password_email(to_email: str, reset_token: str):
    reset_link = f"{settings.frontend_url}/reset-password?token={reset_token}"

    subject = "بازیابی رمز عبور Omini"
    body = f"""
    <div dir="rtl" style="font-family: Tahoma, sans-serif;">
        <h2>بازیابی رمز عبور</h2>
        <p>برای تنظیم رمز عبور جدید، روی لینک زیر کلیک کنید:</p>
        <p><a href="{reset_link}">تنظیم رمز عبور جدید</a></p>
        <p>اگر این درخواست را شما نفرستادید، این ایمیل را نادیده بگیرید.</p>
        <p>این لینک تا ۳۰ دقیقه دیگر معتبر است.</p>
    </div>
    """

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"Omini <{settings.smtp_username}>"
    message["To"] = to_email
    message.attach(MIMEText(body, "html"))

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        server.login(settings.smtp_username, settings.smtp_password)
        server.sendmail(settings.smtp_username, to_email, message.as_string())