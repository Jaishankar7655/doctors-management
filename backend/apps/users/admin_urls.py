from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.doctors.models import Doctor
from apps.patients.models import Patient
from apps.appointments.models import Appointment
from apps.doctors.serializers import DoctorSerializer
from apps.patients.serializers import PatientSerializer
from apps.appointments.serializers import AppointmentSerializer

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard(request):
    """Admin dashboard statistics."""
    stats = {
        'total_patients': Patient.objects.count(),
        'total_doctors': Doctor.objects.count(),
        'total_appointments': Appointment.objects.count(),
        'today_appointments': Appointment.objects.filter(
            appointment_date=timezone.now().date()
        ).count(),
        'pending_doctors': Doctor.objects.filter(is_approved=False).count(),
    }
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def pending_doctors(request):
    """Get pending doctor registrations."""
    doctors = Doctor.objects.filter(is_approved=False)
    serializer = DoctorSerializer(doctors, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def approve_doctor(request, doctor_id):
    """Approve a doctor registration."""
    try:
        doctor = Doctor.objects.get(id=doctor_id)
        doctor.is_approved = True
        doctor.save()
        serializer = DoctorSerializer(doctor)
        return Response(serializer.data)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor not found'}, status=404)


urlpatterns = [
    path('dashboard/', admin_dashboard, name='admin-dashboard'),
    path('doctors/pending/', pending_doctors, name='pending-doctors'),
    path('doctors/<int:doctor_id>/approve/', approve_doctor, name='approve-doctor'),
]

