from django.db import models


class Consultation(models.Model):
    """Consultation model."""
    appointment = models.OneToOneField('appointments.Appointment', on_delete=models.CASCADE, related_name='consultation')
    diagnosis = models.TextField(blank=True)
    prescription = models.TextField(blank=True)
    follow_up_date = models.DateField(blank=True, null=True)
    notes = models.TextField(blank=True)
    documents = models.FileField(upload_to='consultations/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'consultations'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Consultation for {self.appointment}"

