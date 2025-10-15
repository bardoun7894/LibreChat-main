#!/bin/bash

# AI SaaS Platform Auto-Fix Dependencies Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Maximum number of attempts
MAX_ATTEMPTS=10
attempt=1

# Function to extract missing dependency from error message
extract_dependency() {
    local error_message="$1"
    
    # Try different patterns to extract the dependency name
    if [[ $error_message =~ "Cannot find module '(.+)'" ]]; then
        echo "${BASH_REMATCH[1]}"
    elif [[ $error_message =~ "failed to resolve import \"(.+)\" from" ]]; then
        echo "${BASH_REMATCH[1]}"
    elif [[ $error_message =~ "Cannot find package '(.+)'" ]]; then
        echo "${BASH_REMATCH[1]}"
    else
        echo ""
    fi
}

# Function to add a dependency to package.json
add_dependency() {
    local dependency="$1"
    local package_file="client/package.json"
    
    print_status "Adding missing dependency: $dependency"
    
    # Check if dependency already exists
    if grep -q "\"$dependency\":" "$package_file"; then
        print_warning "Dependency $dependency already exists in package.json"
        return 0
    fi
    
    # Determine if it's a dev dependency or regular dependency
    local is_dev_dependency=false
    
    # Common dev dependencies
    if [[ "$dependency" =~ ^(postcss|tailwindcss|autoprefixer|eslint|vite|@types/) ]]; then
        is_dev_dependency=true
    fi
    
    # Add the dependency using npm
    if [ "$is_dev_dependency" = true ]; then
        cd client && npm install --save-dev --legacy-peer-deps "$dependency" && cd ..
    else
        cd client && npm install --save --legacy-peer-deps "$dependency" && cd ..
    fi
    
    print_success "Added dependency: $dependency"
}

# Function to run Docker build and capture errors
run_docker_build() {
    print_status "Running Docker build (attempt $attempt of $MAX_ATTEMPTS)..."
    
    # Run the build and capture output
    if docker-compose -f docker-compose.simple.yml build client 2>&1 | tee /tmp/build.log; then
        print_success "Docker build completed successfully!"
        return 0
    else
        print_error "Docker build failed. Checking for missing dependencies..."
        return 1
    fi
}

# Main script logic
print_status "Starting auto-fix dependencies script..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Run the build loop
while [ $attempt -le $MAX_ATTEMPTS ]; do
    print_status "Attempt $attempt of $MAX_ATTEMPTS"
    
    # Run the build
    if run_docker_build; then
        print_success "Build successful! Starting services..."
        
        # Start the services
        if docker-compose -f docker-compose.simple.yml up -d; then
            print_success "Services started successfully!"
            
            # Show service URLs
            print_status "Service URLs:"
            echo "API Gateway: http://localhost:3080"
            echo "Client Application: http://localhost:3012"
            
            exit 0
        else
            print_error "Failed to start services."
            exit 1
        fi
    else
        # Extract the error from the log
        error_output=$(cat /tmp/build.log | grep -A 10 -B 5 "error during build" | tail -20)
        
        # Try to extract the missing dependency
        missing_dep=$(extract_dependency "$error_output")
        
        if [ -n "$missing_dep" ]; then
            print_status "Found missing dependency: $missing_dep"
            add_dependency "$missing_dep"
        else
            print_error "Could not identify missing dependency from error:"
            echo "$error_output"
            
            # Show the full error log for debugging
            print_status "Full error log available at /tmp/build.log"
            
            if [ $attempt -eq $MAX_ATTEMPTS ]; then
                print_error "Reached maximum number of attempts. Please check the error log and fix manually."
                exit 1
            fi
        fi
        
        attempt=$((attempt + 1))
        
        if [ $attempt -le $MAX_ATTEMPTS ]; then
            print_status "Waiting 5 seconds before retrying..."
            sleep 5
        fi
    fi
done

print_error "Failed to build after $MAX_ATTEMPTS attempts. Please check the error log and fix manually."
exit 1