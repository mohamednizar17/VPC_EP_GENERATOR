"""
Script Generator - Builds PowerShell scripts for VPC Endpoint creation
"""

from typing import Tuple, List, Optional
from services.aws_service import AWSService

class ScriptGenerator:
    """Generates PowerShell scripts for VPC Endpoint creation"""
    
    def __init__(self):
        self.aws_service = AWSService()
    
    def _get_service_short_name(self, service_name: str) -> str:
        """
        Extract short service name from full service name
        e.g., "com.amazonaws.ap-southeast-1.ec2" -> "ec2"
        """
        parts = service_name.split(".")
        return parts[-1] if parts else "service"
    
    def _build_command(
        self,
        endpoint_type: str,
        region: str,
        vpc_id: str,
        service_name: str,
        tag_prefix: Optional[str] = None,
        tag_suffix: Optional[str] = None,
        subnets: Optional[List[str]] = None,
        security_groups: Optional[List[str]] = None,
        private_dns_enabled: bool = True,
        route_tables: Optional[List[str]] = None,
        select_all_route_tables: bool = False
    ) -> str:
        """
        Build the AWS CLI command for VPC Endpoint creation
        """
        
        # Get service short name for tag
        service_short = self._get_service_short_name(service_name)
        
        # Build tag name, handling empty prefix/suffix
        tag_parts = []
        if tag_prefix:
            tag_parts.append(tag_prefix)
        tag_parts.append(service_short)
        if tag_suffix:
            tag_parts.append(tag_suffix)
        tag_name = "-".join(tag_parts)
        
        # Base command
        cmd = [
            "aws ec2 create-vpc-endpoint",
            f"--vpc-id {vpc_id}",
            f"--vpc-endpoint-type {endpoint_type}",
            f"--service-name {service_name}",
            f"--region {region}"
        ]
        
        # Add Interface-specific parameters
        if endpoint_type.lower() == "interface":
            if subnets:
                subnets_str = " ".join(subnets)
                cmd.append(f"--subnet-ids {subnets_str}")
            
            if security_groups:
                sg_str = " ".join(security_groups)
                cmd.append(f"--security-group-ids {sg_str}")
            
            if private_dns_enabled:
                cmd.append("--private-dns-enabled")
            else:
                cmd.append("--no-private-dns-enabled")
        
        # Add Gateway-specific parameters
        elif endpoint_type.lower() == "gateway":
            if select_all_route_tables:
                # Don't query AWS during generation - will be queried at execution time
                # This avoids credential expiration issues during script generation
                cmd.append("[ROUTE_TABLES_PLACEHOLDER]")
            elif route_tables:
                rt_str = " ".join(route_tables)
                cmd.append(f"--route-table-ids {rt_str}")
        
        # Add tag specifications (with proper escaping for PowerShell)
        tag_spec = f'ResourceType=vpc-endpoint,Tags=[{{Key=Name,Value={tag_name}}}'
        cmd.append(f'--tag-specifications "{tag_spec}"')
        
        return " ".join(cmd)
    
    def generate_ps1(
        self,
        endpoint_type: str,
        region: str,
        vpc_id: str,
        service_name: str,
        tag_prefix: Optional[str] = None,
        tag_suffix: Optional[str] = None,
        subnets: Optional[List[str]] = None,
        security_groups: Optional[List[str]] = None,
        private_dns_enabled: bool = True,
        route_tables: Optional[List[str]] = None,
        select_all_route_tables: bool = False
    ) -> Tuple[str, str]:
        """
        Generate a PowerShell script for VPC Endpoint creation
        
        Returns:
            Tuple of (ps1_content, aws_command)
        """
        
        # Build the AWS CLI command
        aws_command = self._build_command(
            endpoint_type=endpoint_type,
            region=region,
            vpc_id=vpc_id,
            service_name=service_name,
            tag_prefix=tag_prefix,
            tag_suffix=tag_suffix,
            subnets=subnets,
            security_groups=security_groups,
            private_dns_enabled=private_dns_enabled,
            route_tables=route_tables,
            select_all_route_tables=select_all_route_tables
        )
        
        # Get service short name for tags
        service_short = self._get_service_short_name(service_name)
        
        # Build tag name, handling empty prefix/suffix
        tag_parts = []
        if tag_prefix:
            tag_parts.append(tag_prefix)
        tag_parts.append(service_short)
        if tag_suffix:
            tag_parts.append(tag_suffix)
        tag_name = "-".join(tag_parts)
        
        # Escape tag name for PowerShell
        escaped_tag_name = tag_name.replace('"', '\"')
        
        # Handle route table placeholder - gateway endpoint with all route tables
        if "[ROUTE_TABLES_PLACEHOLDER]" in aws_command:
            ps1_content = f"""# AWS VPC Endpoint Generation Script
# Generated by AWS VPC Endpoint Generator
# Endpoint Type: {endpoint_type}
# VPC ID: {vpc_id}
# Service: {service_name}
# Region: {region}

Write-Host "Creating VPC Endpoint..." -ForegroundColor Green

try {{
    # Query all route tables in the VPC
    $routeTables = aws ec2 describe-route-tables --filters "Name=vpc-id,Values={vpc_id}" --region {region} --query "RouteTables[].RouteTableId" --output json 2>&1 | ConvertFrom-Json
    
    if ($null -eq $routeTables -or $routeTables.Count -eq 0) {{
        $routeTableArg = ""
    }} else {{
        $routeTableArg = "--route-table-ids " + ($routeTables -join " ")
    }}
    
    # Build and execute the full command
    $tagSpec = "ResourceType=vpc-endpoint,Tags=[{{Key=Name,Value={escaped_tag_name}}}]"
    $command = "aws ec2 create-vpc-endpoint --vpc-id {vpc_id} --vpc-endpoint-type {endpoint_type} --service-name {service_name} --region {region} $routeTableArg --tag-specifications '$tagSpec' --output json"
    
    Write-Host "Executing endpoint creation..." -ForegroundColor Yellow
    $output = Invoke-Expression $command 2>&1
    
    # Display raw output for debugging
    Write-Host "Raw AWS Response:" -ForegroundColor Gray
    Write-Host $output -ForegroundColor Gray
    Write-Host "" -ForegroundColor Gray
    
    # Check if output is empty
    if ([string]::IsNullOrWhiteSpace($output)) {{
        Write-Host "[FAIL] AWS CLI returned no output" -ForegroundColor Red
        exit 1
    }}
    
    # Parse the output
    $result = $null
    try {{
        $result = $output | ConvertFrom-Json
    }} catch {{
        Write-Host "[FAIL] Failed to parse AWS response as JSON" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Raw output:" -ForegroundColor Red
        Write-Host $output -ForegroundColor Red
        exit 1
    }}
    
    # Check if result is null
    if ($null -eq $result) {{
        Write-Host "[FAIL] AWS response parsed to null" -ForegroundColor Red
        Write-Host "Raw output:" -ForegroundColor Red
        Write-Host $output -ForegroundColor Red
        exit 1
    }}
    
    # Check if AWS returned an error in the response
    if ($result.Error -or $result.Errors) {{
        Write-Host "[FAIL] AWS API Error" -ForegroundColor Red
        if ($result.Error) {{
            Write-Host "Code: $($result.Error.Code)" -ForegroundColor Red
            Write-Host "Message: $($result.Error.Message)" -ForegroundColor Red
        }} elseif ($result.Errors) {{
            Write-Host ($result.Errors | ConvertTo-Json) -ForegroundColor Red
        }}
        exit 1
    }}
    
    # Check for successful response
    if ($result.VpcEndpoint -and $result.VpcEndpoint.VpcEndpointId) {{
        Write-Host "[OK] Endpoint created successfully" -ForegroundColor Green
        Write-Host "ID: $($result.VpcEndpoint.VpcEndpointId)" -ForegroundColor Cyan
        Write-Host "State: $($result.VpcEndpoint.State)" -ForegroundColor Cyan
    }} else {{
        Write-Host "[FAIL] Unexpected response - VpcEndpoint not found" -ForegroundColor Red
        Write-Host "Response structure:" -ForegroundColor Red
        Write-Host ($result | ConvertTo-Json -Depth 3) -ForegroundColor Red
        exit 1
    }}
}}
catch {{
    Write-Host "[FAIL] Failed to create endpoint" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}}
"""
        else:
            # Standard PowerShell script for Interface endpoints or Gateway with specific route tables
            # Extract and rebuild command with proper escaping
            ps1_content = f"""# AWS VPC Endpoint Generation Script
# Generated by AWS VPC Endpoint Generator
# Endpoint Type: {endpoint_type}
# VPC ID: {vpc_id}
# Service: {service_name}
# Region: {region}

Write-Host "Creating VPC Endpoint..." -ForegroundColor Green

try {{
    # Build the command
    $tagSpec = "ResourceType=vpc-endpoint,Tags=[{{Key=Name,Value={escaped_tag_name}}}]"
    $command = "aws ec2 create-vpc-endpoint --vpc-id {vpc_id} --vpc-endpoint-type {endpoint_type} --service-name {service_name} --region {region}"
    
    # Add subnet IDs if Interface endpoint
    if ("{endpoint_type}" -eq "Interface") {{
        $subnets = "{' '.join(subnets) if subnets else ''}"
        if ($subnets) {{
            $command += " --subnet-ids " + $subnets
        }}
        $sgs = "{' '.join(security_groups) if security_groups else ''}"
        if ($sgs) {{
            $command += " --security-group-ids " + $sgs
        }}
        $command += " --private-dns-enabled"
    }}
    
    # Add route table IDs if Gateway endpoint
    if ("{endpoint_type}" -eq "Gateway") {{
        $rts = "{' '.join(route_tables) if route_tables else ''}"
        if ($rts) {{
            $command += " --route-table-ids " + $rts
        }}
    }}
    
    $command += " --tag-specifications '$tagSpec' --output json"
    
    Write-Host "Executing endpoint creation..." -ForegroundColor Yellow
    $output = Invoke-Expression $command 2>&1
    
    # Display raw output for debugging
    Write-Host "Raw AWS Response:" -ForegroundColor Gray
    Write-Host $output -ForegroundColor Gray
    Write-Host "" -ForegroundColor Gray
    
    # Check if output is empty
    if ([string]::IsNullOrWhiteSpace($output)) {{
        Write-Host "[FAIL] AWS CLI returned no output" -ForegroundColor Red
        exit 1
    }}
    
    # Parse the output
    $result = $null
    try {{
        $result = $output | ConvertFrom-Json
    }} catch {{
        Write-Host "[FAIL] Failed to parse AWS response as JSON" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Raw output:" -ForegroundColor Red
        Write-Host $output -ForegroundColor Red
        exit 1
    }}
    
    # Check if result is null
    if ($null -eq $result) {{
        Write-Host "[FAIL] AWS response parsed to null" -ForegroundColor Red
        Write-Host "Raw output:" -ForegroundColor Red
        Write-Host $output -ForegroundColor Red
        exit 1
    }}
    
    # Check if AWS returned an error in the response
    if ($result.Error -or $result.Errors) {{
        Write-Host "[FAIL] AWS API Error" -ForegroundColor Red
        if ($result.Error) {{
            Write-Host "Code: $($result.Error.Code)" -ForegroundColor Red
            Write-Host "Message: $($result.Error.Message)" -ForegroundColor Red
        }} elseif ($result.Errors) {{
            Write-Host ($result.Errors | ConvertTo-Json) -ForegroundColor Red
        }}
        exit 1
    }}
    
    # Check for successful response
    if ($result.VpcEndpoint -and $result.VpcEndpoint.VpcEndpointId) {{
        Write-Host "[OK] Endpoint created successfully" -ForegroundColor Green
        Write-Host "ID: $($result.VpcEndpoint.VpcEndpointId)" -ForegroundColor Cyan
        Write-Host "State: $($result.VpcEndpoint.State)" -ForegroundColor Cyan
    }} else {{
        Write-Host "[FAIL] Unexpected response - VpcEndpoint not found" -ForegroundColor Red
        Write-Host "Response structure:" -ForegroundColor Red
        Write-Host ($result | ConvertTo-Json -Depth 3) -ForegroundColor Red
        exit 1
    }}
}}
catch {{
    Write-Host "[FAIL] Failed to create endpoint" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}}
"""
        
        return ps1_content, aws_command
