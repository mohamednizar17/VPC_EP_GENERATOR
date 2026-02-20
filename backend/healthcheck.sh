#!/bin/bash

# Health check script for the backend container

# Check if AWS CLI is available
if ! command -v aws &> /dev/null; then
    echo "⚠️  AWS CLI not found in PATH"
    exit 1
fi

# Check if FastAPI is responding
if ! curl -f http://localhost:8000/health &> /dev/null; then
    echo "⚠️  FastAPI health check endpoint not responding"
    exit 1
fi

echo "✅ All health checks passed"
exit 0
