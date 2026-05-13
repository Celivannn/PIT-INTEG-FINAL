from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
import getpass

User = get_user_model()


class Command(BaseCommand):
    help = 'Create an admin account. This is the ONLY way to create admin users.'

    def add_arguments(self, parser):
        parser.add_argument('--email',     type=str, help='Admin email address')
        parser.add_argument('--full-name', type=str, help='Admin full name')
        parser.add_argument('--phone',     type=str, help='Admin phone number', default='')

    def handle(self, *args, **options):
        email     = options.get('email')     or input('Email: ').strip()
        full_name = options.get('full_name') or input('Full name: ').strip()
        phone     = options.get('phone')     or input('Phone (optional): ').strip()

        if User.objects.filter(email=email).exists():
            raise CommandError(f'A user with email "{email}" already exists.')

        password  = getpass.getpass('Password: ')
        password2 = getpass.getpass('Confirm password: ')

        if password != password2:
            raise CommandError('Passwords do not match.')

        user = User.objects.create_admin(
            email=email,
            password=password,
            full_name=full_name,
            phone=phone,
        )

        self.stdout.write(
            self.style.SUCCESS(f'Admin account created: {user.email}')
        )
