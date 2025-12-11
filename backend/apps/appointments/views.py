from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Appointment
from .serializers import AppointmentSerializer
from apps.patients.models import Patient
from apps.doctors.models import Doctor


class AppointmentViewSet(viewsets.ModelViewSet):
    """Appointment viewset."""
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter appointments based on user type."""
        user = self.request.user
        if user.user_type == 'patient':
            try:
                patient = Patient.objects.get(user=user)
                return Appointment.objects.filter(patient=patient)
            except Patient.DoesNotExist:
                # Auto-create patient profile if it doesn't exist
                Patient.objects.create(user=user)
                return Appointment.objects.none()
        elif user.user_type == 'doctor':
            try:
                doctor = Doctor.objects.get(user=user)
                return Appointment.objects.filter(doctor=doctor)
            except Doctor.DoesNotExist:
                return Appointment.objects.none()
        elif user.user_type == 'admin':
            return Appointment.objects.all()
        return Appointment.objects.none()
    
    def perform_create(self, serializer):
        """Create appointment and set patient."""
        try:
            patient = Patient.objects.get(user=self.request.user)
        except Patient.DoesNotExist:
            # Auto-create patient profile if it doesn't exist
            patient = Patient.objects.create(user=self.request.user)
        
        serializer.save(patient=patient, status='pending')
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an appointment."""
        appointment = self.get_object()
        
        # Check permissions
        if request.user.user_type == 'patient':
            if appointment.patient.user != request.user:
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif request.user.user_type == 'doctor':
            if appointment.doctor.user != request.user:
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        reason = request.data.get('reason', '')
        appointment.cancel(reason)
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a pending appointment (admin only)."""
        if request.user.user_type != 'admin':
            return Response(
                {'error': 'Only admins can approve appointments'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        appointment = self.get_object()
        
        if appointment.status != 'pending':
            return Response(
                {'error': f'Cannot approve appointment with status: {appointment.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'confirmed'
        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a pending appointment (admin only)."""
        if request.user.user_type != 'admin':
            return Response(
                {'error': 'Only admins can reject appointments'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        appointment = self.get_object()
        
        if appointment.status != 'pending':
            return Response(
                {'error': f'Cannot reject appointment with status: {appointment.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reason = request.data.get('reason', 'Rejected by admin')
        appointment.status = 'cancelled'
        appointment.cancellation_reason = reason
        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['put', 'patch'])
    def update_status(self, request, pk=None):
        """Update appointment status (for doctors)."""
        if request.user.user_type != 'doctor':
            return Response(
                {'error': 'Only doctors can update appointment status'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        appointment = self.get_object()
        if appointment.doctor.user != request.user:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        new_status = request.data.get('status')
        if new_status not in dict(Appointment.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = new_status
        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming appointments."""
        queryset = self.get_queryset().filter(
            appointment_date__gte=timezone.now().date(),
            status__in=['pending', 'confirmed']
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def past(self, request):
        """Get past appointments."""
        queryset = self.get_queryset().filter(
            appointment_date__lt=timezone.now().date()
        ) | self.get_queryset().filter(status__in=['completed', 'cancelled'])
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

