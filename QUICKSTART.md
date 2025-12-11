# Healthcare Platform - Quick Deployment Guide

## 🚀 One-Command Deployment

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

## 📋 Manual Deployment Steps

### 1. Setup Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### 2. Build & Start
```bash
docker-compose build
docker-compose up -d
```

### 3. Create Admin
```bash
docker-compose exec backend python manage.py createsuperuser
```

## 🌐 Access URLs

- **Patient Portal**: http://40.81.224.249/
- **Admin Portal**: http://40.81.224.249/admin-portal
- **Doctor Portal**: http://40.81.224.249/doctor-portal
- **API**: http://40.81.224.249/api/

## 📊 Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop all
docker-compose down

# Database backup
docker-compose exec db mysqldump -u healthcare_user -p healthcare_db > backup.sql
```

## 🔧 Troubleshooting

### Services won't start
```bash
docker-compose logs
docker-compose ps
```

### Reset everything
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

For detailed documentation, see [DEPLOYMENT_README.md](./DEPLOYMENT_README.md)
