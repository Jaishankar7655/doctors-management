# Quick Deployment Commands

## Deploy to Production Server (40.81.224.249)

Run these commands one by one:

### 1. Connect to server and deploy:
```powershell
ssh azureuser@40.81.224.249 "cd /home/azureuser && git clone https://github.com/Jaishankar7655/doctors-management.git || (cd doctors-management && git pull origin main)"
```

### 2. Pull Docker images:
```powershell
ssh azureuser@40.81.224.249 "cd /home/azureuser/doctors-management && docker-compose -f docker-compose.prod.yml pull"
```

### 3. Stop old containers:
```powershell
ssh azureuser@40.81.224.249 "cd /home/azureuser/doctors-management && docker-compose -f docker-compose.prod.yml down"
```

### 4. Start new containers:
```powershell
ssh azureuser@40.81.224.249 "cd /home/azureuser/doctors-management && docker-compose -f docker-compose.prod.yml up -d"
```

### 5. Check status:
```powershell
ssh azureuser@40.81.224.249 "cd /home/azureuser/doctors-management && docker-compose -f docker-compose.prod.yml ps"
```

---

## Your Live URLs (After Deployment):

- **Patient Portal**: http://40.81.224.249/patient
- **Admin Portal**: http://40.81.224.249/admin
- **Doctor Portal**: http://40.81.224.249/doctor
- **Backend API**: http://40.81.224.249/api

---

## View Logs:
```powershell
ssh azureuser@40.81.224.249 "cd /home/azureuser/doctors-management && docker-compose -f docker-compose.prod.yml logs -f"
```
