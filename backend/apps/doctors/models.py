from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()


class Specialty(models.Model):
    """Medical specialty model."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'specialties'
        verbose_name_plural = 'Specialties'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Doctor(models.Model):
    """Doctor model."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    specialization = models.ManyToManyField(Specialty, related_name='doctors')
    profile_photo = models.ImageField(upload_to='doctors/photos/', blank=True, null=True)
    experience_years = models.IntegerField(default=0)
    qualification = models.CharField(max_length=200, blank=True)
    registration_number = models.CharField(max_length=100, blank=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    clinic_address = models.TextField(blank=True)
    clinic_city = models.CharField(max_length=100, blank=True)
    clinic_state = models.CharField(max_length=100, blank=True)
    clinic_pincode = models.CharField(max_length=10, blank=True)
    online_consultation_available = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=Decimal('0.00'))
    total_reviews = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'doctors'
        ordering = ['-rating', '-created_at']
    
    def __str__(self):
        return f"{self.user.full_name} (Doctor)"
    
    def update_rating(self):
        """Update rating based on reviews."""
        from apps.doctors.models import Review
        reviews = Review.objects.filter(doctor=self)
        if reviews.exists():
            self.rating = reviews.aggregate(models.Avg('rating'))['rating__avg'] or Decimal('0.00')
            self.total_reviews = reviews.count()
            self.save()


class Schedule(models.Model):
    """Doctor schedule model."""
    DAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]
    
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    slot_duration = models.IntegerField(default=30)  # in minutes
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'schedules'
        unique_together = ['doctor', 'day_of_week']
        ordering = ['doctor', 'day_of_week']
    
    def __str__(self):
        return f"{self.doctor.user.full_name} - {self.get_day_of_week_display()}"


class Review(models.Model):
    """Doctor review model."""
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, related_name='reviews')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'reviews'
        unique_together = ['patient', 'doctor']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.patient.user.full_name} - {self.doctor.user.full_name} ({self.rating} stars)"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.doctor.update_rating()

