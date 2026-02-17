"""
Configuration settings for the backend application
"""

from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    """Application settings"""
    
    # App settings
    APP_NAME: str = "AWS VPC Endpoint Generator"
    DEBUG: bool = True
    
    # API settings
    API_HOST: str = "127.0.0.1"
    API_PORT: int = 8000
    
    # CORS settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173"
    ]
    
    # AWS settings
    AWS_REGION: str = "ap-southeast-1"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
