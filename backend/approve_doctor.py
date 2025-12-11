"""
Script to approve a doctor by email.
Usage: python manage.py shell < approve_doctor.py
Or run: python manage.py shell
Then copy-paste the code below.
"""
from apps.doctors.models import Doctor
from apps.users.models import User

# Get doctor by email
email = input("Enter doctor email: ")
try:
    user = User.objects.get(email=email, user_type='doctor')
    doctor = Doctor.objects.get(user=user)
    doctor.is_approved = True
    doctor.save()
    print(f"✅ Doctor {user.full_name} has been approved!")
except User.DoesNotExist:
    print(f"❌ No doctor found with email: {email}")
except Doctor.DoesNotExist:
    print(f"❌ Doctor profile not found for user: {email}")

