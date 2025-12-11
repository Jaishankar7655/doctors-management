from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Consultation
from .serializers import ConsultationSerializer
from apps.appointments.models import Appointment
from apps.doctors.models import Doctor


class ConsultationViewSet(viewsets.ModelViewSet):
    """Consultation viewset."""
    queryset = Consultation.objects.all()
    serializer_class = ConsultationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter consultations based on user type."""
        user = self.request.user
        if user.user_type == 'patient':
            from apps.patients.models import Patient
            try:
                patient = Patient.objects.get(user=user)
                appointments = Appointment.objects.filter(patient=patient)
                return Consultation.objects.filter(appointment__in=appointments)
            except Patient.DoesNotExist:
                return Consultation.objects.none()
        elif user.user_type == 'doctor':
            try:
                doctor = Doctor.objects.get(user=user)
                appointments = Appointment.objects.filter(doctor=doctor)
                return Consultation.objects.filter(appointment__in=appointments)
            except Doctor.DoesNotExist:
                return Consultation.objects.none()
        elif user.user_type == 'admin':
            return Consultation.objects.all()
        return Consultation.objects.none()
    
    def perform_create(self, serializer):
        """Create consultation (only doctors can create)."""
        if self.request.user.user_type != 'doctor':
            raise serializers.ValidationError({'error': 'Only doctors can create consultations'})
        
        appointment_id = self.request.data.get('appointment')
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            doctor = Doctor.objects.get(user=self.request.user)
            
            if appointment.doctor != doctor:
                raise serializers.ValidationError({'error': 'Permission denied'})
            
            serializer.save(appointment=appointment)
        except Appointment.DoesNotExist:
            raise serializers.ValidationError({'error': 'Appointment not found'})

