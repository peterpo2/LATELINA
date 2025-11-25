# 🚀 AIPharm+ Deployment Guide

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker Desktop installed
- Docker Compose v2.0+
- 4GB+ RAM available
- 10GB+ disk space

### Quick Deployment
```bash
# Clone repository
git clone https://github.com/yourusername/aipharm-plus.git
cd aipharm-plus

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### Production Configuration
Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  database:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=${SA_PASSWORD}
    volumes:
      - sqlserver_data:/var/opt/mssql
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=${CONNECTION_STRING}
      - Jwt__Key=${JWT_KEY}
    depends_on:
      - database
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
      args:
        - VITE_API_BASE_URL=${API_BASE_URL}
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  sqlserver_data:
```

### Environment Variables
Create `.env.prod`:
```bash
# Database
SA_PASSWORD=YourStrongPassword123!
CONNECTION_STRING=Server=database,1433;Database=AIPharm;User Id=sa;Password=YourStrongPassword123!;TrustServerCertificate=true

# JWT
JWT_KEY=YourSuperSecretJWTKeyForProduction2025VeryLongAndSecure

# API
API_BASE_URL=https://your-domain.com/api

# SSL (if using HTTPS)
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

### Deploy to Production
```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3 --scale frontend=2
```

## ☁️ Cloud Deployment

### Azure Deployment

#### Azure Container Instances
```bash
# Create resource group
az group create --name aipharm-rg --location eastus

# Create container group
az container create \
  --resource-group aipharm-rg \
  --name aipharm-app \
  --image yourusername/aipharm-plus:latest \
  --dns-name-label aipharm-plus \
  --ports 80 443 \
  --environment-variables \
    ASPNETCORE_ENVIRONMENT=Production \
    ConnectionStrings__DefaultConnection="Server=your-sql-server.database.windows.net;Database=AIPharm;User Id=your-user;Password=your-password;"
```

#### Azure App Service
```bash
# Create App Service plan
az appservice plan create \
  --name aipharm-plan \
  --resource-group aipharm-rg \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --resource-group aipharm-rg \
  --plan aipharm-plan \
  --name aipharm-plus \
  --deployment-container-image-name yourusername/aipharm-plus:latest
```

### AWS Deployment

#### ECS with Fargate
```yaml
# task-definition.json
{
  "family": "aipharm-plus",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "aipharm-backend",
      "image": "yourusername/aipharm-backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "ASPNETCORE_ENVIRONMENT",
          "value": "Production"
        }
      ]
    }
  ]
}
```

#### Deploy to ECS
```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster aipharm-cluster \
  --service-name aipharm-service \
  --task-definition aipharm-plus:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

### Google Cloud Platform

#### Cloud Run
```bash
# Build and push to Container Registry
docker build -t gcr.io/your-project/aipharm-plus .
docker push gcr.io/your-project/aipharm-plus

# Deploy to Cloud Run
gcloud run deploy aipharm-plus \
  --image gcr.io/your-project/aipharm-plus \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars ASPNETCORE_ENVIRONMENT=Production
```

## 🔧 Manual Deployment

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- SQL Server
- IIS or Nginx

### Backend Deployment
```bash
# Build for production
cd AIPharm.Backend
dotnet publish AIPharm.Web/AIPharm.Web.csproj -c Release -o ./publish

# Copy to server
scp -r ./publish user@server:/var/www/aipharm-api/

# Configure systemd service (Linux)
sudo nano /etc/systemd/system/aipharm-api.service
```

