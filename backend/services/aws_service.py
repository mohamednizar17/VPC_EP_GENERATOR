"""
AWS Service - Handles AWS CLI configuration and AWS API interactions
"""

import subprocess
import json
from typing import Dict, Any, Optional
import os

class AWSService:
    """Service for AWS operations"""
    
    def __init__(self):
        self.profile = "default"
    
    def configure_credentials(
        self,
        access_key: str,
        secret_key: str,
        region: str,
        output_format: str = "json",
        session_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Configure AWS CLI credentials using `aws configure set` commands
        
        Args:
            access_key: AWS access key ID
            secret_key: AWS secret access key
            region: AWS region
            output_format: Output format (json, yaml, text, table)
            session_token: Optional session token for temporary credentials
        
        Returns:
            Dictionary with configuration status
        """
        try:
            # Configure access key
            subprocess.run(
                ["aws", "configure", "set", "aws_access_key_id", access_key, "--profile", self.profile],
                check=True,
                capture_output=True,
                text=True
            )
            
            # Configure secret key
            subprocess.run(
                ["aws", "configure", "set", "aws_secret_access_key", secret_key, "--profile", self.profile],
                check=True,
                capture_output=True,
                text=True
            )
            
            # Configure region
            subprocess.run(
                ["aws", "configure", "set", "region", region, "--profile", self.profile],
                check=True,
                capture_output=True,
                text=True
            )
            
            # Configure output format
            subprocess.run(
                ["aws", "configure", "set", "output", output_format, "--profile", self.profile],
                check=True,
                capture_output=True,
                text=True
            )
            
            # Configure session token if provided
            if session_token:
                subprocess.run(
                    ["aws", "configure", "set", "aws_session_token", session_token, "--profile", self.profile],
                    check=True,
                    capture_output=True,
                    text=True
                )
            
            return {
                "status": "success",
                "profile": self.profile,
                "region": region,
                "message": "AWS credentials configured successfully"
            }
        
        except subprocess.CalledProcessError as e:
            raise Exception(f"AWS CLI configuration failed: {e.stderr}")
        except Exception as e:
            raise Exception(f"Unexpected error during AWS configuration: {str(e)}")
    
    def describe_route_tables(self, vpc_id: str, region: str) -> list:
        """
        Query AWS for all route tables in the given VPC
        
        Args:
            vpc_id: VPC ID to query
            region: AWS region
        
        Returns:
            List of route table IDs
        """
        try:
            result = subprocess.run(
                [
                    "aws", "ec2", "describe-route-tables",
                    "--filters", f"Name=vpc-id,Values={vpc_id}",
                    "--query", "RouteTables[].RouteTableId",
                    "--region", region,
                    "--profile", self.profile,
                    "--output", "json"
                ],
                check=True,
                capture_output=True,
                text=True
            )
            
            route_tables = json.loads(result.stdout)
            return route_tables
        
        except subprocess.CalledProcessError as e:
            raise Exception(f"Failed to describe route tables: {e.stderr}")
        except Exception as e:
            raise Exception(f"Error querying route tables: {str(e)}")
