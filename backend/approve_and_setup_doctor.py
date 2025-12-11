"""
Script to approve a doctor and set up basic data.
Run: python manage.py shell
Then copy-paste this code.
"""
from apps.doctors.models import Doctor, Specialty
from apps.users.models import User

# Get doctor by email
email = 'kanchanpatel@gmail.com'
try:
    user = User.objects.get(email=email, user_type='doctor')
    doctor = Doctor.objects.get(user=user)
    
    # Approve the doctor
    doctor.is_approved = True
    
    # Add a default specialty if none exists
    if doctor.specialization.count() == 0:
        # Get or create a default specialty
        default_specialty, created = Specialty.objects.get_or_create(
            name='General Medicine',
            defaults={'description': 'General medical practice'}
        )
        doctor.specialization.add(default_specialty)
        print(f'Added specialty: {default_specialty.name}')
    
    doctor.save()
    print(f'SUCCESS: Doctor {user.full_name} has been approved!')
    print(f'Specializations: {", ".join([s.name for s in doctor.specialization.all()])}')
    print(f'Is Approved: {doctor.is_approved}')
    
except User.DoesNotExist:
    print(f'ERROR: No doctor found with email: {email}')
except Doctor.DoesNotExist:
    print(f'ERROR: Doctor profile not found for user: {email}')

