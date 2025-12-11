from django.urls import path
from .views import register_patient, register_doctor, login, logout, password_reset_request, password_reset_confirm

urlpatterns = [
    path('register/', register_patient, name='register'),
    path('register/doctor/', register_doctor, name='register-doctor'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('password-reset/', password_reset_request, name='password-reset'),
    path('password-reset/confirm/', password_reset_confirm, name='password-reset-confirm'),
]

