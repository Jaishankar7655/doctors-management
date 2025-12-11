#!/usr/bin/env python
"""
Quick fix script to add specialty to doctor.
Run this from the Doctors folder: python fix_doctor.py
"""
import os
import sys
import django

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.doctors.models import Doctor, Specialty
from apps.users.models import User

email = 'kanchanpatel@gmail.com'

try:
    user = User.objects.get(email=email, user_type='doctor')
    doctor = Doctor.objects.get(user=user)
    
    print(f'\n=== FIXING DOCTOR ===')
    print(f'Doctor: {user.full_name}')
    print(f'Email: {user.email}')
    print(f'Current Status:')
    print(f'  Is Approved: {doctor.is_approved}')
    print(f'  Specializations: {doctor.specialization.count()}')
    
    # Ensure approved
    if not doctor.is_approved:
        doctor.is_approved = True
        print(f'\n✅ APPROVED doctor')
    
    # Add specialty if missing
    if doctor.specialization.count() == 0:
        specialty, created = Specialty.objects.get_or_create(
            name='General Medicine',
            defaults={'description': 'General medical practice'}
        )
        doctor.specialization.add(specialty)
        print(f'✅ ADDED specialty: General Medicine')
    else:
        print(f'\nSpecializations already exist: {[s.name for s in doctor.specialization.all()]}')
    
    doctor.save()
    
    print(f'\n=== FINAL STATUS ===')
    print(f'Is Approved: {doctor.is_approved}')
    print(f'Specializations: {", ".join([s.name for s in doctor.specialization.all()])}')
    print(f'\n✅ SUCCESS! Doctor should now appear in patient portal!')
    print(f'   Go to: http://localhost:3000/doctors')
    
except User.DoesNotExist:
    print(f'\n❌ ERROR: No doctor found with email: {email}')
except Doctor.DoesNotExist:
    print(f'\n❌ ERROR: Doctor profile not found for email: {email}')
except Exception as e:
    print(f'\n❌ ERROR: {str(e)}')
    import traceback
    traceback.print_exc()

