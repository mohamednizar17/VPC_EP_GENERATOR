# AWS VPC Endpoint Generator

A web application for generating and executing PowerShell scripts to create AWS VPC endpoints. Supports both Interface (60+ services) and Gateway endpoint types with full customization, validation, and multi-service selection. Built with React + FastAPI and containerized with Docker.

## Quick Start (Docker)

```bash
# Start the application with Docker Compose
docker-compose up --build

# Open in browser
# Frontend: http://localhost:5173
# API Docs: http://localhost:8000/docs
```

For detailed Docker setup and troubleshooting, see [DOCKER_SETUP.md](DOCKER_SETUP.md).

## Project Structure

```
Endpoint_generator/
├── frontend/                 # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── EndpointSelector.jsx      # 60+ service selection
│   │   │   ├── ParameterForm.jsx         # Conditional parameter fields
│   │   │   ├── ReviewPage.jsx            # Preview & confirmation
│   │   │   └── ...
│   │   ├── App.jsx          # Multi-step form flow
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Tailwind styles
│   ├── package.json         # Frontend dependencies (React 18, Tailwind, etc.)
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind configuration
│   ├── Dockerfile           # Node.js container
│   └── postcss.config.js   # PostCSS configuration
│
├── backend/                  # FastAPI + Python 3.11
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration settings
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile           # Python 3.11 with AWS CLI v2
│   ├── healthcheck.sh       # Container health verification
│   ├── routes/
│   │   └── endpoints.py     # Multi-service API endpoints
│   ├── services/
│   │   ├── aws_service.py   # AWS operations
│   │   └── script_generator.py # PowerShell script generation (multi-service)
│   └── utils/
│       ├── validators.py    # Input validation
│       └── powershell_executor.py # PowerShell execution
│
├── docker-compose.yaml      # Docker Compose orchestration with AWS CLI checks
├── artifact.md              # Detailed specification (v2.0 with Docker & multi-service)
├── DOCKER_SETUP.md         # Comprehensive Docker guide
├── SESSION_SUMMARY.md      # Latest session updates
├── Create-InterfaceEndpoints.ps1  # Legacy PowerShell script
└── README.md               # This file
```

## Features

### 1. Multi-Service Selection (60+ Services)
- **Interface Endpoints** (organized in 14 AWS categories):
  - Compute: EC2, Lambda, Batch, App Runner, Lightsail, etc.
  - Storage & CDN: S3, EBS, CloudFront, Glacier, EFS, etc.
  - Database: RDS, DynamoDB, ElastiCache, Neptune, Redshift, etc.
  - Messaging & Streaming: SNS, SQS, Kinesis, MQ, EventBridge, etc.
  - Analytics: Athena, EMR, Redshift Spectrum, Glue, DataPipeline, etc.
  - Security: IAM, IAM Identity Center, KMS, Secrets Manager, Config, etc.
  - Management & Governance: CloudFormation, Systems Manager, CloudTrail, etc.
  - Developer Tools: CodeBuild, CodeDeploy, CodePipeline, CodeCommit, etc.
  - Integration & Orchestration: SNS, SQS, Step Functions, MWAA, Managed Workflows, etc.
  - Machine Learning: SageMaker, Comprehend, Rekognition, Textract, Polly, etc.
  - IoT & Edge: IoT Core, IoT Actions, Greengrass, FreeRTOS, etc.
  - Media Services: Kinesis Video, Elemental MediaConvert, MediaLive, MediaPackage, etc.
  - Migration & Disaster Recovery: DataSync, DataExchange, Snowball, DMS, etc.
  - Network & Content Delivery: CloudFront, Route 53, Global Accelerator, VPC Peering, etc.
- **Gateway Endpoints**: S3, DynamoDB
- **Real-time Search**: Filter services by name across all 60+ options
- **Collapsible Categories**: Organize and discover services easily
- **Multi-Select**: Create multiple endpoints simultaneously with shared configuration

