from django.core.mail import send_mail
from django.conf import settings

def send_otp_email(user, otp_code):
    """Send OTP verification email"""
    subject = 'Verify Your Email - Grand Azure Hotel'
    message = f'''
Hello {user.full_name},

Thank you for choosing Grand Azure Hotel!

Your verification code is: {otp_code}

This code will expire in 10 minutes.

If you didn't request this, please ignore this email.

Best regards,
Grand Azure Hotel Team
'''
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )