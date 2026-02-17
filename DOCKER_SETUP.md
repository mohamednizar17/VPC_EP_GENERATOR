# Docker Setup Guide

## Quick Start

### Prerequisites
- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

### Running with Docker Compose

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Endpoint_generator
   ```

2. **Start all services**
   ```bash
   docker compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

4. **View logs**
   ```bash
   # All services
   docker compose logs -f

   # Specific service
   docker compose logs -f backend
   docker compose logs -f frontend
   ```

5. **Stop all services**
   ```bash
   docker compose down
   ```

## What Docker Compose Does

### Backend Service (`vpc-endpoint-backend`)
- **Port**: 8000
- **Process**:
  1. Creates Python 3.11 environment
  2. Creates virtual environment
  3. Installs requirements from `requirements.txt`
  4. Runs `python main.py`
- **Health Check**: Monitors `/health` endpoint
- **Volume**: Code synced for live development

### Frontend Service (`vpc-endpoint-frontend`)
- **Port**: 5173
- **Process**:
  1. Node 18 Alpine image
  2. Runs `npm install`
  3. Runs `npm run dev -- --host`
- **Volume**: Code synced, node_modules persisted
- **Depends On**: Waits for backend health check before starting

## Advanced Usage

### Rebuild Images
```bash
# Rebuild all images
docker compose build --no-cache

# Rebuild specific service
docker compose build --no-cache backend
docker compose build --no-cache frontend
```

### Execute Commands in Container
```bash
# Run bash in backend
docker compose exec backend bash

# Run command in frontend
docker compose exec frontend npm list
```

### Environment Variables
Create a `.env` file in the root directory:
```
VITE_API_URL=http://localhost:8000
PYTHON_ENV=development
```

### Volumes and Persistence
- Backend: `/app` synced for live Python reloading
- Frontend: `/app` synced, `node_modules` persisted separately

## Troubleshooting

### Port Already in Use
```bash
# Change ports in docker-compose.yaml
# Or kill existing process on the port

# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process

# Linux/Mac
lsof -ti:5173 | xargs kill -9
```

### Services Won't Start
```bash
# Check logs for errors
docker compose logs

# Rebuild from scratch
docker compose down
docker compose up -d --build
```

### Frontend/Backend Not Communicating
- Ensure backend is healthy: `docker compose logs backend`
- Check if frontend can resolve backend URL
- Verify CORS is enabled in FastAPI backend
- Check vite.config.js proxy configuration

### Clear Everything
```bash
# Remove all containers, networks, volumes
docker compose down -v

# Remove images too
docker compose down -v --rmi all
```

## Development Tips

### Live Reload
Both services have code volume syncing enabled for live development:
- Modify Python files → Backend reloads automatically
- Modify React/CSS files → Frontend HMR refreshes

### Database/Data Persistence
If you add a database later, add it as a new service in `docker-compose.yaml`:
```yaml
  database:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - vpc-endpoint-network

volumes:
  postgres_data:
```

## Production Deployment

For production, consider:
1. Using multi-stage builds to reduce image size
2. Using production-grade servers (Gunicorn for backend, Nginx for frontend)
3. Setting environment variables via environment files
4. Using Docker secrets for sensitive data
5. Implementing proper logging and monitoring

## Documentation

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Docker Guide](https://fastapi.tiangolo.com/deployment/docker/)
- [Vite Docker Guide](https://vitejs.dev/guide/)
