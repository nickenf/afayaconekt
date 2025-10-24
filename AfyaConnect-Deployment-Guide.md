# AfyaConnect Deployment Guide: Hostinger VPS with Docker

This comprehensive guide provides step-by-step instructions for deploying AfyaConnect on a Hostinger VPS running Ubuntu 24.04 with Docker. The guide is structured into six phases and includes troubleshooting for common issues.

## Prerequisites

- Hostinger VPS with Ubuntu 24.04
- Root or sudo access to the VPS
- SSH client on your local machine
- Domain name (optional but recommended for production)
- Basic knowledge of command line operations

## Phase 1: VPS Preparation (Ubuntu 24.04)

### Step 1: Connect to Your VPS

**Location: Local Machine**

```bash
ssh root@your-vps-ip-address
```

Replace `your-vps-ip-address` with your actual VPS IP address.

### Step 2: Update System Packages

**Location: VPS**

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 3: Install Essential Tools

**Location: VPS**

```bash
sudo apt install -y curl wget git vim ufw fail2ban htop
```

### Step 4: Create Non-Root User

**Location: VPS**

```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

### Step 5: Install Docker

**Location: VPS**

```bash
# Update package index
sudo apt update

# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### Step 6: Configure Docker

**Location: VPS**

```bash
# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Verification Steps

**Location: VPS**

```bash
# Test Docker installation
docker run hello-world

# Check versions
docker --version
docker compose version

# Verify user can run Docker commands
docker ps
```

**Expected Output:**
- Hello-world container runs successfully
- Docker version displayed
- Docker Compose version displayed
- No permission errors when running `docker ps`

### Troubleshooting Phase 1

**Issue: Permission denied when running Docker commands**
```bash
sudo usermod -aG docker $USER
newgrp docker
```

**Issue: Docker service fails to start**
```bash
sudo systemctl status docker
sudo systemctl restart docker
```

## Phase 2: File Transfer Methods

Choose one of the following methods to transfer your AfyaConnect project files to the VPS.

### Method 1: SCP (Recommended for First Deployment)

**Location: Local Machine**

```bash
scp -r /path/to/afyaconnect-full-backup deploy@your-vps-ip:/home/deploy/
```

Replace `/path/to/afyaconnect-full-backup` with your local project path.

### Method 2: Git Clone (Recommended for Updates)

**Location: VPS**

```bash
cd /home/deploy
git clone https://github.com/yourusername/afyaconnect.git
cd afyaconnect
```

### Method 3: SFTP (Interactive Transfer)

**Location: Local Machine**

```bash
sftp deploy@your-vps-ip
cd /home/deploy
put -r afyaconnect-full-backup
exit
```

### Verification Steps

**Location: VPS**

```bash
ls -la /home/deploy/
cd /home/deploy/afyaconnect-full-backup
ls -la
```

**Expected Output:**
- Project directory exists with all files
- Key files present: docker-compose.yml, backend/, frontend/, nginx/, .env.production

### Troubleshooting Phase 2

**Issue: SCP connection refused**
- Verify SSH is running: `sudo systemctl status ssh`
- Check firewall: `sudo ufw status`
- Ensure correct IP address and username

**Issue: Permission denied during transfer**
- Check file permissions on local machine
- Ensure deploy user has write permissions on VPS

## Phase 3: Environment Configuration

### Step 1: Copy Environment Template

**Location: VPS**

```bash
cd /home/deploy/afyaconnect-full-backup
cp .env.production .env
```

### Step 2: Edit Environment Variables

**Location: VPS**

```bash
vim .env
```

Update the following critical variables:

```bash
# Database
DB_PASSWORD=your-secure-database-password-here

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS (update with your domain)
CORS_ORIGIN=https://yourdomain.com

# Google AI (if using AI features)
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
```

### Step 3: Generate Secure Secrets

**Location: VPS**

```bash
# Generate JWT secret
openssl rand -hex 32

