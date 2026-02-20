# AWS VPC Endpoint Generator Web Application - Detailed Artifact Specification

## Implementation Status & Current Architecture (Updated February 2026)

### ✅ Completed Features

**Frontend Multi-Service Selection (EndpointSelector.jsx)**
- 60+ AWS services organized into 14 professional categories:
  - Compute (EC2, Lambda, Batch, etc.)
  - Storage & CDN (S3, CloudFront, Glacier, etc.)
  - Database (RDS, DynamoDB, ElastiCache, etc.)
  - Messaging & Streaming (SNS, SQS, Kinesis, MQ, etc.)
  - Analytics (Athena, EMR, Redshift, Glue, etc.)
  - Security (IAM, IAM Identity Center, KMS, Secrets Manager, etc.)
  - Management & Governance (CloudFormation, Systems Manager, etc.)
  - Developer Tools (CodeBuild, CodeDeploy, CodePipeline, etc.)
  - Integration & Orchestration (SNS, SQS alternatives, Step Functions, etc.)
  - Machine Learning (SageMaker, Comprehend, Rekognition, Textract, etc.)
  - IoT & Edge (IoT Core, IoT Actions, Greengrass, etc.)
  - Media Services (Kinesis Video, Elemental MediaPackage, etc.)
  - Migration & Disaster Recovery (DataSync, Snowball, DMS, etc.)
  - Network & Content Delivery (CloudFront, Route 53, Global Accelerator, etc.)
- Real-time search/filter functionality across all services
- Expandable/collapsible category sections
- Multi-service selection (up to 60+ Interface services or 2 Gateway services simultaneously)
- Color-coded tags for selected services (blue = Interface, orange = Gateway)

**Backend Multi-Service Support (routes/endpoints.py)**
- `EndpointRequest` model accepts both:
  - `service_names: Optional[List[str]]` (primary, for multiple services)
  - `service_name: Optional[str]` (legacy fallback support)
- All selected services of same type share configuration (subnets/SG for Interface, route tables for Gateway)
- Generates individual PowerShell endpoint creation blocks for each service
- Smart tag handling: Optional prefix/suffix with intelligent name generation

**Optional Tag Fields (script_generator.py)**
- `tag_prefix: Optional[str]` (no longer required)
- `tag_suffix: Optional[str]` (no longer required)
- Tag generation logic handles empty strings cleanly (no malformed names like `-service-`)
- Results: `prefix-service`, `service-suffix`, or `service` (all combinations supported)

**Frontend Multi-Service Display (ReviewPage.jsx)**
- Shows count of selected services
- Displays all service ARNs as badges
- Lists individual AWS CLI command for each selected service
- Users can verify all endpoints before generation

**Docker Integration with AWS CLI**
- `docker-compose.yaml`: Orchestrates frontend (React) and backend (FastAPI) services
- `Backend Dockerfile`: Pre-installs AWS CLI v2 in Python 3.11-slim image
- `healthcheck.sh`: Verifies AWS CLI availability and FastAPI health
- Automated AWS CLI verification during container startup
- AWS credentials mounted from `~/.aws` (read-only)
- Health checks: 5 retries × 10s intervals with 15s start_period
- Frontend waits for backend to be healthy before starting

**Documentation**
- `DOCKER_SETUP.md`: Comprehensive Docker setup and troubleshooting guide
- Instructions for AWS credential configuration (3 methods)
- Common Docker commands and troubleshooting steps
- Production deployment guidelines

---

## Document Metadata
- **Artifact Title**: AWS VPC Endpoint Generator Web Application Specification
- **Version**: 2.0 (Updated with Multi-Service & Docker Support)
- **Author**: Grok AI (based on user requirements)
- **Date**: February 13, 2026
- **Purpose**: This artifact provides a comprehensive, precise, and detailed specification for building a web application that allows users to configure AWS CLI credentials, select multiple VPC endpoints (Interface and Gateway types), generate a customized PowerShell script (.ps1) for endpoint creation, and execute it instantly in PowerShell. The spec covers functional requirements, user flow, architecture, UI/UX design, backend logic, security considerations, error handling, and implementation guidelines.
- **Scope**: Focuses on AWS VPC endpoints only (60+ Interface services for various services, 2 Gateway services for S3/DynamoDB). Uses Docker for containerization with pre-installed AWS CLI. Supports multi-service selection with shared configuration.
- **Assumptions**:
  - Docker and Docker Compose installed locally for development.
  - AWS CLI is auto-installed in Docker container (no manual installation needed).
  - The web app runs in Docker containers (frontend on 5173, backend on 8000).
  - Backend has AWS credentials mounted from local `~/.aws` directory.
  - No cloud deployment details; focus on Docker-based local/dev setup.
