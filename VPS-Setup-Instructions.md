# VPS Preparation and File Transfer Instructions for Ubuntu 24.04 with Docker

This guide provides detailed, beginner-friendly instructions for setting up a VPS running Ubuntu 24.04 with Docker. It includes step-by-step commands, multiple file transfer methods, security configuration, and troubleshooting tips. These instructions are optimized for Hostinger VPS but can be adapted for other providers.

## Prerequisites

- A VPS with Ubuntu 24.04 installed
- Root or sudo access to the server
- SSH client on your local machine (built-in on Linux/Mac, PuTTY or OpenSSH on Windows)
- Your project files ready for transfer

## 1. Initial VPS Setup for Ubuntu 24.04

### Step 1: Connect to Your VPS via SSH

Open your terminal and connect to your VPS using SSH:

```bash
ssh root@your-vps-ip-address
```

Replace `your-vps-ip-address` with your actual VPS IP address. You'll be prompted for the root password.

### Step 2: Update the System

Update your package lists and upgrade all packages to the latest versions:

```bash
sudo apt update && sudo apt upgrade -y
```

This ensures you have the latest security patches and software versions.

### Step 3: Install Essential Tools

Install basic tools you'll need:

```bash
sudo apt install -y curl wget git vim ufw fail2ban htop
```

- `curl` and `wget`: For downloading files
- `git`: For version control and file transfers
- `vim`: Text editor (you can use `nano` if preferred)
- `ufw`: Firewall management
- `fail2ban`: Intrusion prevention
- `htop`: System monitoring

### Step 4: Create a Non-Root User (Security Best Practice)

Create a new user with sudo privileges:

```bash
adduser deploy
usermod -aG sudo deploy
```

Set a strong password when prompted. Then, switch to the new user:

```bash
su - deploy
```

From now on, use this user instead of root for regular operations.

## 2. Docker Installation and Verification

### Step 1: Install Docker

Install Docker using the official repository:

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

### Step 2: Start and Enable Docker

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

### Step 3: Add User to Docker Group

Allow your user to run Docker commands without sudo:

```bash
sudo usermod -aG docker $USER
```

Log out and back in for the changes to take effect, or run:

```bash
newgrp docker
```

### Step 4: Verify Docker Installation

Test Docker with a hello-world container:

```bash
docker run hello-world
```

You should see a success message. Check Docker version:

```bash
docker --version
docker compose version
```

## 3. File Transfer Methods

### Method 1: SCP (Secure Copy Protocol)

SCP is simple and works over SSH. Use it for single files or small directories.

#### From Local Machine to VPS:

```bash
scp -r /path/to/your/project deploy@your-vps-ip:/home/deploy/
```

- `-r`: Recursive (for directories)
- Replace `/path/to/your/project` with your local project path
- Replace `your-vps-ip` with your VPS IP

#### From VPS to Local Machine:

```bash
scp -r deploy@your-vps-ip:/home/deploy/project /local/destination/
```

### Method 2: SFTP (SSH File Transfer Protocol)

SFTP provides an interactive file transfer experience similar to FTP but over SSH.

#### Connect via SFTP:

```bash
sftp deploy@your-vps-ip
```

#### Common SFTP Commands:

```bash
# Navigate directories
cd /remote/directory
lcd /local/directory

# Upload files
put filename
put -r directory

# Download files
get filename
get -r directory

# List files
ls
lls

# Exit
exit
```

### Method 3: Git Repository

Best for version-controlled projects and collaborative development.

#### On Your VPS:

```bash
# Clone your repository
git clone https://github.com/yourusername/yourrepo.git

# Or if private repository
git clone https://yourusername:yourtoken@github.com/yourusername/yourrepo.git
```

#### Push Local Changes to VPS:

If you want to push directly to a VPS-hosted repository:

```bash
# On VPS, initialize bare repository
mkdir project.git
cd project.git
git init --bare

# On local machine, add VPS as remote
git remote add vps deploy@your-vps-ip:/home/deploy/project.git

# Push to VPS
git push vps main
```

## 4. Security Configuration

### Step 1: Configure Firewall (UFW)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (important - do this first!)
sudo ufw allow ssh