# Generate database password
openssl rand -hex 16
```

### Verification Steps

**Location: VPS**

```bash
# Check environment file exists
ls -la .env

# Verify key variables are set (don't show values for security)
grep -E "(DB_PASSWORD|JWT_SECRET|CORS_ORIGIN)" .env
```

**Expected Output:**
- .env file exists
- Variables are configured (values hidden for security)

### Troubleshooting Phase 3

**Issue: Environment variables not loading**
- Ensure .env file is in the same directory as docker-compose.yml
- Check for typos in variable names
- Restart containers after changing .env

**Issue: CORS errors in production**
- Update CORS_ORIGIN with your actual domain
- Include protocol (https://) and no trailing slash

## Phase 4: Docker Deployment

### Step 1: Navigate to Project Directory

**Location: VPS**

```bash
cd /home/deploy/afyaconnect-full-backup
```

### Step 2: Build and Start Services

**Location: VPS**

```bash
# Build and start all services
docker compose up -d --build

# Wait for services to be healthy
sleep 30
```

### Step 3: Check Service Status

**Location: VPS**

```bash
# Check running containers
docker compose ps

# Check service health
docker compose exec db pg_isready -U afyaconnect_user -d afyaconnect
docker compose exec backend node healthcheck.js
```

### Verification Steps

**Location: VPS**

```bash
# Check all services are running
docker compose ps

# Check logs for errors
docker compose logs --tail=50

# Test database connection
docker compose exec db psql -U afyaconnect_user -d afyaconnect -c "SELECT version();"

# Test backend health
curl http://localhost:5000/health
```

**Expected Output:**
- All services show "Up" status
- No error logs
- Database connection successful
- Backend health check returns success

### Troubleshooting Phase 4

**Issue: Database connection fails**
```bash
# Check database logs
docker compose logs db

# Verify environment variables
docker compose exec backend env | grep DB_

# Test manual connection
docker compose exec db psql -U afyaconnect_user -d afyaconnect
```

**Issue: Port already in use**
```bash
# Find process using port
sudo lsof -i :80
sudo lsof -i :443

# Kill conflicting process
sudo kill -9 <PID>
```

**Issue: Out of memory**
```bash
# Check memory usage
docker stats

# Increase Docker memory limit or add swap
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## Phase 5: Domain & SSL Setup

### Step 1: Configure Domain DNS

**Location: Hostinger Control Panel**

1. Log into Hostinger control panel
2. Go to DNS settings for your domain
3. Add A record: `@` → `your-vps-ip`
4. Add CNAME record: `www` → `yourdomain.com`
5. Wait for DNS propagation (can take up to 24 hours)

### Step 2: Obtain SSL Certificate (Let's Encrypt)

**Location: VPS**

```bash
# Install Certbot
sudo apt install -y certbot

# Stop nginx temporarily
docker compose stop nginx

# Obtain certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Start nginx again
docker compose start nginx
```

### Step 3: Configure Nginx for SSL

**Location: VPS**

```bash
# Copy certificates to nginx directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./nginx/ssl/cert.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./nginx/ssl/private.key

# Set proper permissions
sudo chown deploy:deploy ./nginx/ssl/*
```

### Step 4: Update Nginx Configuration

**Location: VPS**

Edit `nginx/nginx.conf` to include your domain:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/ssl/certs/cert.crt;
    ssl_certificate_key /etc/ssl/private/certs/private.key;

    # ... rest of configuration
}
```

### Step 5: Restart Services

**Location: VPS**

```bash
docker compose restart nginx
```

### Verification Steps

**Location: Local Machine**

```bash
# Test HTTP to HTTPS redirect
curl -I http://yourdomain.com

# Test SSL certificate
curl -I https://yourdomain.com

# Check SSL certificate validity
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

**Expected Output:**
- HTTP redirects to HTTPS
- SSL certificate is valid
- No certificate errors

### Troubleshooting Phase 5

**Issue: DNS not propagating**
- Wait longer (up to 48 hours)
- Check DNS with: `dig yourdomain.com`
- Clear local DNS cache

