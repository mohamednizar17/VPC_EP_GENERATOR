"""
API Endpoints for VPC Endpoint management
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.aws_service import AWSService
from services.script_generator import ScriptGenerator
from utils.validators import validate_vpc_id, validate_subnet_id, validate_sg_id, validate_route_table_id
from utils.powershell_executor import PowerShellExecutor

router = APIRouter()

# Request models
class AWSConfigRequest(BaseModel):
    access_key: str
    secret_key: str
    region: str
    output_format: str = "json"
    session_token: Optional[str] = None

class EndpointRequest(BaseModel):
    endpoint_type: str  # "Interface" or "Gateway"
    region: str
    vpc_id: str
    service_names: Optional[List[str]] = None  # Multiple services (new)
    service_name: Optional[str] = None  # Single service (legacy support)
    tag_prefix: Optional[str] = None  # Optional tag prefix
    tag_suffix: Optional[str] = None  # Optional tag suffix
    subnets: Optional[List[str]] = None  # For Interface
    security_groups: Optional[List[str]] = None  # For Interface
    private_dns_enabled: Optional[bool] = True  # For Interface
    route_tables: Optional[List[str]] = None  # For Gateway
    select_all_route_tables: Optional[bool] = False  # For Gateway

class ExecuteScriptRequest(BaseModel):
    ps1_content: str
    script_name: Optional[str] = "vpc-endpoint-script.ps1"

# Response models
class ScriptGeneratedResponse(BaseModel):
    success: bool
    ps1_content: str
    file_path: Optional[str] = None
    command: str

# AWS Configuration endpoint
@router.post("/configure")
async def configure_aws(request: AWSConfigRequest):
    """
    Configure AWS CLI with provided credentials
    """
    # Validate required fields
    if not request.access_key or not request.access_key.strip():
        raise HTTPException(status_code=400, detail="Access Key ID is required")
    
    if not request.secret_key or not request.secret_key.strip():
        raise HTTPException(status_code=400, detail="Secret Access Key is required")
    
    if not request.region or not request.region.strip():
        raise HTTPException(status_code=400, detail="Region is required")
    
    try:
        aws_service = AWSService()
        result = aws_service.configure_credentials(
            access_key=request.access_key,
            secret_key=request.secret_key,
            region=request.region,
            output_format=request.output_format,
            session_token=request.session_token
        )
        return {"success": True, "message": "AWS CLI configured successfully", "details": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"AWS configuration failed: {str(e)}")

# Validate inputs
@router.post("/validate")
async def validate_inputs(request: EndpointRequest):
    """
    Validate all user inputs before script generation
    """
    try:
        errors = []
        
        # Validate common fields
        if not validate_vpc_id(request.vpc_id):
            errors.append(f"Invalid VPC ID format: {request.vpc_id}")
        
        # Validate Interface-specific fields
        if request.endpoint_type.lower() == "interface":
            if not request.subnets:
                errors.append("At least one subnet is required for Interface endpoints")
            else:
                for subnet in request.subnets:
                    if not validate_subnet_id(subnet):
                        errors.append(f"Invalid subnet ID format: {subnet}")
            
            if not request.security_groups:
                errors.append("At least one security group is required for Interface endpoints")
            else:
                for sg in request.security_groups:
                    if not validate_sg_id(sg):
                        errors.append(f"Invalid security group ID format: {sg}")
        
        # Validate Gateway-specific fields
        elif request.endpoint_type.lower() == "gateway":
            if not request.route_tables and not request.select_all_route_tables:
                errors.append("At least one route table is required for Gateway endpoints")
            elif request.route_tables:
                for rt in request.route_tables:
                    if not validate_route_table_id(rt):
                        errors.append(f"Invalid route table ID format: {rt}")
        
        if errors:
            raise HTTPException(status_code=422, detail={"errors": errors})
        
        return {"success": True, "message": "All inputs are valid"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")

# Generate PowerShell script
@router.post("/generate", response_model=ScriptGeneratedResponse)
async def generate_script(request: EndpointRequest):
    """
    Generate PowerShell script for VPC Endpoint creation
    """
    # Validate required fields
    validation_errors = []
    
    if not request.endpoint_type or request.endpoint_type.strip() == "":
        validation_errors.append("endpoint_type is required")
    elif request.endpoint_type not in ["Interface", "Gateway"]:
        validation_errors.append("endpoint_type must be 'Interface' or 'Gateway'")
    
    if not request.region or request.region.strip() == "":
        validation_errors.append("region is required")
    
    if not request.vpc_id or request.vpc_id.strip() == "":
        validation_errors.append("vpc_id is required")
    
    # Support both service_names (new) and service_name (legacy)
    service_names = request.service_names or (([request.service_name] if request.service_name else []))
    if not service_names or len(service_names) == 0:
        validation_errors.append("service_name(s) is required")
    
    # Tag prefix and suffix are optional - allow empty strings
    tag_prefix = request.tag_prefix or ""
    tag_suffix = request.tag_suffix or ""
    
    # Validate endpoint-specific requirements
    if request.endpoint_type == "Interface":
        if not request.subnets or len(request.subnets) == 0:
            validation_errors.append("subnets are required for Interface endpoints")
        if not request.security_groups or len(request.security_groups) == 0:
            validation_errors.append("security_groups are required for Interface endpoints")
    
    if request.endpoint_type == "Gateway":
        if not request.route_tables or len(request.route_tables) == 0:
            if not request.select_all_route_tables:
                validation_errors.append("route_tables are required for Gateway endpoints or select_all_route_tables must be true")
    
    if validation_errors:
        raise HTTPException(
            status_code=422,
            detail={
                "validation_errors": validation_errors,
                "message": "Request validation failed"
            }
        )
    
    try:
        generator = ScriptGenerator()
        
        # Support both single and multiple services
        service_names_to_process = service_names if service_names else []
        
        # Generate scripts for all services
        all_ps1_content = """# AWS VPC Endpoint Generation Script
