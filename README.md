# Healthcare Appointment Booking Platform - Deployment Guide

## 🌐 Live URLs

Access the application at **http://40.81.224.249**

### Portal URLs:
- **Patient Portal**: http://40.81.224.249/
- **Admin Portal**: http://40.81.224.249/admin-portal
- **Doctor Portal**: http://40.81.224.249/doctor-portal
- **Django Admin**: http://40.81.224.249/django-admin
- **API**: http://40.81.224.249/api/

---

## 📋 Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- Server with public IP: 40.81.224.249
- Minimum 2GB RAM, 20GB disk space

---

## 🚀 Quick Start Deployment

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd Doctors
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:

```bash
# Database Configuration
MYSQL_ROOT_PASSWORD=rootpassword123
MYSQL_DATABASE=healthcare_db
MYSQL_USER=healthcare_user
MYSQL_PASSWORD=healthcare_pass123

# Django Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production
DEBUG=False
ALLOWED_HOSTS=40.81.224.249,localhost,127.0.0.1

# API URLs for Frontend
VITE_API_URL=http://40.81.224.249/api
```

### 3. Build and Start All Services
```bash
# Build all containers
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Create Superuser (Admin Account)
```bash
docker-compose exec backend python manage.py createsuperuser
```

Follow the prompts to create your admin account.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│           Nginx Reverse Proxy (Port 80)         │
│              http://40.81.224.249                │
└────────────┬────────────────────────────────────┘
             │
    ┌────────┴────────┬──────────┬──────────┐
    │                 │          │          │
┌───▼────┐  ┌────────▼──┐  ┌────▼───┐  ┌──▼─────┐
│Patient │  │   Admin   │  │ Doctor │  │Backend │
│Portal  │  │  Portal   │  │ Portal │  │  API   │
│  (/)   │  │(/admin-   │  │(/doctor│  │ (/api) │
│        │  │ portal)   │  │-portal)│  │        │
└────────┘  └───────────┘  └────────┘  └───┬────┘
                                            │
                                       ┌────▼────┐
                                       │  MySQL  │
                                       │Database │
                                       └─────────┘
```

---

## 📱 Portal Access Guide

### Patient Portal (Main Website)
**URL**: http://40.81.224.249/

**Features**:
- Browse doctors without login
- Register as a patient
- Book appointments
- View appointment history
- Manage profile

**Default Test Account**:
- Email: `patient@test.com`
- Password: `patient123`

---

### Admin Portal
**URL**: http://40.81.224.249/admin-portal

**Features**:
- Approve/reject doctor registrations
- Manage all doctors (edit, disable, delete)
- View and manage all appointments
- User management
- System statistics

**Access**:
Use the superuser account created in step 4.

---

### Doctor Portal
**URL**: http://40.81.224.249/doctor-portal

**Features**:
- Register as a doctor
- Manage availability schedule
- View appointments
- Update profile

**Registration**:
1. Visit doctor portal
2. Click "Register"
3. Fill in details
4. Wait for admin approval

---

### Django Admin (Backend Admin)
**URL**: http://40.81.224.249/django-admin

**Access**: Use superuser credentials

**Features**:
- Full database access
- Advanced user management
- System configuration

---

## 🔧 Configuration Details

### Docker Services

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| MySQL | healthcare_db | 3306 | Database server |
| Backend | healthcare_backend | 8000 | Django API |
| Patient Portal | healthcare_patient_portal | - | React app |
| Admin Portal | healthcare_admin_portal | - | React app |
| Doctor Portal | healthcare_doctor_portal | - | React app |
| Nginx | healthcare_nginx | 80, 443 | Reverse proxy |

### Nginx Routing

```nginx
/                    → Patient Portal
/admin-portal        → Admin Portal
/doctor-portal       → Doctor Portal
/api/                → Backend API
/django-admin/       → Django Admin
/static/             → Static files
/media/              → Media files
```

---

## 📊 Database Management

### Access MySQL Database
```bash
# Connect to MySQL container
docker-compose exec db mysql -u healthcare_user -p

# Enter password: healthcare_pass123

# Use database
USE healthcare_db;

# Show tables
SHOW TABLES;
```