**Issue: SSL certificate fails**
```bash
# Check Certbot logs
sudo certbot certificates

# Renew certificate
sudo certbot renew
```

**Issue: Mixed content warnings**
- Ensure all assets load over HTTPS
- Update any hardcoded HTTP URLs in frontend

## Phase 6: Testing & Verification

### Step 1: Test Application Access

**Location: Local Machine**

```bash
# Test frontend
curl -k https://yourdomain.com

# Test API
curl -k https://yourdomain.com/api/health

# Test database connectivity
curl -k https://yourdomain.com/api/test-db
```

### Step 2: Functional Testing

**Location: Browser**

1. Visit `https://yourdomain.com`
2. Test user registration
3. Test login functionality
4. Test core features (hospital search, booking, etc.)
5. Test file uploads
6. Test AI features (if enabled)

### Step 3: Performance Testing

**Location: VPS**

```bash
# Check resource usage
docker stats

# Test response times
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com

# Check nginx access logs
docker compose logs nginx | tail -20
```

### Step 4: Security Testing

**Location: Local Machine**

```bash
# Test SSL configuration
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com < /dev/null

# Check security headers
curl -I https://yourdomain.com

# Test firewall
sudo ufw status
```

### Step 5: Backup Testing

**Location: VPS**

```bash
# Test database backup
docker exec afyaconnect-db pg_dump -U afyaconnect_user afyaconnect > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -la backup_*.sql
```

### Verification Steps

**Location: VPS**

```bash
# Comprehensive health check
docker compose ps
docker compose exec db pg_isready -U afyaconnect_user -d afyaconnect
docker compose exec backend wget --no-verbose --tries=1 --spider http://localhost:5000/health
curl -k https://localhost/health

# Check logs for errors
docker compose logs --tail=20 | grep -i error || echo "No errors found"
```

**Expected Output:**
- All services healthy
- No error logs
- Application accessible via domain
- SSL working correctly
- Database connections successful

### Troubleshooting Phase 6

**Issue: Application not accessible**
```bash
# Check nginx configuration
docker compose logs nginx

# Test internal connectivity
docker compose exec nginx wget --no-verbose --tries=1 --spider http://backend:5000/health
```

**Issue: Database errors in application**
```bash
# Check database logs
docker compose logs db

# Verify database schema
docker compose exec db psql -U afyaconnect_user -d afyaconnect -c "\dt"
```

**Issue: SSL certificate expired**
```bash
# Renew certificate
sudo certbot renew

# Reload nginx
docker compose restart nginx
```

## Maintenance & Monitoring

### Regular Tasks

**Location: VPS**

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker compose pull

# Restart services
docker compose restart

# Check disk space
df -h

# Monitor logs
docker compose logs -f --tail=100
```

### Backup Schedule

**Location: VPS**

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
docker exec afyaconnect-db pg_dump -U afyaconnect_user afyaconnect > $BACKUP_DIR/db_$DATE.sql

# Uploads backup
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /home/deploy/afyaconnect-full-backup backend/uploads

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x backup.sh

# Add to crontab for daily backups at 2 AM
(crontab -l ; echo "0 2 * * * /home/deploy/backup.sh") | crontab -
```

## Final Checklist

- [ ] VPS accessible via SSH
- [ ] Docker installed and running
- [ ] Project files transferred
- [ ] Environment variables configured
- [ ] All services running and healthy
- [ ] Domain pointing to VPS
- [ ] SSL certificate installed
- [ ] Application accessible via HTTPS
- [ ] Core functionality tested
- [ ] Backup system configured
- [ ] Monitoring in place

## Support Resources

- [Docker Documentation](https://docs.docker.com/)
- [Ubuntu Server Guide](https://ubuntu.com/server/docs)
- [Hostinger VPS Documentation](https://www.hostinger.com/tutorials/vps)
- [Let's Encrypt Documentation](https://certbot.eff.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

For application-specific issues, check the logs and refer to the AfyaConnect documentation.