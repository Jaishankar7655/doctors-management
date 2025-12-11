from rest_framework import serializers
from .models import Consultation
from apps.appointments.serializers import AppointmentSerializer


class ConsultationSerializer(serializers.ModelSerializer):
    """Consultation serializer."""
    appointment = AppointmentSerializer(read_only=True)
    
    class Meta:
        model = Consultation
        fields = ['id', 'appointment', 'diagnosis', 'prescription',
                  'follow_up_date', 'notes', 'documents', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

