# Use Node.js as the base image
FROM node:18

# Set the working directory
WORKDIR /workspace

# Install global dependencies
RUN npm install -g oclif

# Install additional utilities (optional)
RUN apt-get update && apt-get install -y \
  vim \
  git \
  && rm -rf /var/lib/apt/lists/*

# Expose the workspace volume
VOLUME ["/workspace"]

# Default command
CMD ["/bin/bash"]
