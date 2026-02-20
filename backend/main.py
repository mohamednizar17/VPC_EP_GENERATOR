"""
AWS VPC Endpoint Generator - FastAPI Backend
Main entry point for the application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import endpoints
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="AWS VPC Endpoint Generator API",
    description="API for generating and executing AWS VPC Endpoint creation scripts",
    version="1.0.0"
)

# CORS Middleware - Allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        
        "http://localhost:5173",
        "http://localhost:3000",
        "http://frontend:5173",
        "http://vpc-endpoint-frontend:5173"
    ],  # Local dev & Docker services
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(endpoints.router, prefix="/api", tags=["endpoints"])

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "AWS VPC Endpoint Generator API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
