# Quick Fix Commands for Production Server

## Run these commands on your server (40.81.224.249):

```bash
# 1. Pull latest changes from GitHub
cd ~/doctors-management
git pull origin main

# 2. Restart nginx with new configuration
docker-compose restart nginx

# 3. Check nginx logs
docker-compose logs nginx --tail=20

# 4. Check all containers
docker-compose ps
```

## Your app will be live at:
- **Patient Portal**: http://40.81.224.249:8080/patient
- **Admin Portal**: http://40.81.224.249:8080/admin
- **Doctor Portal**: http://40.81.224.249:8080/doctor
- **Backend API**: http://40.81.224.249:8080/api

## If you want to use port 80 instead of 8080:

```bash
# Stop system nginx
sudo systemctl stop nginx
sudo systemctl disable nginx

# Update docker-compose.yml to use port 80
sed -i 's/"8080:80"/"80:80"/g' docker-compose.yml

# Restart
docker-compose restart nginx
```
