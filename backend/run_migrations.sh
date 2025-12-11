#!/bin/bash
# Script to run migrations for the healthcare platform

echo "Running migrations..."
python manage.py makemigrations
python manage.py migrate

echo "Migrations completed!"

