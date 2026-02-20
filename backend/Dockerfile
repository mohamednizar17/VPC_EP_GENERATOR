FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including AWS CLI and tools for checking installations
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    awscli \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Verify AWS CLI installation
RUN aws --version && echo "✅ AWS CLI is installed"

# Copy requirements first for better caching
COPY requirements.txt .

# Create virtual environment and install dependencies
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Health check script
COPY healthcheck.sh /app/healthcheck.sh
RUN chmod +x /app/healthcheck.sh

# Run the application
CMD ["python", "main.py"]
