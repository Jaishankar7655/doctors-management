from django.core.management.base import BaseCommand
from apps.doctors.models import Doctor
from apps.users.models import User


class Command(BaseCommand):
    help = 'Approve a doctor by email'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Doctor email address')

    def handle(self, *args, **options):
        email = options['email']
        try:
            user = User.objects.get(email=email, user_type='doctor')
            doctor = Doctor.objects.get(user=user)
            if doctor.is_approved:
                self.stdout.write(self.style.WARNING(f'Doctor {user.full_name} is already approved.'))
            else:
                doctor.is_approved = True
                doctor.save()
                self.stdout.write(self.style.SUCCESS(f'SUCCESS: Doctor {user.full_name} has been approved!'))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'ERROR: No doctor found with email: {email}'))
        except Doctor.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'ERROR: Doctor profile not found for user: {email}'))

