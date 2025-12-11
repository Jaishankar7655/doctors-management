from django.contrib import admin
from .models import Patient


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['user', 'city', 'state', 'created_at']
    list_filter = ['city', 'state', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']

