FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

# Run migrations and start gunicorn
CMD python manage.py migrate && \
    gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3
