from django.core.management.base import BaseCommand
from apps.doctors.models import Doctor, Specialty
from apps.users.models import User


class Command(BaseCommand):
    help = 'Setup doctor: approve and add specialty if missing'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Doctor email address')

    def handle(self, *args, **options):
        email = options['email']
        try:
            user = User.objects.get(email=email, user_type='doctor')
            doctor = Doctor.objects.get(user=user)
            
            # Approve if not approved
            if not doctor.is_approved:
                doctor.is_approved = True
                self.stdout.write(f'Approved doctor: {user.full_name}')
            
            # Add specialty if none
            if doctor.specialization.count() == 0:
                specialty, created = Specialty.objects.get_or_create(
                    name='General Medicine',
                    defaults={'description': 'General medical practice'}
                )
                doctor.specialization.add(specialty)
                self.stdout.write(f'Added specialty: {specialty.name}')
            
            doctor.save()
            
            self.stdout.write(self.style.SUCCESS(f'\nSUCCESS: Doctor {user.full_name} is ready!'))
            self.stdout.write(f'Is Approved: {doctor.is_approved}')
            self.stdout.write(f'Specializations: {", ".join([s.name for s in doctor.specialization.all()])}')
            self.stdout.write(f'\nDoctor should now appear in patient portal at http://localhost:3000/doctors')
            
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'ERROR: No doctor found with email: {email}'))
        except Doctor.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'ERROR: Doctor profile not found for user: {email}'))

