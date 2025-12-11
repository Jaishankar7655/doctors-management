from django.contrib import admin
from .models import Doctor, Specialty, Schedule, Review


@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_approved', 'rating', 'consultation_fee', 'created_at']
    list_filter = ['is_approved', 'online_consultation_available', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    filter_horizontal = ['specialization']


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ['doctor', 'day_of_week', 'start_time', 'end_time', 'is_available']
    list_filter = ['day_of_week', 'is_available']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['patient', 'doctor', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']