### Backup Database
```bash
docker-compose exec db mysqldump -u healthcare_user -p healthcare_db > backup.sql
```

### Restore Database
```bash
docker-compose exec -T db mysql -u healthcare_user -p healthcare_db < backup.sql
```

---

## 🛠️ Common Commands

### View Service Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f nginx
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart nginx
```

### Stop All Services
```bash
docker-compose down
```

### Stop and Remove Volumes (⚠️ Deletes data)
```bash
docker-compose down -v
```

### Rebuild After Code Changes
```bash
# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Rebuild all
docker-compose build
docker-compose up -d
```

---

## 🔐 Security Recommendations

### Production Checklist:
- [ ] Change all default passwords
- [ ] Update `SECRET_KEY` in environment variables
- [ ] Set `DEBUG=False` in production
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up firewall rules
- [ ] Enable database backups
- [ ] Configure log rotation
- [ ] Set up monitoring

### SSL/HTTPS Setup (Optional)
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d 40.81.224.249
```

---

## 🐛 Troubleshooting

### Issue: Containers won't start
```bash
# Check logs
docker-compose logs

# Check if ports are in use
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :3306
```

### Issue: Database connection failed
```bash
# Check if MySQL is healthy
docker-compose ps

# Restart database
docker-compose restart db

# Wait for health check
docker-compose logs db
```

### Issue: Frontend shows API errors
```bash
# Check backend logs
docker-compose logs backend

# Verify API URL in frontend
echo $VITE_API_URL

# Rebuild frontend
docker-compose build patient-portal admin-portal doctor-portal
docker-compose up -d
```

### Issue: Nginx 502 Bad Gateway
```bash
# Check backend is running
docker-compose ps backend

# Check nginx configuration
docker-compose exec nginx nginx -t

# Restart nginx
docker-compose restart nginx
```

---

## 📈 Monitoring

### Check Resource Usage
```bash
docker stats
```

### Check Disk Usage
```bash
docker system df
```

### Clean Up Unused Resources
```bash
docker system prune -a
```

---

## 🔄 Update Deployment

### Update Code
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose build
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate
```

---

## 📞 Support

### Logs Location
- Backend logs: `docker-compose logs backend`
- Nginx logs: `docker-compose logs nginx`
- Database logs: `docker-compose logs db`

### Health Checks
```bash
# Check all services
docker-compose ps

# Test API
curl http://40.81.224.249/api/

# Test patient portal
curl http://40.81.224.249/

# Test admin portal
curl http://40.81.224.249/admin-portal
```

---

## 📝 Default Credentials

### Superuser (Create during setup)
- Access: Django Admin, Admin Portal
- Create with: `docker-compose exec backend python manage.py createsuperuser`

### Test Accounts (Optional - Create manually)
```bash
# Create test patient
docker-compose exec backend python manage.py shell
>>> from apps.users.models import User
>>> from apps.patients.models import Patient
>>> user = User.objects.create_user(email='patient@test.com', password='patient123', user_type='patient')
>>> Patient.objects.create(user=user)
```

---

## 🎯 Quick Reference

### Essential URLs
| Portal | URL |
|--------|-----|
| Patient | http://40.81.224.249/ |
| Admin | http://40.81.224.249/admin-portal |
| Doctor | http://40.81.224.249/doctor-portal |
| API Docs | http://40.81.224.249/api/ |

### Essential Commands
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Restart
docker-compose restart

# Rebuild
docker-compose build && docker-compose up -d
```

---

## ✅ Deployment Checklist

- [ ] Server has Docker and Docker Compose installed
- [ ] Cloned repository to server
- [ ] Created `.env` file with configurations
- [ ] Built all containers: `docker-compose build`
- [ ] Started all services: `docker-compose up -d`
- [ ] Created superuser account
- [ ] Verified all portals are accessible
- [ ] Tested patient registration and login
- [ ] Tested doctor registration
- [ ] Tested admin portal access
- [ ] Configured backups
- [ ] Set up monitoring

---

## 🎉 Success!

Your Healthcare Appointment Booking Platform is now live at:
**http://40.81.224.249**

All three portals are accessible and ready to use!

---

*For issues or questions, check the troubleshooting section or review the logs.*
