# AfyaConnect Production Deployment Guide: Ubuntu VPS (Without Docker)

This comprehensive guide provides step-by-step instructions for deploying AfyaConnect directly on an Ubuntu VPS without using Docker. This approach offers better performance, easier debugging, and more control over the production environment.

## Table of Contents

1. [System Requirements and Prerequisites](#1-system-requirements-and-prerequisites)
2. [PostgreSQL Database Setup](#2-postgresql-database-setup)
3. [Node.js Installation and Backend Deployment](#3-nodejs-installation-and-backend-deployment)
4. [Frontend Build and Nginx Setup](#4-frontend-build-and-nginx-setup)
5. [Environment Configuration](#5-environment-configuration)
6. [Process Management with PM2](#6-process-management-with-pm2)
7. [SSL/HTTPS Setup with Let's Encrypt](#7-sslhttps-setup-with-lets-encrypt)
8. [Firewall and Security Configuration](#8-firewall-and-security-configuration)
9. [Monitoring and Maintenance](#9-monitoring-and-maintenance)
10. [Backup Strategies](#10-backup-strategies)

## Prerequisites Checklist

- [ ] Ubuntu VPS with root/sudo access
- [ ] Domain name pointing to VPS IP
- [ ] SSH access configured
- [ ] Basic command line knowledge

---

## 1. System Requirements and Prerequisites

### Minimum System Requirements

- **OS**: Ubuntu 20.04 LTS or 22.04 LTS (recommended)
- **RAM**: 2GB minimum, 4GB recommended
- **CPU**: 1 vCPU minimum, 2 vCPU recommended
- **Storage**: 20GB minimum, 50GB recommended
- **Network**: Stable internet connection

### Initial Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git vim ufw htop ncdu software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install build tools for Node.js compilation
sudo apt install -y build-essential python3-dev

# Install PostgreSQL client tools
sudo apt install -y postgresql-client

# Create application user
sudo useradd -m -s /bin/bash afyaconnect
sudo usermod -aG sudo afyaconnect

# Set up SSH key authentication (recommended)
# On your local machine:
# ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
# ssh-copy-id afyaconnect@your-vps-ip

# Switch to application user
su - afyaconnect
```

### Domain Configuration

Ensure your domain's A record points to your VPS IP address:

```bash
# Check if domain resolves to your IP
nslookup yourdomain.com
dig yourdomain.com A
```

---

## 2. PostgreSQL Database Setup

### Install PostgreSQL

```bash
# Add PostgreSQL repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Update package list
sudo apt update

# Install PostgreSQL 15
sudo apt install -y postgresql-15 postgresql-contrib-15

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Inside PostgreSQL shell:
```

```sql
-- Create database and user
CREATE DATABASE afyaconnect_prod;
CREATE USER afyaconnect_user WITH ENCRYPTED PASSWORD 'your-secure-password-here';
GRANT ALL PRIVILEGES ON DATABASE afyaconnect_prod TO afyaconnect_user;

-- Set up database for production
ALTER USER afyaconnect_user CREATEDB;
ALTER DATABASE afyaconnect_prod OWNER TO afyaconnect_user;

-- Exit PostgreSQL
\q
```

### Database Initialization

```bash
# Copy and modify the initialization script
cp init-db.sql init-db-prod.sql

# Edit the script to use the correct database name
sed -i 's/afyaconnect/afyaconnect_prod/g' init-db-prod.sql

# Run the initialization script
sudo -u postgres psql -d afyaconnect_prod -f init-db-prod.sql
```

### PostgreSQL Security Configuration

```bash
# Edit PostgreSQL configuration
sudo vim /etc/postgresql/15/main/pg_hba.conf

# Add the following line (replace with your actual IP if needed):
# host    afyaconnect_prod  afyaconnect_user  127.0.0.1/32    md5

# Edit postgresql.conf for better performance
sudo vim /etc/postgresql/15/main/postgresql.conf

# Recommended settings for production:
# shared_buffers = 256MB
# effective_cache_size = 1GB
# maintenance_work_mem = 64MB
# checkpoint_completion_target = 0.9
# wal_buffers = 16MB
# default_statistics_target = 100

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Database Backup Setup

```bash
# Create backup directory
sudo mkdir -p /var/backups/afyaconnect
sudo chown afyaconnect:afyaconnect /var/backups/afyaconnect

# Create backup script
sudo tee /var/backups/afyaconnect/backup.sh > /dev/null <<EOF
#!/bin/bash
BACKUP_DIR="/var/backups/afyaconnect"
DATE=\$(date +%Y%m%d_%H%M%S)
DB_NAME="afyaconnect_prod"
DB_USER="afyaconnect_user"

# Create backup
pg_dump -U \$DB_USER -h localhost \$DB_NAME > \$BACKUP_DIR/db_backup_\$DATE.sql

# Compress backup
gzip \$BACKUP_DIR/db_backup_\$DATE.sql

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: \$DATE"
EOF

sudo chmod +x /var/backups/afyaconnect/backup.sh
```

---

## 3. Node.js Installation and Backend Deployment

### Install Node.js 18 LTS

```bash
# Install Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Deploy Backend Application

```bash
# Create application directory
sudo mkdir -p /var/www/afyaconnect
sudo chown -R afyaconnect:afyaconnect /var/www/afyaconnect

# Clone or copy your application code
cd /var/www/afyaconnect
git clone https://github.com/yourusername/afyaconnect.git . || cp -r /path/to/your/local/afyaconnect/* .

# Install backend dependencies
cd backend
npm install --production

# Create uploads directory
mkdir -p uploads
chmod 755 uploads
```

### Backend Configuration

```bash
# Create environment file
cp .env .env.production

# Edit environment variables
vim .env.production
```

Add the following configuration:

```bash
# Production Environment Configuration
NODE_ENV=production
PORT=5000
HOST=127.0.0.1

# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=afyaconnect_prod
DB_USER=afyaconnect_user
DB_PASSWORD=your-secure-password-here

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com

# File Upload Configuration
UPLOAD_PATH=/var/www/afyaconnect/backend/uploads
MAX_FILE_SIZE=5242880

# Google AI (optional)
GOOGLE_AI_API_KEY=your-google-ai-api-key-here

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/afyaconnect/backend.log
```

### Database Migration (if needed)

Since the backend code uses SQLite but we're using PostgreSQL, we need to modify the database connection. Check the `database.js` file and update it to use PostgreSQL instead of SQLite.

```bash
# Install PostgreSQL client for Node.js
npm install pg

# Update database.js to use PostgreSQL
vim database.js
```

You'll need to modify the database initialization to use PostgreSQL instead of SQLite. Here's a summary of the changes needed:

1. Replace `import sqlite3 from 'sqlite3';` with `import pkg from 'pg'; const { Client } = pkg;`
2. Replace the SQLite connection with PostgreSQL client
3. Update all SQL queries to be PostgreSQL compatible (e.g., AUTOINCREMENT → SERIAL, INTEGER PRIMARY KEY → SERIAL PRIMARY KEY)
4. Update JSON handling for PostgreSQL
5. Modify the database initialization function to use PostgreSQL syntax

**Note:** This is a significant change. Consider creating a separate PostgreSQL-compatible version of the database module or using an ORM that supports both databases.

Alternatively, you can continue using SQLite for development and only use PostgreSQL in production by setting the appropriate environment variables and connection strings.

---

## 4. Frontend Build and Nginx Setup

### Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Build Frontend Application

```bash
# Navigate to frontend directory
cd /var/www/afyaconnect/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Verify build output
ls -la dist/
```

### Configure Nginx

```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/afyaconnect > /dev/null <<EOF
# Upstream backend
upstream afyaconnect_backend {
    server 127.0.0.1:5000;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL configuration (will be added later)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    # Root directory
    root /var/www/afyaconnect/frontend/dist;
    index index.html;

    # API proxy
    location /api/ {
        proxy_pass http://afyaconnect_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Uploads proxy
    location /uploads/ {
        proxy_pass http://afyaconnect_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }

    # Frontend routes (SPA)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/afyaconnect /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 5. Environment Configuration

### Application Environment Setup

```bash
# Create log directories
sudo mkdir -p /var/log/afyaconnect
sudo chown -R afyaconnect:afyaconnect /var/log/afyaconnect

# Set proper permissions
sudo chown -R afyaconnect:afyaconnect /var/www/afyaconnect
sudo chmod -R 755 /var/www/afyaconnect

# Create systemd service for environment variables
sudo tee /etc/systemd/system/afyaconnect-backend.service > /dev/null <<EOF
[Unit]
Description=AfyaConnect Backend
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=afyaconnect
Group=afyaconnect
EnvironmentFile=/var/www/afyaconnect/backend/.env.production
WorkingDirectory=/var/www/afyaconnect/backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=afyaconnect-backend

[Install]
WantedBy=multi-user.target
EOF
```

### Security Hardening

```bash
# Disable root login via SSH
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# Disable password authentication (if using SSH keys)
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# Restart SSH
sudo systemctl restart sshd

# Set up fail2ban for SSH protection
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 6. Process Management with PM2

### Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create PM2 ecosystem file
cd /var/www/afyaconnect/backend
```

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'afyaconnect-backend',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/afyaconnect/backend-error.log',
    out_file: '/var/log/afyaconnect/backend-out.log',
    log_file: '/var/log/afyaconnect/backend.log',
    time: true
  }]
};
```

### Start Application with PM2

```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u afyaconnect --hp /home/afyaconnect

# Check status
pm2 status
pm2 logs afyaconnect-backend
```

### PM2 Management Commands

```bash
# Monitor processes
pm2 monit

# Restart application
pm2 restart afyaconnect-backend

# Stop application
pm2 stop afyaconnect-backend

# View logs
pm2 logs afyaconnect-backend --lines 100

# Check resource usage
pm2 show afyaconnect-backend
```

---

## 7. SSL/HTTPS Setup with Let's Encrypt

### Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Stop Nginx temporarily for certificate generation
sudo systemctl stop nginx

# Generate SSL certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Start Nginx again
sudo systemctl start nginx
```

### Configure Nginx for SSL

```bash
# Update Nginx configuration with SSL
sudo vim /etc/nginx/sites-available/afyaconnect

# Add SSL configuration:
# ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

# Add SSL settings:
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### Set up Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Set up cron job for renewal (usually already done by certbot)
sudo crontab -l | grep certbot || echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

---

## 8. Firewall and Security Configuration

### Configure UFW Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (change port if you modified SSH config)
sudo ufw allow ssh
sudo ufw allow 22

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow PostgreSQL (only from localhost)
sudo ufw allow from 127.0.0.1 to any port 5432

# Check status
sudo ufw status
```

### Security Headers and Hardening

```bash
# Install security modules for Nginx
sudo apt install -y nginx-extras

# Update Nginx configuration with additional security
sudo vim /etc/nginx/sites-available/afyaconnect

# Add security headers:
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;

# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=uploads:10m rate=5r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
    # ... existing config
}

location /uploads/ {
    limit_req zone=uploads burst=10 nodelay;
    # ... existing config
}
```

### Database Security

```bash
# Configure PostgreSQL to only listen on localhost
sudo vim /etc/postgresql/15/main/postgresql.conf
# listen_addresses = 'localhost'

# Update pg_hba.conf for local connections only
sudo vim /etc/postgresql/15/main/pg_hba.conf
# Ensure only local connections are allowed

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## 9. Monitoring and Maintenance

### System Monitoring Setup

```bash
# Install monitoring tools
sudo apt install -y htop iotop ncdu sysstat

# Enable sysstat for system statistics
sudo sed -i 's/ENABLED="false"/ENABLED="true"/' /etc/default/sysstat
sudo systemctl enable sysstat
sudo systemctl start sysstat

# Create monitoring script
sudo tee /usr/local/bin/afyaconnect-monitor.sh > /dev/null <<EOF
#!/bin/bash
echo "=== AfyaConnect System Monitor ==="
echo "Date: \$(date)"
echo ""

echo "=== System Resources ==="
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - \$1"%"}'
echo ""

echo "Memory Usage:"
free -h
echo ""

echo "Disk Usage:"
df -h / | tail -1
echo ""

echo "=== Application Status ==="
echo "PM2 Processes:"
pm2 jlist | jq -r '.[] | "\(.name): \(.pm2_env.status)"' 2>/dev/null || pm2 status
echo ""

echo "Nginx Status:"
sudo systemctl is-active nginx
echo ""

echo "PostgreSQL Status:"
sudo systemctl is-active postgresql
echo ""

echo "=== Application Logs (Last 10 lines) ==="
echo "Backend logs:"
tail -10 /var/log/afyaconnect/backend.log 2>/dev/null || echo "No backend logs found"
echo ""

echo "Nginx error logs:"
tail -10 /var/log/nginx/error.log 2>/dev/null || echo "No nginx error logs found"
EOF

sudo chmod +x /usr/local/bin/afyaconnect-monitor.sh
```

### Log Rotation Setup

```bash
# Configure logrotate for application logs
sudo tee /etc/logrotate.d/afyaconnect > /dev/null <<EOF
/var/log/afyaconnect/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 afyaconnect afyaconnect
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

### Automated Maintenance

```bash
# Create maintenance script
sudo tee /usr/local/bin/afyaconnect-maintenance.sh > /dev/null <<EOF
#!/bin/bash
echo "Starting AfyaConnect maintenance tasks..."

# Update system packages
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Clean package cache
echo "Cleaning package cache..."
sudo apt autoremove -y
sudo apt autoclean

# Update Node.js dependencies (careful with this in production)
echo "Checking for outdated npm packages..."
cd /var/www/afyaconnect/backend
npm outdated

# Restart services if needed
echo "Restarting services..."
pm2 restart all
sudo systemctl reload nginx

# Run database maintenance
echo "Running database maintenance..."
sudo -u postgres vacuumdb --all --analyze

echo "Maintenance completed!"
EOF

sudo chmod +x /usr/local/bin/afyaconnect-maintenance.sh

# Set up weekly maintenance cron job
echo "0 2 * * 0 /usr/local/bin/afyaconnect-maintenance.sh" | sudo crontab -
```

---

## 10. Backup Strategies

### Comprehensive Backup Solution

```bash
# Create backup directory structure
sudo mkdir -p /var/backups/afyaconnect/{database,application,config}
sudo chown -R afyaconnect:afyaconnect /var/backups/afyaconnect

# Create comprehensive backup script
sudo tee /var/backups/afyaconnect/full-backup.sh > /dev/null <<EOF
#!/bin/bash
BACKUP_ROOT="/var/backups/afyaconnect"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="\$BACKUP_ROOT/backup_\$DATE"

echo "Starting AfyaConnect full backup: \$DATE"

# Create backup directory
mkdir -p \$BACKUP_DIR

# Database backup
echo "Backing up database..."
pg_dump -U afyaconnect_user -h localhost afyaconnect_prod > \$BACKUP_DIR/database.sql
gzip \$BACKUP_DIR/database.sql

# Application files backup
echo "Backing up application files..."
tar -czf \$BACKUP_DIR/application.tar.gz -C /var/www afyaconnect

# Configuration backup
echo "Backing up configuration..."
cp /etc/nginx/sites-available/afyaconnect \$BACKUP_DIR/nginx-config
cp /var/www/afyaconnect/backend/.env.production \$BACKUP_DIR/env-backup
cp /etc/postgresql/15/main/pg_hba.conf \$BACKUP_DIR/pg_hba.conf
cp /etc/postgresql/15/main/postgresql.conf \$BACKUP_DIR/postgresql.conf

# PM2 configuration
pm2 save
cp ~/.pm2/dump.pm2 \$BACKUP_DIR/pm2-dump

# Compress everything
cd \$BACKUP_ROOT
tar -czf backup_\$DATE.tar.gz backup_\$DATE
rm -rf backup_\$DATE

# Keep only last 7 full backups
ls -t backup_*.tar.gz | tail -n +8 | xargs -r rm

echo "Backup completed: backup_\$DATE.tar.gz"
echo "Backup size: \$(du -sh backup_\$DATE.tar.gz | cut -f1)"
EOF

sudo chmod +x /var/backups/afyaconnect/full-backup.sh
```

### Automated Backup Schedule

```bash
# Set up cron jobs for backups
sudo crontab -e

# Add these lines:
# Daily database backup at 2 AM
0 2 * * * /var/backups/afyaconnect/backup.sh

# Weekly full backup every Sunday at 3 AM
0 3 * * 0 /var/backups/afyaconnect/full-backup.sh

# Monthly offsite backup (if you have remote storage)
# 0 4 1 * * /var/backups/afyaconnect/offsite-backup.sh
```

### Backup Testing and Restoration

```bash
# Create restoration script
sudo tee /var/backups/afyaconnect/restore.sh > /dev/null <<EOF
#!/bin/bash
if [ -z "\$1" ]; then
    echo "Usage: \$0 <backup-file.tar.gz>"
    exit 1
fi

BACKUP_FILE="\$1"
BACKUP_ROOT="/var/backups/afyaconnect"
RESTORE_DIR="\$BACKUP_ROOT/restore_temp"

echo "Starting restoration from: \$BACKUP_FILE"

# Stop services
echo "Stopping services..."
pm2 stop all
sudo systemctl stop nginx

# Create restore directory
mkdir -p \$RESTORE_DIR

# Extract backup
tar -xzf "\$BACKUP_FILE" -C \$RESTORE_DIR

# Restore database
echo "Restoring database..."
gunzip -c \$RESTORE_DIR/backup_*/database.sql.gz | sudo -u postgres psql afyaconnect_prod

# Restore application files
echo "Restoring application files..."
rm -rf /var/www/afyaconnect.bak
mv /var/www/afyaconnect /var/www/afyaconnect.bak
tar -xzf \$RESTORE_DIR/backup_*/application.tar.gz -C /var/www

# Restore configuration
echo "Restoring configuration..."
cp \$RESTORE_DIR/backup_*/nginx-config /etc/nginx/sites-available/afyaconnect
cp \$RESTORE_DIR/backup_*/env-backup /var/www/afyaconnect/backend/.env.production

# Start services
echo "Starting services..."
sudo systemctl start nginx
pm2 start all

# Cleanup
rm -rf \$RESTORE_DIR

echo "Restoration completed!"
EOF

sudo chmod +x /var/backups/afyaconnect/restore.sh
```

### Offsite Backup (Optional)

```bash
# Install rclone for cloud storage backup
sudo apt install -y rclone

# Configure rclone (example for Google Drive)
rclone config

# Create offsite backup script
sudo tee /var/backups/afyaconnect/offsite-backup.sh > /dev/null <<EOF
#!/bin/bash
BACKUP_ROOT="/var/backups/afyaconnect"
REMOTE_NAME="gdrive"  # Change to your rclone remote name
REMOTE_DIR="afyaconnect-backups"

# Upload latest backup to cloud storage
LATEST_BACKUP=\$(ls -t \$BACKUP_ROOT/backup_*.tar.gz | head -1)

if [ -f "\$LATEST_BACKUP" ]; then
    echo "Uploading \$LATEST_BACKUP to cloud storage..."
    rclone copy "\$LATEST_BACKUP" "\$REMOTE_NAME:\$REMOTE_DIR/"
    echo "Offsite backup completed!"
else
    echo "No backup file found!"
fi
EOF

sudo chmod +x /var/backups/afyaconnect/offsite-backup.sh
```

---

## Production Security Best Practices

### Additional Security Measures

1. **Regular Updates**: Keep all system packages and dependencies updated
2. **Monitoring**: Set up alerts for system resource usage and application errors
3. **Access Control**: Use SSH keys only, disable password authentication
4. **Firewall**: Keep UFW enabled with minimal open ports
5. **SSL/TLS**: Always use HTTPS with strong ciphers
6. **Database Security**: Regular database audits and query optimization
7. **Backup Security**: Encrypt backups and store offsite
8. **Log Monitoring**: Regular log analysis for security incidents

### Performance Optimization

1. **Database Indexing**: Ensure proper indexes on frequently queried columns
2. **Caching**: Implement Redis for session and data caching
3. **CDN**: Use CDN for static assets
4. **Compression**: Enable gzip compression for all responses
5. **Load Balancing**: Consider load balancer for high traffic

### Monitoring Checklist

- [ ] System resources (CPU, memory, disk)
- [ ] Application logs
- [ ] Database performance
- [ ] SSL certificate expiration
- [ ] Backup success/failure
- [ ] Security alerts

---

## Troubleshooting Guide

### Common Issues and Solutions

**Application won't start:**
```bash
# Check PM2 status and logs
pm2 status
pm2 logs afyaconnect-backend --lines 50

# Check environment variables
pm2 show afyaconnect-backend

# Check if Node.js process is running
ps aux | grep node

# Check database connection
sudo -u postgres psql -h localhost -U afyaconnect_user -d afyaconnect_prod -c "SELECT version();"
```

**Database connection issues:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Test connection manually
psql -h localhost -U afyaconnect_user -d afyaconnect_prod

# Check if database exists
sudo -u postgres psql -l

# Verify user permissions
sudo -u postgres psql -c "SELECT * FROM pg_roles WHERE rolname = 'afyaconnect_user';"
```

**Nginx issues:**
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Check access logs
sudo tail -f /var/log/nginx/access.log

# Restart Nginx
sudo systemctl restart nginx

# Check if Nginx is listening on correct ports
sudo netstat -tlnp | grep nginx
```

**SSL certificate issues:**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Reload Nginx
sudo systemctl reload nginx

# Test SSL connection
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com < /dev/null
```

**Permission issues:**
```bash
# Check file permissions
ls -la /var/www/afyaconnect/

# Fix permissions if needed
sudo chown -R afyaconnect:afyaconnect /var/www/afyaconnect
sudo chmod -R 755 /var/www/afyaconnect

# Check log directory permissions
sudo chown -R afyaconnect:afyaconnect /var/log/afyaconnect
```

**Memory or performance issues:**
```bash
# Check system resources
htop
free -h
df -h

# Check PM2 process memory usage
pm2 monit

# Restart services if needed
pm2 restart all
sudo systemctl restart nginx
```

**Firewall issues:**
```bash
# Check UFW status
sudo ufw status

# Check if ports are open
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# Test external connectivity
curl -I http://yourdomain.com
curl -I https://yourdomain.com
```

---

## Final Checklist

- [ ] Server provisioned and secured
- [ ] PostgreSQL installed and configured
- [ ] Node.js installed and backend deployed
- [ ] Frontend built and Nginx configured
- [ ] Environment variables set
- [ ] PM2 process manager configured
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Monitoring and logging set up
- [ ] Backup system configured
- [ ] Application tested and accessible

---

## Support and Maintenance

### Regular Maintenance Tasks

1. **Daily**: Check system resources and application logs
2. **Weekly**: Update system packages and restart services
3. **Monthly**: Review and test backups, update SSL certificates
4. **Quarterly**: Security audit, performance optimization

### Useful Commands

```bash
# System monitoring
htop
df -h
free -h
sudo ufw status

# Application monitoring
pm2 monit
pm2 logs
sudo systemctl status nginx postgresql

# Backup operations
/var/backups/afyaconnect/backup.sh
/var/backups/afyaconnect/full-backup.sh

# Log checking
tail -f /var/log/afyaconnect/backend.log
sudo tail -f /var/log/nginx/access.log
```

For additional support, check the application logs and consult the AfyaConnect documentation.