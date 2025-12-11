"""
Check and fix doctor to ensure they appear in patient portal.
Run: python manage.py shell
Then paste this code.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.doctors.models import Doctor, Specialty
from apps.users.models import User

email = 'kanchanpatel@gmail.com'
try:
    user = User.objects.get(email=email, user_type='doctor')
    doctor = Doctor.objects.get(user=user)
    
    print(f'Doctor: {user.full_name}')
    print(f'Email: {user.email}')
    print(f'Is Approved: {doctor.is_approved}')
    print(f'Specializations: {doctor.specialization.count()}')
    
    # Ensure approved
    if not doctor.is_approved:
        doctor.is_approved = True
        print('Approving doctor...')
    
    # Add specialty if none
    if doctor.specialization.count() == 0:
        specialty, created = Specialty.objects.get_or_create(
            name='General Medicine',
            defaults={'description': 'General medical practice'}
        )
        doctor.specialization.add(specialty)
        print(f'Added specialty: {specialty.name}')
    
    doctor.save()
    
    print('\n=== FINAL STATUS ===')
    print(f'Is Approved: {doctor.is_approved}')
    print(f'Specializations: {", ".join([s.name for s in doctor.specialization.all()])}')
    print(f'Experience: {doctor.experience_years} years')
    print(f'Consultation Fee: ${doctor.consultation_fee}')
    print('\nDoctor should now appear in patient portal!')
    
except Exception as e:
    print(f'ERROR: {str(e)}')
    import traceback
    traceback.print_exc()

