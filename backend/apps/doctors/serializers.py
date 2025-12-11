from rest_framework import serializers
from .models import Doctor, Specialty, Schedule, Review
from apps.users.serializers import UserSerializer
from apps.patients.serializers import PatientSerializer


class SpecialtySerializer(serializers.ModelSerializer):
    """Specialty serializer."""
    
    class Meta:
        model = Specialty
        fields = ['id', 'name', 'description', 'icon']


class ScheduleSerializer(serializers.ModelSerializer):
    """Schedule serializer."""
    
    class Meta:
        model = Schedule
        fields = ['id', 'day_of_week', 'start_time', 'end_time', 
                  'is_available', 'slot_duration']


class ReviewSerializer(serializers.ModelSerializer):
    """Review serializer."""
    patient = PatientSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'patient', 'doctor', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']


class DoctorRegistrationSerializer(serializers.Serializer):
    """Doctor registration serializer with user and doctor details."""
    # User fields
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    
    # Doctor fields
    experience_years = serializers.IntegerField(min_value=0)
    qualification = serializers.CharField(max_length=200, required=False, allow_blank=True)
    registration_number = serializers.CharField(max_length=100, required=False, allow_blank=True)
    consultation_fee = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    specialization_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True
    )
    clinic_address = serializers.CharField(required=False, allow_blank=True)
    clinic_city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    clinic_state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    clinic_pincode = serializers.CharField(max_length=10, required=False, allow_blank=True)
    online_consultation_available = serializers.BooleanField(default=False)
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        from django.contrib.auth import get_user_model
        from django.contrib.auth.password_validation import validate_password
        
        User = get_user_model()
        
        # Validate password
        validate_password(validated_data['password'])
        
        # Create user
        user_data = {
            'email': validated_data['email'],
            'first_name': validated_data['first_name'],
            'last_name': validated_data['last_name'],
            'phone': validated_data.get('phone', ''),
            'user_type': 'doctor',
        }
        user = User.objects.create_user(
            password=validated_data['password'],
            **user_data
        )
        
        # Create doctor profile
        doctor_data = {
            'user': user,
            'experience_years': validated_data['experience_years'],
            'qualification': validated_data.get('qualification', ''),
            'registration_number': validated_data.get('registration_number', ''),
            'consultation_fee': validated_data['consultation_fee'],
            'clinic_address': validated_data.get('clinic_address', ''),
            'clinic_city': validated_data.get('clinic_city', ''),
            'clinic_state': validated_data.get('clinic_state', ''),
            'clinic_pincode': validated_data.get('clinic_pincode', ''),
            'online_consultation_available': validated_data.get('online_consultation_available', False),
            'is_approved': False,  # Requires admin approval
        }
        doctor = Doctor.objects.create(**doctor_data)
        
        # Add specializations if provided
        if validated_data.get('specialization_ids'):
            specializations = Specialty.objects.filter(id__in=validated_data['specialization_ids'])
            doctor.specialization.set(specializations)
        
        return doctor


class DoctorSerializer(serializers.ModelSerializer):
    """Doctor serializer."""
    user = UserSerializer(read_only=True)
    specialization = SpecialtySerializer(many=True, read_only=True)
    specialization_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Specialty.objects.all(),
        source='specialization',
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Doctor
        fields = ['id', 'user', 'specialization', 'specialization_ids',
                  'profile_photo', 'experience_years', 'qualification', 'registration_number',
                  'consultation_fee', 'clinic_address', 'clinic_city',
                  'clinic_state', 'clinic_pincode', 'online_consultation_available',
                  'is_approved', 'is_active', 'rating', 'total_reviews', 'created_at', 'updated_at']
        read_only_fields = ['id', 'is_approved', 'rating', 'total_reviews', 
                           'created_at', 'updated_at']


class DoctorListSerializer(serializers.ModelSerializer):
    """Simplified doctor serializer for list views."""
    user = UserSerializer(read_only=True)
    specialization = SpecialtySerializer(many=True, read_only=True)
    
    class Meta:
        model = Doctor
        fields = ['id', 'user', 'specialization', 'profile_photo', 'experience_years',
                  'consultation_fee', 'online_consultation_available', 'is_active',
                  'rating', 'total_reviews', 'clinic_city', 'clinic_state']