# Created by AWS VPC Endpoint Generator
# This script will create multiple VPC endpoints

$ErrorActionPreference = "Stop"

"""
        
        # Generate a script section for each service
        all_commands = []
        for service_name in service_names_to_process:
            ps1_content, command = generator.generate_ps1(
                endpoint_type=request.endpoint_type,
                region=request.region,
                vpc_id=request.vpc_id,
                service_name=service_name,
                tag_prefix=tag_prefix,
                tag_suffix=tag_suffix,
                subnets=request.subnets,
                security_groups=request.security_groups,
                private_dns_enabled=request.private_dns_enabled,
                route_tables=request.route_tables,
                select_all_route_tables=request.select_all_route_tables
            )
            
            # Extract just the try-catch block from the generated script
            # Skip the header, add to combined script  
            lines = ps1_content.split('\n')
            script_body = '\n'.join([l for l in lines if l.strip() and not l.startswith('#')])
            all_ps1_content += f"\n# Service: {service_name}\n{script_body}\n"
            all_commands.append(command)
        
        # Combine all commands as comments
        combined_command = " && ".join(all_commands) if all_commands else ""
        
        return ScriptGeneratedResponse(
            success=True,
            ps1_content=all_ps1_content,
            command=combined_command
        )
    except Exception as e:
        error_msg = str(e)
        # Provide better error messages for common AWS issues
        if "RequestExpired" in error_msg or "InvalidUserID.NotFound" in error_msg:
            raise HTTPException(
                status_code=400,
                detail=f"AWS credential error: {error_msg}. Please reconfigure your AWS credentials - your session may have expired."
            )
        elif "UnauthorizedOperation" in error_msg or "UnauthorizedAccount" in error_msg:
            raise HTTPException(
                status_code=400,
                detail=f"AWS authorization failed: {error_msg}. Please check your AWS permissions and credentials."
            )
        elif "Failed to describe route tables" in error_msg:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to query route tables: {error_msg}. This usually indicates expired AWS credentials. Please reconfigure and try again."
            )
        else:
            raise HTTPException(status_code=400, detail=f"Script generation failed: {error_msg}")

# Execute PowerShell script
@router.post("/execute")
async def execute_script(request: ExecuteScriptRequest):
    """
    Execute generated PowerShell script
    """
    # Validate request
    if not request.ps1_content or request.ps1_content.strip() == "":
        raise HTTPException(
            status_code=422,
            detail={
                "validation_errors": ["ps1_content is required and cannot be empty"],
                "message": "Request validation failed"
            }
        )
    
    try:
        executor = PowerShellExecutor()
        output, error, exit_code = executor.execute(
            ps1_content=request.ps1_content,
            script_name=request.script_name
        )
        
        if exit_code != 0:
            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "exit_code": exit_code,
                    "error": error if error else "Script execution failed",
                    "output": output if output else "No output",
                    "message": "PowerShell script execution failed"
                }
            )
        
        return {
            "success": True,
            "output": output,
            "error": error if error else None,
            "exit_code": exit_code,
            "message": "Script executed successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_msg = str(e)
        error_trace = traceback.format_exc()
        
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": error_msg,
                "traceback": error_trace,
                "message": "Script execution failed with an unexpected error"
            }
        )
