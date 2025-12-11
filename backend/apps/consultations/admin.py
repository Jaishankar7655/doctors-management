from django.contrib import admin
from .models import Consultation


@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ['appointment', 'follow_up_date', 'created_at']
    list_filter = ['created_at', 'follow_up_date']
    search_fields = ['appointment__patient__user__email', 'appointment__doctor__user__email']