- **References**:
  - AWS CLI Documentation: https://docs.aws.amazon.com/cli/latest/reference/ec2/create-vpc-endpoint.html
  - AWS VPC Endpoints: https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints.html
  - PowerShell Execution: https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/invoke-expression
  - Docker Documentation: https://docs.docker.com/
  - FastAPI Documentation: https://fastapi.tiangolo.com/

## 1. High-Level Overview
### Application Description
The web application is a user-friendly tool for generating and executing PowerShell scripts to create AWS VPC endpoints. It guides users through:
1. AWS CLI configuration (credentials managed via Docker-mounted ~/.aws directory or environment variables).
2. Selection of endpoint type (Interface with 60+ services, or Gateway with 2 services).
3. **Multi-service selection**: Users can select multiple services to create endpoints simultaneously.
4. Input of required parameters (e.g., VPC ID, subnets, security groups for Interface; route tables for Gateway).
5. Customization of tags using a prefix-type-suffix format (now truly optional).
6. Generation of a .ps1 file containing individual `aws ec2 create-vpc-endpoint` commands for each selected service.
7. Immediate execution of the .ps1 file in PowerShell upon user confirmation.

The app ensures validation, error prevention, and a seamless flow. It is built with a frontend (FE) for user interaction, a backend (BE) for command execution and file generation, and containerized using Docker for reliable deployment.

### Key Features
- **AWS Credential Management**: Mount local AWS credentials via Docker (read-only), or provide via environment variables.
- **Endpoint Type Selection**: Branching UI based on Interface (60+ services) vs. Gateway (2 services).
- **Multi-Service Selection**: Users can select and configure multiple services simultaneously.
- **Dynamic Parameter Collection**: Conditional fields (e.g., subnets/SG for Interface only; route tables for Gateway).
- **Tag Customization**: User provides optional prefix and suffix; app auto-generates middle (e.g., "ec2" for EC2 service).
- **Script Generation**: Outputs a .ps1 file with individual CLI commands for each selected service, including tags.
- **Instant Execution**: User-triggered run of .ps1 in PowerShell.
- **Validation & Error Handling**: Real-time checks for input formats (e.g., valid VPC IDs, region codes).
- **Search & Discovery**: Real-time search across 60+ services with category-aware filtering.
- **Docker Integration**: Pre-configured Docker environment with AWS CLI, health checks, and credential mounting.
- **User Feedback**: Progress indicators, success/failure messages, logs.

### Non-Functional Requirements
- **Performance**: Response time < 2s for UI interactions; script execution < 10s (depending on AWS API).
- **Security**: Handle credentials via Docker mount or env vars (no storage in app). Use HTTPS if web-hosted.
- **Usability**: Intuitive UI with search, categories, multi-select, and tooltips.
- **Compatibility**: Browser support (Chrome, Firefox, Edge); Docker support for cross-platform (Windows, Mac, Linux).
- **Accessibility**: WCAG 2.1 compliant (e.g., ARIA labels, keyboard navigation).
- **Logging**: BE logs all actions; FE shows user-friendly errors.
- **Reliability**: Container health checks ensure services are running before client requests.

## 2. User Flow
### Step-by-Step Workflow

**Prerequisites**: Docker and Docker Compose installed locally.

1. **Startup (Docker)**:
   - User runs: `docker-compose up --build` in project directory.
   - Backend service:
     - Checks AWS CLI installation (auto-installed in container).
     - Mounts local `~/.aws/` for credentials access.
     - Starts FastAPI server on port 8000.
     - Health check verifies AWS CLI and API responsiveness.
   - Frontend service:
     - Waits for backend health check.
     - Starts Vite dev server on port 5173.
   - Logs show: "✅ AWS CLI is already installed" → "🚀 Starting FastAPI server..."
   - User navigates to http://localhost:5173

2. **AWS Credential Configuration (Optional if not mounting)**:
   - *Note*: If using mounted `~/.aws/credentials`, skip this step.
   - Alternative: Set environment variables or configure inside container.
   - Form (if provided): AWS Access Key ID, Secret Access Key, Region, Output Format.
   - Validation: Key formats, region code validation.
   - Result: AWS CLI is configured in container.

