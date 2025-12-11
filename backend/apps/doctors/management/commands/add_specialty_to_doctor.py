from django.core.management.base import BaseCommand
from apps.doctors.models import Doctor, Specialty
from apps.users.models import User


class Command(BaseCommand):
    help = 'Add specialty to a doctor by email'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Doctor email address')
        parser.add_argument('--specialty', type=str, default='General Medicine', help='Specialty name to add')

    def handle(self, *args, **options):
        email = options['email']
        specialty_name = options['specialty']
        
        try:
            user = User.objects.get(email=email, user_type='doctor')
            doctor = Doctor.objects.get(user=user)
            
            # Get or create specialty
            specialty, created = Specialty.objects.get_or_create(
                name=specialty_name,
                defaults={'description': f'{specialty_name} specialty'}
            )
            
            if created:
                self.stdout.write(f'Created specialty: {specialty_name}')
            
            # Add specialty to doctor if not already added
            if specialty not in doctor.specialization.all():
                doctor.specialization.add(specialty)
                self.stdout.write(self.style.SUCCESS(f'Added specialty "{specialty_name}" to doctor {user.full_name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Doctor already has specialty "{specialty_name}"'))
            
            # Ensure doctor is approved
            if not doctor.is_approved:
                doctor.is_approved = True
                doctor.save()
                self.stdout.write(self.style.SUCCESS(f'Approved doctor: {user.full_name}'))
            
            self.stdout.write(f'\nDoctor Status:')
            self.stdout.write(f'  Name: {user.full_name}')
            self.stdout.write(f'  Email: {user.email}')
            self.stdout.write(f'  Is Approved: {doctor.is_approved}')
            self.stdout.write(f'  Specializations: {", ".join([s.name for s in doctor.specialization.all()])}')
            self.stdout.write(self.style.SUCCESS(f'\nDoctor should now appear in patient portal!'))
            
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'ERROR: No doctor found with email: {email}'))
        except Doctor.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'ERROR: Doctor profile not found for user: {email}'))

