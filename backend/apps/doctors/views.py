from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Doctor, Specialty, Schedule
from .serializers import DoctorSerializer, DoctorListSerializer, SpecialtySerializer, ScheduleSerializer
from apps.appointments.models import Appointment


class SpecialtyViewSet(viewsets.ReadOnlyModelViewSet):
    """Specialty viewset."""
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer
    permission_classes = [AllowAny]


class DoctorViewSet(viewsets.ModelViewSet):
    """Doctor viewset."""
    queryset = Doctor.objects.filter(is_approved=True)
    serializer_class = DoctorSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__first_name', 'user__last_name', 'specialization__name', 
                     'clinic_city', 'clinic_state']
    filterset_fields = ['specialization', 'online_consultation_available', 
                       'clinic_city', 'clinic_state']
    ordering_fields = ['rating', 'experience_years', 'consultation_fee', 'created_at']
    ordering = ['-rating']
    
    def get_queryset(self):
        """Get approved doctors with specializations."""
        queryset = Doctor.objects.filter(is_approved=True)
        # Only show doctors that have at least one specialization
        queryset = queryset.filter(specialization__isnull=False).distinct()
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DoctorListSerializer
        return DoctorSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'available_slots']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def available_slots(self, request, pk=None):
        """Get available time slots for a doctor on a specific date."""
        doctor = self.get_object()
        date_str = request.query_params.get('date')
        
        if not date_str:
            return Response(
                {'error': 'Date parameter is required (YYYY-MM-DD)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get schedule for the day of week
        day_of_week = date.weekday()
        schedule = Schedule.objects.filter(doctor=doctor, day_of_week=day_of_week, is_available=True).first()
        
        # If no schedule exists, provide default slots (9 AM to 5 PM, 30 min intervals)
        if not schedule:
            from datetime import time
            default_start = time(9, 0)  # 9:00 AM
            default_end = time(17, 0)   # 5:00 PM
            default_duration = 30  # 30 minutes
            
            # Generate default slots
            available_slots = []
            current_hour = default_start.hour
            current_minute = default_start.minute
            
            while current_hour < default_end.hour or (current_hour == default_end.hour and current_minute < default_end.minute):
                slot_time = time(current_hour, current_minute)
                slot_str = slot_time.strftime('%H:%M')
                
                # Check if this slot is already booked
                is_booked = Appointment.objects.filter(
                    doctor=doctor,
                    appointment_date=date,
                    appointment_time=slot_str,
                    status__in=['pending', 'confirmed']
                ).exists()
                
                if not is_booked:
                    available_slots.append(slot_str)
                
                # Move to next slot
                current_minute += default_duration
                if current_minute >= 60:
                    current_minute = 0
                    current_hour += 1
            
            return Response({'available_slots': available_slots})
        
        # Get booked appointments for the date
        booked_appointments = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=date,
            status__in=['pending', 'confirmed']
        ).values_list('appointment_time', flat=True)
        
        # Generate available slots
        available_slots = []
        current_time = datetime.combine(date, schedule.start_time)
        end_time = datetime.combine(date, schedule.end_time)
        slot_duration = timedelta(minutes=schedule.slot_duration)
        
        while current_time + slot_duration <= end_time:
            slot_time = current_time.time()
            if slot_time not in booked_appointments:
                available_slots.append(slot_time.strftime('%H:%M'))
            current_time += slot_duration
        
        return Response({'available_slots': available_slots})
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def profile(self, request):
        """Get current doctor profile."""
        try:
            doctor = Doctor.objects.get(user=request.user)
            serializer = self.get_serializer(doctor)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response(
                {'error': 'Doctor profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['put', 'patch'], permission_classes=[IsAuthenticated])
    def update_profile(self, request):
        """Update current doctor profile."""
        try:
            doctor = Doctor.objects.get(user=request.user)
            serializer = self.get_serializer(doctor, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response(
                {'error': 'Doctor profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get', 'post'], permission_classes=[IsAuthenticated])
    def schedule(self, request):
        """Get or update doctor schedule."""
        try:
            doctor = Doctor.objects.get(user=request.user)
            
            if request.method == 'GET':
                schedules = Schedule.objects.filter(doctor=doctor)
                serializer = ScheduleSerializer(schedules, many=True)
                return Response(serializer.data)
            
            elif request.method == 'POST':
                # Update or create schedule
                schedule_data = request.data
                schedule, created = Schedule.objects.update_or_create(
                    doctor=doctor,
                    day_of_week=schedule_data.get('day_of_week'),
                    defaults=schedule_data
                )
                serializer = ScheduleSerializer(schedule)
                return Response(serializer.data, 
                              status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except Doctor.DoesNotExist:
            return Response(
                {'error': 'Doctor profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def appointments(self, request):
        """Get doctor's appointments."""
        try:
            doctor = Doctor.objects.get(user=request.user)
            appointments = Appointment.objects.filter(doctor=doctor)
            
            # Filter by status if provided
            status_filter = request.query_params.get('status')
            if status_filter:
                appointments = appointments.filter(status=status_filter)
            
            # Filter by date if provided
            date_filter = request.query_params.get('date')
            if date_filter:
                appointments = appointments.filter(appointment_date=date_filter)
            
            from apps.appointments.serializers import AppointmentSerializer
            serializer = AppointmentSerializer(appointments, many=True)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response(
                {'error': 'Doctor profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
