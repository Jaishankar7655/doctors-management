"""
Quick fix script to ensure doctor appears in patient portal.
Run: python manage.py shell
Then paste this code.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.doctors.models import Doctor, Specialty
from apps.users.models import User

# Find all doctors
doctors = Doctor.objects.all()
print(f'\n=== ALL DOCTORS ===')
for doctor in doctors:
    print(f'\nDoctor: {doctor.user.full_name}')
    print(f'  Email: {doctor.user.email}')
    print(f'  Is Approved: {doctor.is_approved}')
    print(f'  Specializations: {doctor.specialization.count()}')
    if doctor.specialization.count() > 0:
        print(f'  Specialty Names: {[s.name for s in doctor.specialization.all()]}')
    
    # Fix if needed
    if not doctor.is_approved:
        doctor.is_approved = True
        print(f'  -> APPROVED')
    
    if doctor.specialization.count() == 0:
        specialty, created = Specialty.objects.get_or_create(
            name='General Medicine',
            defaults={'description': 'General medical practice'}
        )
        doctor.specialization.add(specialty)
        print(f'  -> ADDED SPECIALTY: General Medicine')
    
    doctor.save()

print(f'\n=== APPROVED DOCTORS WITH SPECIALIZATIONS ===')
approved_doctors = Doctor.objects.filter(is_approved=True).filter(specialization__isnull=False).distinct()
print(f'Count: {approved_doctors.count()}')
for doctor in approved_doctors:
    print(f'- {doctor.user.full_name} ({doctor.user.email})')

