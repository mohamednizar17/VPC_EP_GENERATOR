# AWS VPC Endpoint Generator

A modern web application for generating and executing PowerShell scripts to create AWS VPC endpoints. Supports both **Interface (60+ services)** and **Gateway endpoints** with full customization.

Built with **React + Vite** (frontend) and **FastAPI** (backend), fully containerized with Docker.

---

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose** (recommended)
- OR: Python 3.11+, Node.js 16+, AWS CLI v2

### Docker Setup (2 minutes)
```bash
git clone https://github.com/mohamednizar17/VPC_EP_GENERATOR.git
cd VPC_EP_GENERATOR
docker compose up -d
```

Access the app:
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs

That's it! Docker includes:
- ✅ AWS CLI v2 pre-installed
- ✅ AWS credentials auto-mounted
- ✅ Health checks for reliability
- ✅ Live code reloading

---

## 📁 Project Structure

```
VPC_EP_GENERATOR/
├── frontend/                    # React + Vite + Tailwind
│   ├── src/components/
│   │   ├── ConfigureForm.jsx       # AWS credentials
│   │   ├── EndpointSelector.jsx    # 60+ service selection
│   │   ├── ParameterForm.jsx       # VPC/Subnet/SG config
│   │   └── ReviewPage.jsx          # Script generation & execute
│   ├── vite.config.js           # API proxy configuration
│   └── Dockerfile
│
├── backend/                     # FastAPI + Python 3.11
│   ├── main.py                  # FastAPI app
│   ├── routes/endpoints.py      # API endpoints
│   ├── services/                # Business logic
│   ├── utils/                   # Validation & helpers
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yaml          # Docker orchestration
├── DOCKER_SETUP.md             # Troubleshooting guide
└── README.md                    # This file
```

---

## ✨ Features

### 🔧 Multi-Service Support (60+ Services)
- **Interface Endpoints**: Compute, Storage, Database, Messaging, Analytics, Security, ML, IoT, Media, and more
- **Gateway Endpoints**: S3, DynamoDB
- Real-time search & filtering
- Multi-select to create multiple endpoints at once

### ⚙️ Flexible Configuration
- VPC ID validation (AWS format)
- Regional service selection
- **Interface**: Subnet & Security Group selection, Private DNS toggle
- **Gateway**: Route table configuration & "select all" option
- **Optional tags**: Custom prefix/suffix for endpoint naming

### 📝 Script Generation & Execution
- Generates optimized PowerShell scripts
- AWS CLI command preview
- Download for review or execute directly
- Per-service error handling & status messages

### 🐳 Docker Integration
- AWS CLI v2 pre-installed
- AWS credentials auto-mounted
- Health checks verify both services
- Cross-platform support (Windows, Mac, Linux)

---

## 📖 Usage Workflow

1. **Configure AWS Credentials**
   - Enter Access Key, Secret Key, Region
   
2. **Select Endpoint Type & Services**
   - Choose Interface or Gateway
   - Select from 60+ services
   
3. **Configure Parameters**
   - Enter VPC ID
   - Select subnets/route tables/security groups
   - Optional: Add custom tags (prefix/suffix)
   
4. **Review & Execute**
   - Review all AWS CLI commands
   - Download .ps1 file or execute immediately

---

## 🔌 API Endpoints

### POST `/api/configure`
Configure AWS credentials
```json
{
  "access_key": "AKIA...",
  "secret_key": "wJalrXUtnFEMI/K7...",
  "region": "ap-southeast-1",
  "output_format": "json"
}
```

### POST `/api/generate`
Generate PowerShell script
```json
{
  "endpoint_type": "Interface",
  "region": "ap-southeast-1",
  "vpc_id": "vpc-12345678",
  "service_names": ["ec2", "rds", "lambda"],
  "subnets": ["subnet-12345678"],
  "security_groups": ["sg-12345678"],
  "private_dns_enabled": true,
  "tag_prefix": "myapp",
  "tag_suffix": "-vpc-ep"
}
```

### POST `/api/execute`
Execute PowerShell script
```json
{
  "ps1_content": "# PowerShell script content..."
}
```

---

## 🛠️ Troubleshooting

### Frontend can't connect to backend?
```bash
docker compose logs backend
docker compose down && docker compose up -d
```

### AWS credentials not working?
```bash
# Verify credentials exist
ls ~/.aws/credentials

# Test AWS CLI in container
docker compose exec backend aws sts get-caller-identity
```

### Ports already in use?
```powershell
# Windows - Kill process on port
(Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
(Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

### Complete rebuild?
```bash
docker compose down -v
docker system prune -a
docker compose up --build
```

For more help, see [DOCKER_SETUP.md](DOCKER_SETUP.md)

---

## 🔐 Security

✅ **Best Practices**:
- AWS credentials auto-mounted (read-write for CLI config)
- Input validation & sanitization
- Command injection prevention
- No credentials in code/env vars

⚠️ **Important**:
- Review scripts before execution
- Use least privilege IAM permissions
- Don't log credentials or tokens
- Test in dev environment first

---

## 📚 Documentation

- **[DOCKER_SETUP.md](DOCKER_SETUP.md)** - Detailed Docker guide & troubleshooting (60+ scenarios)
- **[artifact.md](artifact.md)** - Complete technical specification
- **[SESSION_SUMMARY.md](SESSION_SUMMARY.md)** - Latest updates

---

## 💡 Development

### Manual Setup (Alternative)

**Backend**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

### View Logs
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

### Rebuild After Changes
```bash
docker compose restart backend frontend
# OR full rebuild:
docker compose down && docker compose up --build
```

---

## 📦 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: FastAPI, Python 3.11, Pydantic
- **Infrastructure**: Docker, Docker Compose
- **AWS**: AWS CLI v2, Boto3
- **Scripting**: PowerShell 7+

---

## 📝 License & Info

Created by Mohamed Nizar  
Repository: https://github.com/mohamednizar17/VPC_EP_GENERATOR

---

## ❓ Getting Help

1. Check [DOCKER_SETUP.md](DOCKER_SETUP.md) for common issues
2. View logs: `docker compose logs`
3. Check browser console (F12) for errors
4. Open an issue on GitHub

**Version**: 2.0 | **Status**: Production Ready | **Last Updated**: February 2026