3. **Endpoint Type Selection**:
   - Landing page with two options:
     - "Interface Endpoint" (EC2, Lambda, RDS, SageMaker, and 56+ other services)
     - "Gateway Endpoint" (S3, DynamoDB)
   - Tooltips describe types and use cases.
   - Selection branches to Service Selection.

4. **Service Selection (Multi-Service)**:
   - **For Interface Endpoints**:
     - Display 60+ services organized in 14 AWS categories:
       - Compute (EC2, Lambda, Batch, App Runner, etc.)
       - Storage & CDN (S3, EBS, CloudFront, Glacier, etc.)
       - Database (RDS, DynamoDB, ElastiCache, Neptune, etc.)
       - Messaging & Streaming (SNS, SQS, Kinesis, MQ, EventBridge, etc.)
       - Analytics (Athena, EMR, Redshift, QuickSight, Glue, DataPipeline, etc.)
       - Security (IAM, IAM Identity Center, KMS, Secrets Manager, Config, etc.)
       - Management & Governance (CloudFormation, Systems Manager, CloudTrail, etc.)
       - Developer Tools (CodeBuild, CodeDeploy, CodePipeline, CodeCommit, etc.)
       - Integration & Orchestration (SNS, SQS, Step Functions, MWAA, Managed Workflows, etc.)
       - Machine Learning (SageMaker, Comprehend, Rekognition, Textract, Polly, etc.)
       - IoT & Edge (IoT Core, IoT Actions, Greengrass, FreeRTOS, etc.)
       - Media Services (Kinesis Video, Elemental MediaConvert, MediaLive, MediaPackage, etc.)
       - Migration & Disaster Recovery (DataSync, DataExchange, Snowball, DMS, Database Migration Service, etc.)
       - Network & Content Delivery (CloudFront, Route 53, Global Accelerator, VPC Peering, etc.)
     - Each category is collapsible/expandable.
     - **Search functionality**:
       - Real-time filter across all 60+ services.
       - Type service name to narrow results (e.g., "RDS" → shows "Amazon RDS").
       - Categories collapse/expand based on match.
       - Shows "No results" if no matches.
     - **Multi-select**: Users click checkboxes to select multiple services.
       - Selected services display as blue badges.
       - Example: User selects EC2, RDS, S3 Interface, Lambda endpoints simultaneously.
       - Count display: "X services selected".
     - **Service Naming**: Professional AWS naming (e.g., "Amazon Elastic Compute Cloud (EC2)", "Amazon Relational Database Service (RDS)", "Amazon SageMaker API").
   - **For Gateway Endpoints**:
     - Display 2 services: "Amazon S3" and "Amazon DynamoDB".
     - Simple checkbox selection (users choose one or both).
     - Alternative: Organize in dropdown if preferred.
   - Submit to Parameter Collection.

