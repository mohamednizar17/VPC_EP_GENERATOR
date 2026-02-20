# Docker Setup Guide - AWS VPC Endpoint Generator

## Quick Start (Under 5 Minutes)

### Prerequisites
- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop v1.27+)
- *Optional:* AWS CLI credentials at `~/.aws/credentials` (auto-mounted)

### Running with Docker

```bash
# Navigate to project root
cd Endpoint_generator

# Start all services
docker-compose up --build

# You should see:
# ✅ AWS CLI is already installed
# 🚀 Starting FastAPI server...
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Stop Services
```bash
# Press Ctrl+C in terminal, or:
docker-compose down
```

## What Docker Compose Does

### Backend Service (`vpc-endpoint-backend`)
- **Port**: 8000
- **Docker Image**: Python 3.11-slim with AWS CLI pre-installed
- **Startup Sequence**:
  1. ✅ Checks AWS CLI installation → displays version if available
  2. 📋 Shows AWS CLI version information
  3. 🚀 Starts FastAPI server on port 8000
  4. 🏥 Enables health checks (5 retries × 10s intervals)
- **AWS Integration**: Mounts `~/.aws/` (read-only) for credential access
- **Features**:
  - Auto-installs AWS CLI v2 in Docker image (no manual setup)
  - Health checks verify both AWS CLI and FastAPI
  - Detailed startup logging with emojis for clarity
- **Health Check**: Verifies both AWS CLI (via healthcheck.sh) and FastAPI responsiveness
- **Volume**: 
  - `/app` synced for live Python reloading
  - `~/.aws:/root/.aws:ro` (read-only AWS credentials mount)

### Frontend Service (`vpc-endpoint-frontend`)
- **Port**: 5173
- **Image**: Node 18 Alpine
- **Startup Process**:
  1. Install dependencies from `package.json`
  2. Start Vite dev server with HMR
  3. Automatically points to backend at `http://backend:8000`
- **Volume**: Code synced for live reload
- **Dependency**: Waits for backend health check before starting
- **Environment**: `VITE_API_URL=http://backend:8000` automatically set

### Network Architecture
```
Frontend (React) ←→ Backend (FastAPI) ←→ AWS Services
   :5173              :8000
    └─────────────────┴─── vpc-endpoint-network
```

## AWS CLI Authentication

### Option 1: Mount Local AWS Credentials (Recommended)
```bash
# Create credentials file (if needed)
~/.aws/credentials

# Format:
[default]
aws_access_key_id = AKIA...
aws_secret_access_key = wJalr...
aws_default_region = ap-southeast-1
```

The docker-compose.yaml automatically mounts this as read-only.

**Verify in container:**
```bash
docker-compose exec backend aws sts get-caller-identity
# Returns: Account ID, User ARN, etc.
```

### Option 2: Environment Variables
```bash
docker-compose up \
  -e AWS_ACCESS_KEY_ID=AKIA... \
  -e AWS_SECRET_ACCESS_KEY=wJalr... \
  -e AWS_DEFAULT_REGION=ap-southeast-1
```

### Option 3: Configure Inside Container
```bash
docker-compose up -d
docker-compose exec backend bash
aws configure
# Interactive setup
```

## Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend

# Last 50 lines
docker-compose logs --tail=50
```

### Check Service Status
```bash
docker-compose ps
# Shows: State, Health status, Port mappings
```

### Execute Commands Inside Container
```bash
# Bash in backend
docker-compose exec backend bash

# Run AWS CLI command
docker-compose exec backend aws ec2 describe-regions

# Check Python version
docker-compose exec backend python --version
```

### Rebuild Services
```bash
# Rebuild with no cache
docker-compose build --no-cache

# Rebuild specific service
docker-compose build --no-cache backend

# Rebuild and restart
docker-compose up -d --build
```

### View Service Details
```bash
# Inspect backend service
docker-compose exec backend cat /etc/os-release

# Check installed packages
docker-compose exec backend pip list
```

## Troubleshooting

### "AWS CLI not found" or "AWS not installed"

**Symptom**: Docker startup shows "AWS CLI is not installed" message

**Solution**:
```bash
# Rebuild backend image from scratch
docker-compose build --no-cache backend

# Remove old images
docker system prune -a

# Start fresh
docker-compose up --build
```

The Dockerfile includes AWS CLI v2 in the base image, so rebuild should fix it.

### Port Already in Use

**Windows PowerShell**:
```bash
# Find and kill process using port 8000
$port = 8000
(Get-NetTCPConnection -LocalPort $port).OwningProcess | Stop-Process -Force

# Or change port in docker-compose.yaml
```

**Linux/Mac**:
```bash
lsof -ti:8000 | xargs kill -9
# or change port mapping in docker-compose.yaml
```

### Backend Health Check Failing

**Check logs**:
```bash
docker-compose logs backend

# Look for:
# - AWS CLI initialization
# - FastAPI startup
# - Any Python errors
```

**Manual health check**:
```bash
docker-compose exec backend curl http://localhost:8000/health

# Should return JSON response (once /health endpoint is added)
```

### Frontend Can't Connect to Backend

**Verify container networking**:
```bash
docker-compose exec frontend curl http://backend:8000/docs

# Should return HTML page
# If fails, check docker-compose.yaml network configuration
```

**Reset Docker networking**:
```bash
docker-compose down
docker network prune
docker-compose up --build
```

### AWS Credentials Not Working

**Check credentials are mounted**:
```bash
docker-compose exec backend ls -la /root/.aws/

# Should show: credentials, config (if exists)
```

**Verify AWS CLI can access them**:
```bash
docker-compose exec backend aws sts get-caller-identity

# If fails: credentials may be invalid or expired
```

**Check permissions**:
```bash
# Credentials file should have restrictive permissions (600)
chmod 600 ~/.aws/credentials
```

### Clear All Docker Data

```bash
# Stop all services
docker-compose down

# Remove volumes (data)
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a --volumes

# If needed, manually remove images
docker rmi -f $(docker images -q)
```

## Development Tips

### Live Reload
Both services watch code for changes:
- **Backend**: Modify Python files → FastAPI auto-reloads (if configured)
- **Frontend**: Modify React/CSS → Vite HMR refreshes instantly

### Debug Backend
```bash
# Start in debug mode
docker-compose up backend

# In another terminal, run debugger if available
docker-compose exec backend python -m ipdb -c continue main.py
```

### Test Services Individually
```bash
# Test backend only
docker-compose up backend

# Test frontend only (doesn't work great without backend, but can verify build)
docker-compose up frontend
```

### Inspect Docker Images
```bash
# List all images
docker images

# Inspect specific image
docker inspect vpc-endpoint-backend

# View Dockerfile (from image)
docker history vpc-endpoint-backend
```

## Production Deployment

For production use, create `docker-compose.prod.yaml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    restart: always
    ports:
      - "8000:8000"
    environment:
      DEBUG: "false"
      PYTHONUNBUFFERED: "1"
    volumes:
      - ~/.aws:/root/.aws:ro
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

  frontend:
    build: ./frontend
    restart: always
    ports:
      - "80:5173"
    environment:
      VITE_API_URL: http://backend:8000
    depends_on:
      backend:
        condition: service_healthy
```

Deploy with:
```bash
docker-compose -f docker-compose.prod.yaml up -d
```

## References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [FastAPI Deployment with Docker](https://fastapi.tiangolo.com/deployment/docker/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-modes.html)
- [AWS CLI in Docker](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-docker.html)