### 2. Flexible Parameter Configuration
- VPC ID validation
- Regional service selection
- **Interface-Specific**: Subnet and Security Group selection, Private DNS toggle
- **Gateway-Specific**: Route table configuration, select all option
- **Optional Tags**: Custom prefix/suffix (intelligent tag name generation without malformed names)

### 3. Script Generation & Execution
- Generates optimized PowerShell scripts (one command per selected service)
- AWS CLI command preview
- Error handling and logging (per-service try-catch blocks)
- Download for later use or immediate execution
- Individual status messages for each endpoint creation

### 4. Docker Integration
- Pre-installed AWS CLI v2 (no manual setup)
- AWS credential mounting from local `~/.aws/` (read-only)
- Health checks verify both AWS CLI and FastAPI
- Live code reloading for development
- Cross-platform compatibility (Windows, Mac, Linux)

## Prerequisites

### Option A: Docker (Recommended - No Manual Setup)
- Docker Desktop (v20.10+)
- Docker Compose (v1.27+, included with Docker Desktop)
- *Optional*: Local AWS credentials at `~/.aws/credentials`

### Option B: Manual Setup (Linux/Mac Development)
- Python 3.11+
- Node.js 16+
- AWS CLI v2
- PowerShell 7+ (for script execution)

## Installation & Setup

### Quick Start with Docker (Recommended)

```bash
# Navigate to project directory
cd Endpoint_generator

# Start with Docker Compose
docker-compose up --build

# Watch for AWS CLI verification
# Expected: ✅ AWS CLI is already installed
```

**Access the application**:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

For detailed Docker setup, troubleshooting, and AWS credential configuration, see [DOCKER_SETUP.md](DOCKER_SETUP.md).

### Manual Setup (Alternative - Development Only)

**Backend**:
```bash
cd backend
python -m venv venv

# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

pip install -r requirements.txt
python main.py  # Runs at http://127.0.0.1:8000
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev  # Runs at http://localhost:5173
```

## Usage

### Typical Workflow
1. Open http://localhost:5173
2. Step 1: Select endpoint type (Interface or Gateway)
3. Step 2: Select services
   - **Interface**: Search & select from 60+ services in 14 categories
   - **Gateway**: Choose S3, DynamoDB, or both
4. Step 3: Configure VPC ID, region, subnets/route tables, optional tags
5. Step 4: Review all selected endpoints and AWS CLI commands
6. Step 5: Download .ps1 script or execute directly

### Example: Multi-Service Endpoints
Select EC2, RDS, Lambda (3 endpoints) → VPC ID: vpc-12345678 → Region: ap-southeast-1 → Subnets & SGs → Tags (prefix: toma-io, suffix: -ep) → Generates 3 separate PowerShell commands with tags: toma-io-ec2-ep, toma-io-rds-ep, toma-io-lambda-ep

## API Endpoints

### POST `/api/endpoints/generate`
Generate PowerShell script for multiple services
```json
{
  "service_names": ["ec2", "rds", "lambda"],
  "vpc_id": "vpc-12345678",
  "region": "ap-southeast-1",
  "vpc_endpoint_type": "Interface",
  "subnets": ["subnet-12345678", "subnet-87654321"],
  "security_groups": ["sg-12345678"],
  "private_dns_enabled": true,
  "tag_prefix": "toma-io",
  "tag_suffix": "-ep"
}
```

**Response**:
```json
{
  "services": ["ec2", "rds", "lambda"],
  "ps1_content": "# PowerShell script with 3 endpoint commands...",
  "commands": [
    "aws ec2 create-vpc-endpoint --vpc-id vpc-12345678 --service-name com.amazonaws.ap-southeast-1.ec2 ...",
    "aws ec2 create-vpc-endpoint --vpc-id vpc-12345678 --service-name com.amazonaws.ap-southeast-1.rds ...",
    "aws ec2 create-vpc-endpoint --vpc-id vpc-12345678 --service-name com.amazonaws.ap-southeast-1.lambda ..."
  ]
}
```

