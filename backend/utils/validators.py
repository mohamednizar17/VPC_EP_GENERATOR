"""
Validators - Input validation functions
"""

import re

# Valid AWS region codes
VALID_REGIONS = [
    "us-east-1", "us-east-2", "us-west-1", "us-west-2",
    "af-south-1", "ap-east-1", "ap-south-1", "ap-northeast-1",
    "ap-northeast-2", "ap-northeast-3", "ap-southeast-1", "ap-southeast-2",
    "ca-central-1", "eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3",
    "eu-north-1", "eu-south-1", "me-south-1", "sa-east-1"
]

def validate_vpc_id(vpc_id: str) -> bool:
    """Validate VPC ID format: vpc-xxxxxxxxxxxxxxxx"""
    pattern = r"^vpc-[0-9a-f]{8,17}$"
    return bool(re.match(pattern, vpc_id))

def validate_subnet_id(subnet_id: str) -> bool:
    """Validate Subnet ID format: subnet-xxxxxxxxxxxxxxxx"""
    pattern = r"^subnet-[0-9a-f]{8,17}$"
    return bool(re.match(pattern, subnet_id))

def validate_sg_id(sg_id: str) -> bool:
    """Validate Security Group ID format: sg-xxxxxxxxxxxxxxxx"""
    pattern = r"^sg-[0-9a-f]{8,17}$"
    return bool(re.match(pattern, sg_id))

def validate_route_table_id(rt_id: str) -> bool:
    """Validate Route Table ID format: rtb-xxxxxxxxxxxxxxxx"""
    pattern = r"^rtb-[0-9a-f]{8,17}$"
    return bool(re.match(pattern, rt_id))

def validate_region(region: str) -> bool:
    """Validate AWS region code"""
    return region in VALID_REGIONS

def validate_aws_key(access_key: str) -> bool:
    """Validate AWS Access Key format (20 alphanumeric characters)"""
    pattern = r"^[A-Z0-9]{20}$"
    return bool(re.match(pattern, access_key))

def validate_aws_secret(secret_key: str) -> bool:
    """Validate AWS Secret Key format (40 characters, base64-like)"""
    pattern = r"^[A-Za-z0-9/+=]{40}$"
    return bool(re.match(pattern, secret_key))

def validate_tag_input(tag_input: str) -> bool:
    """Validate tag input (no empty strings, no invalid characters)"""
    if not tag_input or not tag_input.strip():
        return False
    # No special characters except hyphens and underscores
    pattern = r"^[a-zA-Z0-9\-_]+$"
    return bool(re.match(pattern, tag_input))

def get_valid_regions() -> list:
    """Return list of valid AWS regions"""
    return VALID_REGIONS
