from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['patient', 'doctor', 'appointment_date', 'appointment_time', 
                   'appointment_type', 'status', 'created_at']
    list_filter = ['status', 'appointment_type', 'appointment_date', 'created_at']
    search_fields = ['patient__user__email', 'doctor__user__email']
    date_hierarchy = 'appointment_date'