5. **Parameter Collection (Shared for All Selected Services)**:
   - **Common Fields**:
     - **VPC ID**: Text input
       - Format: vpc-xxxxxxxxxxxxxxxxx
       - Validation: Regex ^vpc-[0-9a-f]{17}$
     - **Region**: Dropdown (list of all AWS regions; default: user's configured default if available)
     - **Interface-Specific Fields** (shown only if Interface selected):
       - **Subnets**: Multi-select or comma-separated input
         - Format: subnet-xxxxxxxxxxxxxxxxx (one or more)
         - Validation: Regex; at least 1 subnet required
         - Tooltip: "Select subnets where the endpoints will be created"
       - **Security Groups**: Multi-select or comma-separated input
         - Format: sg-xxxxxxxxxxxxxxxxx (one or more)
         - Validation: Regex; at least 1 SG required
         - Tooltip: "Select security groups to control traffic to endpoints"
       - **Private DNS Enabled** (Optional): Checkbox (default: checked)
         - Maps to `--private-dns-enabled` or `--no-private-dns-enabled`
         - Applies to all Interface services
     - **Gateway-Specific Fields** (shown only if Gateway selected):
       - **Route Tables**: Multi-select or comma-separated input
         - Format: rtb-xxxxxxxxxxxxxxxxx (one or more)
         - Validation: Regex; at least 1 RT required
         - Option: Checkbox "Select All Route Tables (*)"
         - If checked: BE queries AWS for all RTs in VPC using `aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$vpcId"`
       - Tooltip: "Gateway endpoints are associated with route tables for routing traffic"

   - **Tag Fields** (Optional for all endpoints):
     - **Tag Prefix**: Text input (e.g., "toma-io-aws-sg-nss")
       - Optional; validate: no spaces, alphanumeric-hyphen only
     - **Tag Suffix**: Text input (e.g., "-ep")
       - Optional; validate: no spaces, alphanumeric-hyphen only
     - **Auto-Generated Middle**: Displays middle portion based on selected services
       - Example: If EC2 + RDS selected, shows "ec2" and "rds" dynamically per service
     - **Full Tag Preview**: Live display of final tag format
       - Examples:
         - If prefix="toma-io", service="ec2", suffix="-ep": `toma-io-ec2-ep`
         - If no prefix: `ec2-ep`
         - If no suffix: `toma-io-ec2`
         - If no prefix/suffix: `ec2`
       - Handles all combinations intelligently (no malformed names like `-service-`)

6. **Review & Confirmation**:
   - **Summary Page** displays:
     - Endpoint Type: "Interface" or "Gateway"
     - Selected Services: List of all services with count (e.g., "3 services selected: EC2, RDS, Lambda")
     - Service ARNs: Display each service's ARN (for reference)
     - VPC ID, Region, Subnets/Route Tables (formatted list)
     - Security Groups (if Interface)
     - Tags: Show prefix-suffix preview
     - AWS CLI Commands: Display individual command for each service (raw text or verbatim)
   - **Generated Commands Preview**:
     ```
     For EC2:
     aws ec2 create-vpc-endpoint --vpc-id vpc-12345678 --service-name com.amazonaws.ap-southeast-1.ec2 --vpc-endpoint-type Interface --subnet-ids subnet-12345678 --security-group-ids sg-12345678 --tag-specifications "ResourceType=vpc-endpoint,Tags=[{Key=Name,Value=toma-io-ec2-ep}]" --region ap-southeast-1
     
     For RDS:
     aws ec2 create-vpc-endpoint --vpc-id vpc-12345678 --service-name com.amazonaws.ap-southeast-1.rds --vpc-endpoint-type Interface --subnet-ids subnet-12345678 --security-group-ids sg-12345678 --tag-specifications "ResourceType=vpc-endpoint,Tags=[{Key=Name,Value=toma-io-rds-ep}]" --region ap-southeast-1
     
     ... (one command per selected service)
     ```
   - **Buttons**:
     - "Edit": Return to parameter collection (back button).
     - "Generate PowerShell Script": Save .ps1 file locally.
     - "Generate & Execute": Generate script and immediately run it (executes PowerShell).

7. **Script Generation & Execution**:
   - **Generate .ps1 File**:
     - BE builds PowerShell script with:
       - Shebang/header comments (script purpose, date, user who generated it).
       - Individual try-catch blocks for each service.
       - One `aws ec2 create-vpc-endpoint` command per selected service.
       - Resource tagging inline.
       - Error handling: Catch and display AWS errors (e.g., "VPC not found", "Insufficient permissions").
       - Example structure:
         ```powershell
         # AWS VPC Endpoint Generator
         # Generated: 2026-02-13
         # Services: EC2, RDS

         try {
           Write-Host "Creating VPC Endpoint for EC2..."
           aws ec2 create-vpc-endpoint --vpc-id vpc-12345 --service-name com.amazonaws.ap-southeast-1.ec2 ...
           Write-Host "✅ EC2 endpoint created successfully"
         } catch {
           Write-Host "❌ Failed to create EC2 endpoint: $_"
         }

         try {
           Write-Host "Creating VPC Endpoint for RDS..."
           aws ec2 create-vpc-endpoint --vpc-id vpc-12345 --service-name com.amazonaws.ap-southeast-1.rds ...
           Write-Host "✅ RDS endpoint created successfully"
         } catch {
           Write-Host "❌ Failed to create RDS endpoint: $_"
         }
         ```
   - **Execute Script**:
     - User clicks "Generate & Execute" or downloads and runs manually.
     - BE invokes PowerShell: `powershell.exe -File [script-path]` (if running on Windows backend).
     - *Note*: Modern approach: Provide .ps1 download; user runs locally for security.
     - Output: Capture stdout/stderr, display in UI:
       - Success: Endpoint IDs created.
       - Error: AWS error messages with remediation hints.

### Edge Cases & Error Handling
- **No Services Selected**: Show validation error "Please select at least one service".
- **Invalid VPC ID**: Real-time regex validation with error message.
- **Missing Subnets/SGs for Interface**: Error "Select at least one subnet and security group".
- **AWS Credentials Invalid/Expired**: Error message with remediation (re-mount credentials, update env vars).
- **Insufficient IAM Permissions**: Error "Check your IAM permissions for ec2:CreateVpcEndpoint".
- **Network Issues**: Timeout error with retry option.
- **Tag Validation**: Prevent invalid characters; show real-time feedback on prefix/suffix.

## 3. Architecture
### Tech Stack
- **Frontend**: React.js 18.2 with Vite 5.4 (hot module reload for live development)
- **Frontend Styling**: Tailwind CSS 3.4 for responsive design
- **Backend**: FastAPI (Python 3.11) for REST API endpoints
- **Containerization**: Docker and Docker Compose for cross-platform deployment
- **AWS Integration**: AWS CLI v2 pre-installed in backend container
- **Communication**: REST API over HTTP (port 8000 internal, exposed via Docker)
- **File Handling**: BE generates .ps1 files and serves them as downloads
- **Execution**: PowerShell via AWS CLI (executed locally on user's machine after download)
- **Database**: None (stateless; session-based if multi-step form required)

### Docker Architecture
```
┌─────────────────────────────────────────────────────────┐
│             Docker Compose (docker-compose.yaml)        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────────────┐      ┌──────────────────────┐  │
│  │  Backend Service   │      │  Frontend Service    │  │
│  │  (vpc-endpoint-    │      │  (vpc-endpoint-      │  │
│  │   backend)         │      │   frontend)          │  │
│  │                    │      │                      │  │
│  │  Image: Custom     │      │  Image: Node 18      │  │
│  │  Dockerfile        │      │  Alpine              │  │
│  │  Port: 8000        │      │  Port: 5173          │  │
│  │                    │      │                      │  │
│  │  ✓ AWS CLI v2      │      │  ✓ Vite dev server   │  │
│  │  ✓ Python 3.11     │      │  ✓ HMR enabled       │  │
│  │  ✓ FastAPI         │      │  ✓ React 18         │  │
│  │  ✓ Health check    │      │  ✓ Tailwind CSS      │  │
│  │  ✓ AWS creds mount │      │                      │  │
│  │                    │      │  Depends on:         │  │
│  │  Networks:         │      │  backend (healthy)   │  │
│  │  vpc-endpoint-     │◄─────►  Waits for health    │  │
│  │  network (bridge)  │      │  check before start  │  │
│  │                    │      │                      │  │
│  │  Volumes:          │      │  Volumes:            │  │
│  │  /app (code sync)  │      │  /app (code sync)    │  │
│  │  ~/.aws (ro mount) │      │                      │  │
│  └────────────────────┘      └──────────────────────┘  │
│           ▲                           │                │
│           │ Mount AWS Credentials     │ Health check   │
│           │ from local ~/.aws         │ on backend     │
│           │ (read-only)               │ port 8000      │
└───────────┼───────────────────────────┼────────────────┘
            │                           │
            ▼                           ▼
      Host Machine                  Client Browser
      ~/.aws/                        http://localhost:5173
      credentials                    (Frontend UI)
      config
```

### Backend Dockerfile
```dockerfile
# Multi-stage build for minimal image size
FROM python:3.11-slim AS builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
  curl \
  awscli \
  git \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Verify AWS CLI installation
RUN aws --version && echo "✅ AWS CLI is installed"

# Set Python env variables
ENV PYTHONUNBUFFERED=1

# Copy application code
COPY . /app
WORKDIR /app

# Copy healthcheck script
COPY healthcheck.sh /app/healthcheck.sh
RUN chmod +x /app/healthcheck.sh

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose FastAPI port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=15s \
  CMD ["/app/healthcheck.sh"]

# Start FastAPI
CMD ["python", "main.py"]
```

### Components & Interactions

**Frontend Components** (React):
1. `LandingPage.jsx`: Welcome screen with "Start" button.
2. `EndpointSelector.jsx`: Multi-service selection with:
   - 14 expandable service categories.
   - 60+ Interface services (organized by category).
   - 2 Gateway services.
   - Real-time search/filter functionality.
   - Multi-select checkboxes.
3. `ParameterForm.jsx`: Conditional fields based on endpoint type and selected services.
   - Common: VPC ID, Region.
   - Interface: Subnets, Security Groups, Private DNS Enabled.
   - Gateway: Route Tables.
   - All services: Optional Tag Prefix/Suffix.
4. `ReviewPage.jsx`: Summary page showing:
   - All inputs in readable format.
   - Selected services with ARNs.
   - Generated AWS CLI commands (one per service).
   - Buttons: Edit, Generate, Generate & Execute.
5. `OutputPage.jsx` (optional): Display execution results and logs.

**Backend Endpoints** (FastAPI):
1. `POST /api/endpoints/generate`:
   - Input: `EndpointRequest` model with:
     - `service_names: Optional[List[str]]` (primary, for multiple services).
     - `service_name: Optional[str]` (legacy fallback).
     - `vpc_id, region, subnets, security_groups, route_tables`.
     - `tag_prefix: Optional[str], tag_suffix: Optional[str]` (both optional).
     - `private_dns_enabled: Optional[bool]`.
   - Processing:
     - Validate all inputs (VPC ID, subnets, etc.).
     - For each service in `service_names`:
       - Generate AWS CLI command.
       - Create tag with prefix-service-suffix logic.
     - Combine all commands into single .ps1 script.
   - Output: `EndpointResponse` with:
     - `ps1_content: str` (entire PowerShell script).
     - `services: List[str]` (list of services created).
     - `commands: List[str]` (individual AWS CLI commands).

2. `GET /health` (implicit from healthcheck.sh):
   - Returns health status of FastAPI and AWS CLI.
   - Used by Docker health check.

**Data Flow**:
```
User Input (FE) 
  ↓
Form Validation (FE + BE)
  ↓
EndpointRequest Model (BE)
  ↓
command_builder() for each service
  ↓
Combine commands → PowerShell script
  ↓
Return .ps1 content to FE
  ↓
User downloads / executes locally
```

### API Endpoints Details

**POST /api/endpoints/generate**
- **Request Body** (Pydantic Model):
  ```json
  {
    "service_names": ["ec2", "rds", "lambda"],  // List of service short names OR
    "service_name": "ec2",                       // Single service (legacy)
    "vpc_id": "vpc-12345678",
    "region": "ap-southeast-1",
    "subnets": ["subnet-12345678", "subnet-87654321"],  // For Interface
    "security_groups": ["sg-12345678"],                 // For Interface
    "route_tables": ["rtb-12345678"],                   // For Gateway
    "private_dns_enabled": true,                        // Optional, default true
    "tag_prefix": "toma-io",                            // Optional
    "tag_suffix": "-ep",                                // Optional
    "vpc_endpoint_type": "Interface"  // or "Gateway"
  }
  ```

- **Response Body**:
  ```json
  {
    "services": ["ec2", "rds", "lambda"],
    "ps1_content": "# PowerShell script...\n...",
    "commands": [
      "aws ec2 create-vpc-endpoint --vpc-id vpc-12345678 --service-name com.amazonaws.ap-southeast-1.ec2 ...",
      "aws ec2 create-vpc-endpoint --vpc-id vpc-12345678 --service-name com.amazonaws.ap-southeast-1.rds ...",
      "aws ec2 create-vpc-endpoint --vpc-id vpc-12345678 --service-name com.amazonaws.ap-southeast-1.lambda ..."
    ]
  }
  ```

## 4. Detailed Implementation Guidelines

### Docker Setup & AWS CLI Integration

**Prerequisites**:
- Docker Desktop (v20.10+)
- Docker Compose (v1.27+)
- Local AWS credentials file at `~/.aws/credentials` (optional; can use env vars instead)

**Backend Container Initialization**:
1. **Dockerfile builds image with AWS CLI pre-installed**:
   - Base image: `python:3.11-slim`
   - System packages: `curl`, `awscli` (v2), `git`, `ca-certificates`
   - Verification: `aws --version` printed during build to confirm installation
   - Python packages: FastAPI, uvicorn, pydantic, etc. from `requirements.txt`

2. **docker-compose.yaml orchestrates services**:
   - Backend service:
     - Build context: `./backend` (Dockerfile location)
     - Port mapping: `8000:8000` (internal FastAPI → external)
     - Volumes:
       - `./backend:/app` (code sync for live reloading)
       - `~/.aws:/root/.aws:ro` (read-only AWS credentials mount)
     - Startup command: Check AWS CLI → print version → start FastAPI
     - Health check: Verify AWS CLI and FastAPI responsiveness (5 retries, 15s start_period)
   - Frontend service:
     - Build context: `./frontend` (Node.js Dockerfile)
     - Port mapping: `5173:5173` (Vite dev server)
     - Depends_on: `backend` with `service_healthy` condition
     - Environment: `VITE_API_URL=http://backend:8000`
   - Network: `vpc-endpoint-network` (bridge for inter-container communication)

**AWS Credential Management**:
- **Method 1 (Recommended)**: Mount local AWS credentials
  - Credentials should be at ~/.aws/credentials
  - docker-compose.yaml automatically mounts as read-only: `~/.aws:/root/.aws:ro`
  - Backend FastAPI can access credentials via `aws cli` commands
  - Verify: `docker-compose exec backend aws sts get-caller-identity`

- **Method 2**: Environment variables
  - Pass via docker-compose.up command
  - Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION

- **Method 3**: Configure inside container
  - Run docker-compose up -d
  - Execute: docker-compose exec backend bash
  - Run: aws configure (interactive setup)

**Startup Verification**:
- User sees logs during `docker-compose up`:
  - Shows AWS CLI version check
  - Shows FastAPI server startup on port 8000
  - Health check confirmation for backend
  - Frontend server startup on port 5173

### Multi-Service Endpoint Generation

**Service Selection Logic**:
- Frontend `EndpointSelector.jsx` maintains state for selected services
- User selects services by clicking checkboxes in categories
- Display selected count and service badges

**Backend Processing**:
- `EndpointRequest` model accepts service_names (list) or service_name (single)
- Validation ensures at least one service is selected
- Script Generation Loop processes each service individually
- Combine all AWS CLI commands into single PowerShell script

### Service Naming & Tag Generation

**Service Mapping** (60+ Interface services):
- Complete mapping of service short names to AWS ARNs
- Format: com.amazonaws.{region}.{service-name}
- Gateway services: S3 and DynamoDB only

**Tag Generation Logic**:
- Accepts optional prefix and suffix
- Intelligently combines: prefix-service-suffix
- Handles empty strings: no malformed tags like "-service-"
- Results in clean tag names for all combinations

### PowerShell Script Structure

**Generated .ps1 File** (for multiple services):
- Header comments with generation details (date, services, VPC ID, region)
- Error handling with try-catch blocks
- One AWS CLI create-vpc-endpoint command per selected service
- Individual status messages for each endpoint creation
- Resource tagging inline
- User-friendly output with emojis (✅, ❌, 📍)

### Input Validation Rules

**Field Validations**:
- VPC ID: Format vpc-[17 hex characters]
- Subnets: Format subnet-[17 hex characters] (one or more)
- Security Groups: Format sg-[17 hex characters] (one or more)
- Route Tables: Format rtb-[17 hex characters] (one or more)
- Region: Valid AWS region code from predefined list
- Tag Prefix/Suffix: Alphanumeric and hyphens only

### Security & Best Practices

**Credential Handling**:
- Mount ~/.aws as read-only in Docker
- Use environment variables for sensitive data
- Never log full credential values
- Validate AWS API responses for sensitive data

**Input Sanitization**:
- Validate all inputs server-side
- Escape special characters in PowerShell commands
- Use parameterized queries/commands where possible
- Reject inputs with suspicious patterns

**IAM Permissions**:
- User must have ec2:CreateVpcEndpoint permission
- User must have ec2:CreateTags permission
- Verify AWS credentials work before script execution
- Provide clear error message if permission denied

**Execution Context**:
- PowerShell scripts executed on user's local machine (not server-side)
- User has full control over script before execution
- Server provides download; user runs locally
- Logs capture AWS error messages for debugging

### Error Handling & User Feedback

**Common Errors & Solutions**:
- VPC Not Found: Check VPC ID and region
- Insufficient Permissions: Verify IAM permissions for ec2:CreateVpcEndpoint
- Invalid Subnet for VPC: Verify subnets are in the specified VPC
- AWS CLI Errors: Capture and display to user with remediation hints

**User Feedback**:
- Real-time client-side validation (FE)
- Server-side validation with clear messages (BE)
- PowerShell script execution feedback (success/error per endpoint)
- Downloadable execution logs
- Retry buttons for failed operations