### Backward Compatibility
The API also supports single-service requests using `service_name` (string) instead of `service_names` (array) for backward compatibility.

## Input Validation

### Supported Resource IDs (AWS Format)
- **VPC ID**: `vpc-[17 hex chars]` - Regex: `^vpc-[0-9a-f]{17}$`
- **Subnet ID**: `subnet-[17 hex chars]` - Regex: `^subnet-[0-9a-f]{17}$`
- **Security Group ID**: `sg-[17 hex chars]` - Regex: `^sg-[0-9a-f]{17}$`
- **Route Table ID**: `rtb-[17 hex chars]` - Regex: `^rtb-[0-9a-f]{17}$`

### Tag Components
- **Tag Prefix** (optional): Alphanumeric and hyphens only
- **Tag Suffix** (optional): Alphanumeric and hyphens only
- **Final Tag**: Intelligently combines prefix-service-suffix without malformed names

### AWS Validation
- Region: Valid AWS region code (e.g., ap-southeast-1, us-east-1, eu-west-1)
- Service: Valid service ARN for selected endpoint type
- VPC/Subnets/SG/RT: Existence verified against AWS (if credentials available)

## Security Considerations

✅ **Best Practices Implemented**:
- Credentials mounted as read-only in Docker (`~/.aws:/root/.aws:ro`)
- No credential storage in application code or environment
- Input sanitization and validation on backend
- AWS CLI command injection prevention
- Health checks verify service availability
- HTTPS recommended for production

❌ **Things to Avoid**:
- Storing credentials in .env files or code
- Running PowerShell scripts without reviewing them first
- Using IAM users with excessive permissions (follow least privilege)
- Logging sensitive data (AWS credentials, tokens, etc.)

## Troubleshooting

### Docker Issues

**"AWS CLI not found" during startup**:
```bash
docker-compose build --no-cache backend
docker-compose up
```

**Port already in use**:
```bash
# Change ports in docker-compose.yaml or kill existing process
# Windows PowerShell
(Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
```

**Services won't communicate**:
```bash
docker-compose down -v
docker network prune
docker-compose up --build
```

See [DOCKER_SETUP.md](DOCKER_SETUP.md) for 60+ detailed troubleshooting scenarios.

### Application Issues

**Frontend can't connect to backend**:
- Verify backend health: `docker-compose logs backend`
- Check container network: `docker network inspect vpc-endpoint-network`
- Verify API URL in frontend: Should be `http://backend:8000`

**AWS CLI credentials not working**:
- Verify credentials file exists: `ls ~/.aws/credentials`
- Check mounted path in container: `docker-compose exec backend ls -la /root/.aws/`
- Test connectivity: `docker-compose exec backend aws sts get-caller-identity`

**PowerShell script execution fails**:
- Check IAM permissions: User needs `ec2:CreateVpcEndpoint` and `ec2:CreateTags`
- Verify VPC/Subnet/SG exist in AWS
- Review AWS error messages in script output
- Check region matches VPC location

### Development Tips

**View detailed logs**:
```bash
docker-compose logs -f backend     # Backend logs
docker-compose logs -f frontend    # Frontend logs
docker-compose logs                # All logs
```

**Rebuild after code changes**:
```bash
docker-compose down
docker-compose up --build
```

**Direct container access**:
```bash
docker-compose exec backend bash     # Bash in backend
docker-compose exec backend python   # Python REPL
docker-compose exec frontend bash    # Node container
```

## Development

### Architecture
- **Frontend**: Single-page React app with multi-step form
  - Component-based architecture
  - Client-side validation for better UX
  - Vite dev server with HMR for live reload
  - Tailwind CSS for responsive design

- **Backend**: FastAPI REST API
  - Async request handling
  - Pydantic models for request/response validation
  - Auto-generated API documentation at `/docs`
  - Multi-service endpoint generation with shared configuration

