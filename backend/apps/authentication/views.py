from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from apps.users.serializers import UserSerializer, UserRegistrationSerializer
from apps.patients.models import Patient
from apps.doctors.models import Doctor
from apps.doctors.serializers import DoctorRegistrationSerializer, DoctorSerializer

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def register_patient(request):
    """Register a new patient."""
    try:
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(user_type='patient')
            # Create Patient profile automatically
            Patient.objects.get_or_create(user=user)
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({
            'error': str(e),
            'detail': 'An error occurred during registration. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """User login."""
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
        if not user.check_password(password):
            return Response(
                {'error': 'Wrong password entered'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_active:
            return Response(
                {'error': 'Account is inactive'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'token': str(refresh.access_token),  # Add token for compatibility
        })
    except User.DoesNotExist:
        return Response(
            {'error': 'Wrong email entered'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """User logout."""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Successfully logged out'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """Request password reset."""
    email = request.data.get('email')
    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
        # TODO: Send password reset email
        return Response({'message': 'Password reset email sent'})
    except User.DoesNotExist:
        return Response({'message': 'If email exists, password reset email sent'})


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """Confirm password reset."""
    # TODO: Implement password reset with token validation
    return Response({'message': 'Password reset confirmed'})


@api_view(['POST'])
@permission_classes([AllowAny])
def register_doctor(request):
    """Register a new doctor."""
    try:
        serializer = DoctorRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            doctor = serializer.save()
            # Get the user from the doctor object
            user = doctor.user
            # Create JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'doctor': DoctorSerializer(doctor).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Doctor registration successful. Your account is pending admin approval.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({
            'error': str(e),
            'detail': 'An error occurred during registration. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

