# AWS VPC Endpoint Generator

A web application for generating and executing PowerShell scripts to create AWS VPC endpoints. Supports both Interface and Gateway endpoint types with full customization and validation.

## Project Structure

```
Endpoint_generator/
├── frontend/                 # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Tailwind styles
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind configuration
│   └── postcss.config.js    # PostCSS configuration
│
├── backend/                  # FastAPI + Python
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration settings
│   ├── requirements.txt      # Python dependencies
│   ├── routes/
│   │   └── endpoints.py     # API endpoints
│   ├── services/
│   │   ├── aws_service.py   # AWS operations
│   │   └── script_generator.py # PowerShell script generation
│   └── utils/
│       ├── validators.py    # Input validation
│       └── powershell_executor.py # PowerShell execution
│
├── artifact.md              # Detailed specification
├── Create-InterfaceEndpoints.ps1  # Legacy PowerShell script
└── README.md               # This file
```

## Features

### 1. AWS Configuration
- Securely configure AWS CLI credentials
- Support for temporary credentials (session tokens)
- Region selection
- Output format configuration

### 2. Endpoint Type Selection
- **Interface Endpoints**: For services like EC2, STS, KMS, DynamoDB Streams, SNS, SQS
- **Gateway Endpoints**: For S3 and DynamoDB

### 3. Parameter Collection
- VPC ID validation
- Service name selection
- Subnet and Security Group configuration (Interface)
- Route Table configuration (Gateway)
- Custom tagging with prefix/suffix format

### 4. Script Generation
- Generates optimized PowerShell scripts
- AWS CLI command preview
- Error handling and logging

### 5. Instant Execution
- Execute scripts directly from the web UI
- Real-time output and error feedback
- Download generated scripts for later use

## Prerequisites

- **Windows OS** (for PowerShell)
- **Python 3.8+** (for backend)
- **Node.js 16+** (for frontend)
- **AWS CLI** installed and configured
- **PowerShell 5.1+**

## Installation & Setup

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create a Python virtual environment:
```bash
python -m venv venv
```

3. Activate virtual environment:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create `.env` file from example:
```bash
copy .env.example .env
# Edit .env with your configuration
```

6. Start the backend server:
```bash
python main.py
```
The backend will run at `http://127.0.0.1:8000`

Backend will also expose API docs at `http://127.0.0.1:8000/docs`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```
The frontend will run at `http://localhost:5173`

4. Build for production:
```bash
npm run build
```

## Usage

1. Open browser and go to `http://localhost:5173`
2. **Step 1**: Enter AWS credentials
3. **Step 2**: Select endpoint type (Interface or Gateway)
4. **Step 3**: Configure endpoint parameters
5. **Step 4**: Review configuration
6. **Options**:
   - Download .ps1 script for later use
   - Execute immediately from the web UI

## API Endpoints

### POST `/api/configure`
Configure AWS CLI credentials
```json
{
  "access_key": "AKIA...",
  "secret_key": "wJalrX...",
  "region": "ap-southeast-1",
  "output_format": "json",
  "session_token": "optional"
}
```

### POST `/api/validate`
Validate all inputs before script generation
```json
{
  "endpoint_type": "Interface",
  "vpc_id": "vpc-xxx",
  "service_name": "com.amazonaws.ap-southeast-1.ec2",
  "tag_prefix": "prefix",
  "tag_suffix": "suffix",
  "subnets": ["subnet-xxx"],
  "security_groups": ["sg-xxx"]
}
```

### POST `/api/generate`
Generate PowerShell script
```json
{
  "endpoint_type": "Interface",
  "region": "ap-southeast-1",
  "vpc_id": "vpc-xxx",
  "service_name": "com.amazonaws.ap-southeast-1.ec2",
  "tag_prefix": "prefix",
  "tag_suffix": "suffix",
  "subnets": ["subnet-xxx"],
  "security_groups": ["sg-xxx"],
  "private_dns_enabled": true
}
```

Returns:
```json
{
  "success": true,
  "ps1_content": "...",
  "command": "aws ec2 create-vpc-endpoint ..."
}
```

### POST `/api/execute`
Execute generated PowerShell script
```json
{
  "ps1_content": "...",
  "script_name": "vpc-endpoint-script.ps1"
}
```

## Input Validation

### VPC ID
- Format: `vpc-xxxxxxxxxxxxxxxx`
- Regex: `^vpc-[0-9a-f]{8,17}$`

### Subnet ID
- Format: `subnet-xxxxxxxxxxxxxxxx`
- Regex: `^subnet-[0-9a-f]{8,17}$`

### Security Group ID
- Format: `sg-xxxxxxxxxxxxxxxx`
- Regex: `^sg-[0-9a-f]{8,17}$`

### Route Table ID
- Format: `rtb-xxxxxxxxxxxxxxxx`
- Regex: `^rtb-[0-9a-f]{8,17}$`

### AWS Credentials
- Access Key: 20 alphanumeric characters
- Secret Key: 40 base64-like characters

## Security Considerations

1. **Credential Handling**: Credentials are only used to configure AWS CLI and are never stored
2. **HTTPS**: Use HTTPS in production environments
3. **Input Sanitization**: All inputs are validated and sanitized
4. **Command Injection Prevention**: Shell arguments are properly escaped
5. **PowerShell Execution**: Uses non-interactive mode with execution policy bypass

## Troubleshooting

### Backend won't start
- Ensure Python 3.8+ is installed
- Check virtual environment is activated
- Verify all dependencies installed: `pip list`
- Check port 8000 is not in use

### Frontend won't connect to backend
- Ensure backend is running on `127.0.0.1:8000`
- Check CORS configuration in `backend/config.py`
- Verify proxy settings in `frontend/vite.config.js`
- Check browser console for CORS errors

### AWS CLI not found
- Ensure AWS CLI is installed: `aws --version`
- Add AWS CLI to PATH environment variable
- Restart backend after installing AWS CLI

### PowerShell execution fails
- Ensure PowerShell 5.1+ is installed
- Check AWS permissions for `ec2:CreateVpcEndpoint`
- Verify AWS credentials have proper IAM permissions
- Check VPC ID, subnets, security groups exist in AWS

## Development

### Backend Development
- Follows REST API conventions
- Uses Pydantic for request validation
- Includes detailed error messages
- Auto-generates API documentation at `/docs`

### Frontend Development
- Component-based architecture
- Form validation on client side
- Real-time feedback and error handling
- Tailwind CSS for styling
- Responsive design

### Running Tests
```bash
# Backend tests (coming soon)
pytest

# Frontend tests (coming soon)
npm test
```

## Future Enhancements

- [ ] Multi-endpoint batch creation
- [ ] Query AWS for existing resources (VPCs, subnets, security groups)
- [ ] Endpoint status monitoring
- [ ] Cost estimation
- [ ] Audit logging database
- [ ] User authentication
- [ ] Multiple profile support
- [ ] Webhook notifications

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

## Version History

### v1.0.0 (February 13, 2026)
- Initial release
- Support for Interface and Gateway endpoints
- AWS credential configuration
- PowerShell script generation and execution
- Web UI with multi-step form
#   V P C _ E P _ G E N E R A T O R  
 