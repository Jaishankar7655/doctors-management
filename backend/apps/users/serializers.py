from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """User serializer."""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 
                  'profile_picture', 'user_type', 'is_active', 'is_verified', 
                  'created_at', 'full_name']
        read_only_fields = ['id', 'user_type', 'is_active', 'is_verified', 'created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """User registration serializer."""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'first_name', 
                  'last_name', 'phone', 'user_type']
        extra_kwargs = {
            'user_type': {'required': False}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        # Remove user_type if present, it will be set by the view
        validated_data.pop('user_type', None)
        user = User.objects.create_user(**validated_data)
        return user

