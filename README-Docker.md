# AfyaConnect Docker Deployment Guide

This guide explains how to deploy the AfyaConnect application using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM available
- 10GB free disk space

## Quick Start

1. **Clone the repository and navigate to the project directory**
   ```bash
   git clone <repository-url>
   cd afyaconnect-full-backup
   ```

2. **Create environment file**
   ```bash
   cp .env.production .env
   # Edit .env with your actual configuration values
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: https://localhost
   - API: https://localhost/api
   - Health check: https://localhost/health

## Architecture

The application consists of four main services:

- **db**: PostgreSQL database with persistent storage
- **backend**: Node.js/Express API server
- **frontend**: React/Vite application served by Nginx
- **nginx**: Reverse proxy with SSL termination

## Configuration

### Environment Variables

Copy `.env.production` to `.env` and configure the following key variables:

```bash
# Database
DB_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-jwt-secret

# Google AI (optional)
GOOGLE_AI_API_KEY=your-api-key
```

### SSL Certificates

For production, replace the self-signed certificates:

1. Place your SSL certificate at `nginx/ssl/cert.crt`
2. Place your private key at `nginx/ssl/private.key`
3. Update the nginx configuration to use the new certificates

## Development

For development with hot reloading:

```bash
docker-compose -f docker-compose.yml -f docker-compose.override.yml up
```

## Production Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Update deployment
docker-compose pull && docker-compose up -d
```

### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml afyaconnect

# Check services
docker service ls
```

### Using Kubernetes

The Docker Compose file can be converted to Kubernetes manifests using `kompose`:

```bash
kompose convert -f docker-compose.yml
```

## Database Management

### Backup

```bash
# Create backup
docker exec afyaconnect-db pg_dump -U afyaconnect_user afyaconnect > backup.sql

# Restore backup
docker exec -i afyaconnect-db psql -U afyaconnect_user afyaconnect < backup.sql
```

### Database Migration

When updating the database schema:

1. Update `init-db.sql` with new schema changes
2. Restart the database service:
   ```bash
   docker-compose restart db
   ```

## Monitoring and Troubleshooting

### Health Checks

All services include health checks. Monitor service health:

```bash
docker-compose ps
docker stats
```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Common Issues

1. **Port conflicts**: Ensure ports 80 and 443 are available
2. **Database connection**: Check database credentials in `.env`
3. **SSL errors**: Verify certificate paths and permissions
4. **Memory issues**: Increase Docker memory limit to 4GB+

### Debugging

```bash
# Enter container
docker exec -it afyaconnect-backend sh

# Check environment variables
docker exec afyaconnect-backend env

# Test database connection
docker exec afyaconnect-db psql -U afyaconnect_user -d afyaconnect -c "SELECT version();"
```

## Security Considerations

- Change all default passwords
- Use strong JWT secrets
- Enable SSL/TLS in production
- Regularly update base images
- Implement proper firewall rules
- Use secrets management for sensitive data

## Performance Optimization

- Use Docker volumes for persistent data
- Configure resource limits in docker-compose.yml
- Enable gzip compression in nginx
- Implement caching strategies
- Monitor resource usage

## Backup and Recovery

- Regular database backups
- Backup environment files securely
- Test recovery procedures
- Document backup schedules

## Support

For issues or questions:
- Check the logs: `docker-compose logs`
- Verify configuration files
- Ensure all prerequisites are met
- Check Docker and Docker Compose versions