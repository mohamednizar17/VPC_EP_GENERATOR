"""
PowerShell Executor - Executes PowerShell scripts
"""

import subprocess
import tempfile
import os
from typing import Tuple

class PowerShellExecutor:
    """Executes PowerShell scripts"""
    
    def __init__(self):
        self.temp_dir = tempfile.gettempdir()
    
    def execute(
        self,
        ps1_content: str,
        script_name: str = "vpc-endpoint-script.ps1"
    ) -> Tuple[str, str, int]:
        """
        Execute a PowerShell script
        
        Args:
            ps1_content: The PowerShell script content
            script_name: Name of the script file
        
        Returns:
            Tuple of (stdout, stderr, exit_code)
        """
        
        # Create temporary script file
        script_path = os.path.join(self.temp_dir, script_name)
        
        try:
            # Write script to file
            with open(script_path, 'w', encoding='utf-8') as f:
                f.write(ps1_content)
            
            # Execute the script using PowerShell
            result = subprocess.run(
                [
                    "powershell.exe",
                    "-NoProfile",
                    "-ExecutionPolicy", "Bypass",
                    "-File", script_path
                ],
                capture_output=True,
                text=True,
                timeout=60
            )
            
            return result.stdout, result.stderr, result.returncode
        
        except subprocess.TimeoutExpired:
            raise Exception("PowerShell script execution timed out")
        except Exception as e:
            raise Exception(f"Failed to execute PowerShell script: {str(e)}")
        finally:
            # Clean up temporary file
            if os.path.exists(script_path):
                try:
                    os.remove(script_path)
                except:
                    pass