- **Containerization**: Docker + Docker Compose
  - Services isolated in containers
  - AWS CLI pre-installed in backend
  - Volume mounts for code synchronization
  - Health checks for service reliability

### Adding New Services
To add a service to the 60+ available endpoints:
1. Edit `frontend/src/components/EndpointSelector.jsx`: Add service to appropriate category
2. The backend automatically maps service names to AWS ARNs
3. Service names follow AWS API: `com.amazonaws.[region].[service-name]`

### Code Structure
```
backend/
├── main.py                    # FastAPI app init, routes
├── routes/endpoints.py        # POST /api/endpoints/generate
├── services/script_generator.py # PowerShell generation logic
└── utils/validators.py        # Input validation

frontend/
├── src/App.jsx               # Multi-step form navigation
├── src/components/
│   ├── EndpointSelector.jsx  # 60+ service selection
│   ├── ParameterForm.jsx     # VPC/subnet/SG/RT fields
│   └── ReviewPage.jsx        # Preview & confirmation
└── src/styles/               # Tailwind CSS
```

### Running Tests
```bash
# Backend (pytest - setup required)
cd backend && pytest

# Frontend (Vitest/Jest - setup required)
cd frontend && npm test
```

### Building for Production
```bash
# Frontend build
cd frontend
npm run build  # Outputs to frontend/dist/

# Backend deployment
# Use docker-compose.prod.yaml for production environment
```

## Future Enhancements

- [ ] Query AWS for existing resources (VPCs, subnets, SGs, route tables) - auto-populate from API
- [ ] Endpoint status monitoring and management (list, delete, modify)
- [ ] Cost estimation for selected endpoints
- [ ] Audit logging database for endpoint creation history
- [ ] User authentication and role-based access control
- [ ] Multiple AWS profile support
- [ ] Webhook notifications for endpoint creation status
- [ ] CloudFormation template generation as alternative to PowerShell
- [ ] Terraform configuration generation
- [ ] Batch endpoint import/export functionality

## Architecture & Documentation

For detailed implementation specifications:
- **[artifact.md](artifact.md)** - Complete specification with architecture, user flows, validation rules
- **[DOCKER_SETUP.md](DOCKER_SETUP.md)** - Docker deployment guide with 60+ troubleshooting scenarios
- **[SESSION_SUMMARY.md](SESSION_SUMMARY.md)** - Latest session updates and implementation status

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or feature requests:
1. Check [DOCKER_SETUP.md](DOCKER_SETUP.md) for common issues
2. Review logs: `docker-compose logs -f`
3. Verify AWS credentials are properly configured
4. Open an issue with reproduction steps

## Version History

### v2.0 (February 2026)
- **Major Features**:
  - Multi-service selection support (60+ services across 14 AWS categories)
  - Real-time search and filter functionality
  - Optional tag fields with intelligent name generation
  - Docker integration with AWS CLI pre-installation
  - Health checks for service reliability
  
- **Architecture**:
  - Complete Docker-based setup (frontend + backend + networking)
  - AWS CLI v2 pre-installed in backend container
  - AWS credentials mounting from local `~/.aws/` (read-only)
  - Multi-service PowerShell script generation
  
- **Documentation**:
  - Comprehensive Docker setup guide (DOCKER_SETUP.md)
  - Updated artifact specification (v2.0)
  - Session summary with implementation status
  - Detailed troubleshooting (60+ scenarios)

### v1.0 (February 13, 2026)
- Initial release
- Support for single Interface and Gateway endpoints
- AWS credential configuration
- PowerShell script generation and execution
- Web UI with multi-step form
- Basic validation and error handling

---

**Last Updated**: February 2026 (v2.0)  
**Status**: Production Ready with Docker  
**Next Steps**: [DOCKER_SETUP.md](DOCKER_SETUP.md) or [artifact.md](artifact.md)
#   V P C _ E P _ G E N E R A T O R 
 
 
