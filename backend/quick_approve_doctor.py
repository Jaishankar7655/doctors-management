"""
Quick script to approve doctor and add specialty.
Run this in Django shell: python manage.py shell < quick_approve_doctor.py
Or run: python manage.py shell, then paste the code.
"""
from apps.doctors.models import Doctor, Specialty
from apps.users.models import User

email = 'kanchanpatel@gmail.com'
try:
    user = User.objects.get(email=email, user_type='doctor')
    doctor = Doctor.objects.get(user=user)
    
    # Approve doctor
    doctor.is_approved = True
    
    # Add specialty if none
    if doctor.specialization.count() == 0:
        specialty, _ = Specialty.objects.get_or_create(name='General Medicine')
        doctor.specialization.add(specialty)
        print(f'Added specialty: General Medicine')
    
    doctor.save()
    print(f'SUCCESS: Doctor {user.full_name} approved!')
    print(f'Is Approved: {doctor.is_approved}')
    print(f'Specializations: {", ".join([s.name for s in doctor.specialization.all()])}')
except Exception as e:
    print(f'ERROR: {str(e)}')

