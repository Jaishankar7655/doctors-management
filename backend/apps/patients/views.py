from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Patient
from .serializers import PatientSerializer
from apps.appointments.models import Appointment
from apps.appointments.serializers import AppointmentSerializer
from apps.consultations.models import Consultation
from apps.consultations.serializers import ConsultationSerializer


class PatientViewSet(viewsets.ModelViewSet):
    """Patient viewset."""
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter to current user's patient profile."""
        if self.request.user.user_type == 'patient':
            return Patient.objects.filter(user=self.request.user)
        return Patient.objects.all()
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Get current patient profile."""
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            # Auto-create patient profile if it doesn't exist
            patient = Patient.objects.create(user=request.user)
        
        serializer = self.get_serializer(patient)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update current patient profile."""
        try:
            patient = Patient.objects.get(user=request.user)
            serializer = self.get_serializer(patient, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def appointments(self, request):
        """Get patient's appointments."""
        try:
            patient = Patient.objects.get(user=request.user)
            appointments = Appointment.objects.filter(patient=patient)
            serializer = AppointmentSerializer(appointments, many=True)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def consultations(self, request):
        """Get patient's consultations."""
        try:
            patient = Patient.objects.get(user=request.user)
            appointments = Appointment.objects.filter(patient=patient)
            consultations = Consultation.objects.filter(appointment__in=appointments)
            serializer = ConsultationSerializer(consultations, many=True)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

