# Use an NVIDIA CUDA base image that includes the CUDA Toolkit and cuDNN.
# This version is compatible with PyTorch versions that use CUDA 12.1.
FROM nvidia/cuda:12.1.1-cudnn8-devel-ubuntu22.04

# Set environment variables to prevent Python from writing pyc files to disc
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set DEBIAN_FRONTEND to noninteractive to prevent prompts during apt-get install, which cause the build to hang.
ENV DEBIAN_FRONTEND=noninteractive

# Install Python 3.11, pip, and other necessary system dependencies
# - `software-properties-common` is needed for `add-apt-repository`
# - `libpq-dev` is needed for `psycopg2`
# python3.11 is available in the default Ubuntu 22.04 repositories, so the deadsnakes PPA is not strictly required.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3.11 \
    python3.11-distutils \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Make python3.11 the default python
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1

# Set the working directory in the container
WORKDIR /app

# Upgrade pip as recommended by the build logs
RUN python3 -m pip install --upgrade pip

# Copy the requirements file and install Python dependencies
COPY requirements.txt .
# Install PyTorch with CUDA 12.1 support separately, as it requires a specific package index.
# The requested versions in requirements.txt (e.g., torch 2.8.0) are not available for this CUDA/Python combination.
# We are installing the latest available compatible versions instead.
# RUN pip install torch==2.4.0 torchvision==0.19.0 torchaudio==2.4.0 --index-url https://download.pytorch.org/whl/cu121
RUN pip install --no-cache-dir --ignore-installed -r requirements.txt

# Copy the rest of the application's code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Run the application
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]