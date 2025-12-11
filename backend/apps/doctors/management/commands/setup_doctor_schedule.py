from django.core.management.base import BaseCommand
from apps.doctors.models import Doctor, Schedule
from apps.users.models import User
from datetime import time


class Command(BaseCommand):
    help = 'Setup default schedule for a doctor (Monday-Friday, 9 AM - 5 PM)'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Doctor email address')
        parser.add_argument('--start-time', type=str, default='09:00', help='Start time (HH:MM)')
        parser.add_argument('--end-time', type=str, default='17:00', help='End time (HH:MM)')
        parser.add_argument('--slot-duration', type=int, default=30, help='Slot duration in minutes')
        parser.add_argument('--days', type=str, default='0,1,2,3,4', help='Days of week (0=Monday, 6=Sunday), comma-separated')

    def handle(self, *args, **options):
        email = options['email']
        start_time_str = options['start_time']
        end_time_str = options['end_time']
        slot_duration = options['slot_duration']
        days_str = options['days']
        
        try:
            user = User.objects.get(email=email, user_type='doctor')
            doctor = Doctor.objects.get(user=user)
            
            # Parse times
            start_hour, start_min = map(int, start_time_str.split(':'))
            end_hour, end_min = map(int, end_time_str.split(':'))
            start_time = time(start_hour, start_min)
            end_time = time(end_hour, end_min)
            
            # Parse days
            days = [int(d.strip()) for d in days_str.split(',')]
            
            day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            created_count = 0
            updated_count = 0
            
            for day_of_week in days:
                if 0 <= day_of_week <= 6:
                    schedule, created = Schedule.objects.update_or_create(
                        doctor=doctor,
                        day_of_week=day_of_week,
                        defaults={
                            'start_time': start_time,
                            'end_time': end_time,
                            'slot_duration': slot_duration,
                            'is_available': True,
                        }
                    )
                    if created:
                        created_count += 1
                        self.stdout.write(f'Created schedule for {day_names[day_of_week]}')
                    else:
                        updated_count += 1
                        self.stdout.write(f'Updated schedule for {day_names[day_of_week]}')
            
            self.stdout.write(self.style.SUCCESS(
                f'\nSUCCESS: Setup schedule for {user.full_name}'
            ))
            self.stdout.write(f'Created: {created_count} schedules')
            self.stdout.write(f'Updated: {updated_count} schedules')
            self.stdout.write(f'Time: {start_time_str} - {end_time_str}')
            self.stdout.write(f'Slot Duration: {slot_duration} minutes')
            self.stdout.write(f'\nDoctor can now receive appointments!')
            
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'ERROR: No doctor found with email: {email}'))
        except Doctor.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'ERROR: Doctor profile not found for user: {email}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'ERROR: {str(e)}'))

