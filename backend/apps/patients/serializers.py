from rest_framework import serializers
from .models import Patient
from apps.users.serializers import UserSerializer


class PatientSerializer(serializers.ModelSerializer):
    """Patient serializer."""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Patient
        fields = ['id', 'user', 'date_of_birth', 'gender', 'blood_group',
                  'address', 'city', 'state', 'pincode', 'emergency_contact',
                  'medical_history', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

