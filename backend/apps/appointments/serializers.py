from rest_framework import serializers
from .models import Appointment
from apps.patients.serializers import PatientSerializer
from apps.doctors.serializers import DoctorListSerializer


class AppointmentSerializer(serializers.ModelSerializer):
    """Appointment serializer."""
    patient = PatientSerializer(read_only=True)
    doctor = DoctorListSerializer(read_only=True)
    doctor_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Appointment
        fields = ['id', 'patient', 'doctor', 'doctor_id', 'appointment_date',
                  'appointment_time', 'appointment_type', 'status', 'symptoms',
                  'notes', 'cancellation_reason', 'created_at', 'updated_at',
                  'cancelled_at']
        read_only_fields = ['id', 'patient', 'status', 'created_at', 'updated_at',
                           'cancelled_at']
    
    def validate(self, attrs):
        """Validate appointment data."""
        # Check if doctor exists
        from apps.doctors.models import Doctor
        try:
            doctor = Doctor.objects.get(id=attrs['doctor_id'], is_approved=True)
        except Doctor.DoesNotExist:
            raise serializers.ValidationError({'doctor_id': 'Doctor not found or not approved'})
        
        # Check if slot is available
        existing = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=attrs['appointment_date'],
            appointment_time=attrs['appointment_time'],
            status__in=['pending', 'confirmed']
        ).exists()
        
        if existing:
            raise serializers.ValidationError(
                {'appointment_time': 'This time slot is already booked'}
            )
        
        return attrs