# Allow HTTP and HTTPS for web applications
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status
```

### Step 2: Configure SSH for Better Security

Edit SSH configuration:

```bash
sudo vim /etc/ssh/sshd_config
```

Make these changes:

```
# Disable root login
PermitRootLogin no

# Use SSH protocol 2 only
Protocol 2

# Disable password authentication (use keys instead)
PasswordAuthentication no

# Specify allowed users
AllowUsers deploy
```

Restart SSH service:

```bash
sudo systemctl restart ssh
```

### Step 3: Set Up SSH Key Authentication

On your local machine:

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copy public key to VPS
ssh-copy-id deploy@your-vps-ip
```

Test passwordless login:

```bash
ssh deploy@your-vps-ip
```

### Step 4: Install and Configure Fail2Ban

Fail2Ban protects against brute-force attacks:

```bash
# Enable and start Fail2Ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Check status
sudo fail2ban-client status
```

## 5. Network Setup for Hostinger VPS

### Step 1: Configure Static IP (if needed)

Hostinger typically assigns static IPs, but verify:

```bash
ip addr show
```

If you need to set a static IP, edit netplan configuration:

```bash
sudo vim /etc/netplan/01-netcfg.yaml
```

Example configuration:

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    ens3:
      dhcp4: no
      addresses:
        - your-vps-ip/24
      gateway4: your-gateway-ip
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
```

Apply changes:

```bash
sudo netplan apply
```

### Step 2: DNS Configuration

For Hostinger, DNS is usually managed through their control panel. To point a domain to your VPS:

1. Log into Hostinger control panel
2. Go to DNS settings for your domain
3. Add A record pointing to your VPS IP
4. Wait for DNS propagation (can take up to 24 hours)

### Step 3: Reverse DNS (Optional)

Some services require reverse DNS. Contact Hostinger support to set up reverse DNS for your IP.

## 6. Troubleshooting Common Issues

### Issue 1: Permission Denied When Running Docker Commands

**Solution:** Ensure your user is in the docker group:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Issue 2: SSH Connection Refused

**Possible causes:**
- Wrong IP address or port
- Firewall blocking SSH
- SSH service not running

**Solutions:**

```bash
# Check if SSH is running
sudo systemctl status ssh

# Check firewall rules
sudo ufw status

# Allow SSH through firewall
sudo ufw allow ssh
```

### Issue 3: Docker Containers Can't Access Internet

**Solution:** Check Docker network settings:

```bash
# Restart Docker service
sudo systemctl restart docker

# Check Docker network
docker network ls
```

### Issue 4: Port Already in Use

**Solution:** Find and kill the process using the port:

```bash
# Find process using port 80
sudo lsof -i :80

# Kill the process (replace PID)
sudo kill -9 PID
```

### Issue 5: Out of Memory Errors

**Solution:** Check system resources and increase swap if needed:

```bash
# Check memory usage
htop

# Create swap file (if needed)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Issue 6: File Transfer Fails

**Common solutions:**
- Check file permissions
- Ensure correct paths
- Verify SSH keys are set up correctly
- Check available disk space: `df -h`

### Issue 7: Docker Compose Fails to Start

**Solution:**

```bash
# Check Docker Compose file syntax
docker compose config

# Check logs
docker compose logs

# Clean up and restart
docker compose down
docker compose up -d
```

### Issue 8: Timezone Issues

**Solution:** Set correct timezone:

```bash
# Check current timezone
timedatectl

# Set timezone (example for UTC)
sudo timedatectl set-timezone UTC

# Or for a specific timezone
sudo timedatectl set-timezone America/New_York
```

## Next Steps

After completing the VPS setup:

1. Transfer your project files using one of the methods above
2. Navigate to your project directory
3. Run `docker compose up -d` to start your application
4. Configure any domain names and SSL certificates
5. Set up monitoring and backups

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Ubuntu Server Guide](https://ubuntu.com/server/docs)
- [Hostinger VPS Documentation](https://www.hostinger.com/tutorials/vps)
- [SSH Key Generation Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)

Remember to regularly update your system and monitor logs for security issues. Always backup your data before making significant changes.