#### Systemd Service Configuration
```ini
[Unit]
Description=AIPharm+ API
After=network.target

[Service]
Type=notify
ExecStart=/usr/bin/dotnet /var/www/aipharm-api/AIPharm.Web.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=aipharm-api
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Copy to web server
scp -r ./dist user@server:/var/www/aipharm-web/
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/aipharm-web;
    index index.html;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

## 🔒 SSL/HTTPS Configuration

### Let's Encrypt with Certbot
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Docker with SSL
```yaml
# docker-compose.ssl.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl:ro
      - certbot-etc:/etc/letsencrypt
      - certbot-var:/var/lib/letsencrypt
    depends_on:
      - frontend
      - backend

  certbot:
    image: certbot/certbot
    volumes:
      - certbot-etc:/etc/letsencrypt
      - certbot-var:/var/lib/letsencrypt
      - ./web-root:/var/www/html
    command: certonly --webroot --webroot-path=/var/www/html --email your-email@domain.com --agree-tos --no-eff-email -d your-domain.com

volumes:
  certbot-etc:
  certbot-var:
```

## 📊 Monitoring & Logging

### Health Checks
```bash
# Check application health
curl -f http://localhost:5000/api/health

# Docker health check
docker-compose ps
```

### Logging Configuration
```json
{
  "Serilog": {
    "Using": ["Serilog.Sinks.Console", "Serilog.Sinks.File"],
    "MinimumLevel": "Information",
    "WriteTo": [
      { "Name": "Console" },
      {
        "Name": "File",
        "Args": {
          "path": "/var/log/aipharm/log-.txt",
          "rollingInterval": "Day"
        }
      }
    ]
  }
}
```

### Application Insights (Azure)
```json
{
  "ApplicationInsights": {
    "InstrumentationKey": "your-instrumentation-key"
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Build and push Docker images
      run: |
        docker build -t ${{ secrets.REGISTRY }}/aipharm-backend:${{ github.sha }} -f Dockerfile.backend .
        docker build -t ${{ secrets.REGISTRY }}/aipharm-frontend:${{ github.sha }} -f Dockerfile.frontend .
        docker push ${{ secrets.REGISTRY }}/aipharm-backend:${{ github.sha }}
        docker push ${{ secrets.REGISTRY }}/aipharm-frontend:${{ github.sha }}
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        script: |
          cd /opt/aipharm
          docker-compose pull
          docker-compose up -d
```

## 🛡️ Security Considerations

### Production Security Checklist
- [ ] Use strong passwords for database
- [ ] Configure firewall rules
- [ ] Enable HTTPS/SSL
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Backup strategy in place
- [ ] Monitor for vulnerabilities

### Database Security
```sql
-- Create dedicated database user
CREATE LOGIN aipharm_user WITH PASSWORD = 'StrongPassword123!';
CREATE USER aipharm_user FOR LOGIN aipharm_user;
ALTER ROLE db_datareader ADD MEMBER aipharm_user;
ALTER ROLE db_datawriter ADD MEMBER aipharm_user;
```

## 📋 Maintenance

### Regular Tasks
```bash
# Update Docker images
docker-compose pull
docker-compose up -d

# Database backup
docker exec aipharm-database /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P $SA_PASSWORD \
  -Q "BACKUP DATABASE AIPharm TO DISK = '/var/opt/mssql/backup/AIPharm.bak'"

# Clean up old images
docker system prune -a

# Monitor disk usage
df -h
docker system df
```

### Performance Optimization
```bash
# Enable gzip compression
# Configure caching headers
# Optimize database queries
# Use CDN for static assets
# Enable HTTP/2
```

## 🆘 Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database

# Check resource usage
docker stats
```

#### Database Connection Issues
```bash
# Test database connection
docker exec -it aipharm-database /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $SA_PASSWORD

# Check network connectivity
docker network ls
docker network inspect aipharm-network
```

#### Performance Issues
```bash
# Monitor resource usage
htop
docker stats

# Check application logs
tail -f /var/log/aipharm/log-*.txt
```

### Recovery Procedures
```bash
# Restore from backup
docker exec -it aipharm-database /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P $SA_PASSWORD \
  -Q "RESTORE DATABASE AIPharm FROM DISK = '/var/opt/mssql/backup/AIPharm.bak'"

# Rollback deployment
docker-compose down
git checkout previous-version
docker-compose up -d
```