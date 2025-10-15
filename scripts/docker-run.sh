#!/bin/bash

# AI SaaS Platform Docker Run Script

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

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed."
}

# Check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_warning "Please update .env file with your configuration values."
        return 1
    else
        print_success ".env file found."
        return 0
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p temp
    mkdir -p uploads
    
    print_success "Directories created."
}

# Generate package-lock.json files if they don't exist
generate_lock_files() {
    print_status "Generating package-lock.json files..."
    
    # Generate lock file for root directory
    if [ ! -f package-lock.json ]; then
        print_status "Generating package-lock.json for root directory..."
        npm install --package-lock-only --legacy-peer-deps
    fi
    
    # Generate lock file for client directory
    if [ ! -f client/package-lock.json ]; then
        print_status "Generating package-lock.json for client..."
        cd client
        npm install --package-lock-only --legacy-peer-deps
        cd ..
    fi
    
    print_success "Package-lock.json files generated."
}

# Create health check script if it doesn't exist
create_health_check() {
    if [ ! -f healthcheck.js ]; then
        print_status "Creating health check script..."
        cat > healthcheck.js << 'EOF'
const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3080,
  path: '/health',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', () => {
  process.exit(1);
});

req.on('timeout', () => {
  req.destroy();
  process.exit(1);
});

req.end();
EOF
        print_success "Health check script created."
    fi
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    
    docker-compose -f docker-compose.simple.yml build
    
    print_success "Docker images built successfully."
}

# Start services
start_services() {
    print_status "Starting services..."
    
    # Start database services first
    print_status "Starting database services..."
    docker-compose -f docker-compose.simple.yml up -d mongodb redis
    
    # Wait for databases to be ready
    print_status "Waiting for databases to be ready..."
    sleep 15
    
    # Start application services
    print_status "Starting application services..."
    docker-compose -f docker-compose.simple.yml up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 45
    
    print_success "All services started successfully."
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    services=("mongodb" "redis" "api-gateway" "client")
    
    all_healthy=true
    
    for service in "${services[@]}"; do
        if docker-compose -f docker-compose.simple.yml ps | grep -q "${service}.*Up"; then
            print_success "$service is running."
        else
            print_error "$service is not running."
            all_healthy=false
        fi
    done
    
    if [ "$all_healthy" = true ]; then
        print_success "All services are healthy."
    else
        print_warning "Some services are not healthy. Check logs for details."
    fi
}

# Show logs
show_logs() {
    print_status "Showing logs..."
    docker-compose -f docker-compose.simple.yml logs -f --tail=100
}

# Stop services
stop_services() {
    print_status "Stopping services..."
    docker-compose -f docker-compose.simple.yml down
    print_success "All services stopped."
}

# Clean up
cleanup() {
    print_status "Cleaning up..."
    docker-compose -f docker-compose.simple.yml down -v --remove-orphans
    docker system prune -f
    print_success "Cleanup completed."
}

# Show service URLs
show_urls() {
    print_status "Service URLs:"
    echo "API Gateway: http://localhost:3080"
    echo "Client Application: http://localhost:3012"
    echo ""
    echo "Health Checks:"
    echo "API Gateway: http://localhost:3080/health"
    echo "Client Application: http://localhost:3012/health"
}

# Main script logic
case "$1" in
    "setup")
        print_status "Setting up Docker environment..."
        check_docker
        create_directories
        check_env_file
        generate_lock_files
        create_health_check
        build_images
        start_services
        sleep 10
        check_health
        show_urls
        print_success "Setup complete! The application is now running."
        ;;
    "start")
        print_status "Starting services..."
        check_docker
        generate_lock_files
        create_health_check
        build_images
        start_services
        sleep 10
        check_health
        show_urls
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        start_services
        sleep 10
        check_health
        ;;
    "logs")
        show_logs
        ;;
    "build")
        generate_lock_files
        build_images
        ;;
    "health")
        check_health
        ;;
    "cleanup")
        cleanup
        ;;
    "urls")
        show_urls
        ;;
    "test")
        print_status "Testing the application..."
        
        # Test API Gateway
        print_status "Testing API Gateway..."
        if curl -f -s http://localhost:3080/health > /dev/null; then
            print_success "API Gateway is responding."
        else
            print_error "API Gateway is not responding."
        fi
        
        # Test Client Application
        print_status "Testing Client Application..."
        if curl -f -s http://localhost:3012/health > /dev/null; then
            print_success "Client Application is responding."
        else
            print_error "Client Application is not responding."
        fi
        
        print_status "Test complete."
        ;;
    *)
        echo "AI SaaS Platform Docker Run Script"
        echo ""
        echo "Usage: $0 {setup|start|stop|restart|logs|build|health|cleanup|urls|test}"
        echo ""
        echo "Commands:"
        echo "  setup    - Set up the environment and start services"
        echo "  start    - Start all services"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - Show logs for all services"
        echo "  build    - Build Docker images"
        echo "  health   - Check service health"
        echo "  cleanup  - Clean up containers and volumes"
        echo "  urls     - Show service URLs"
        echo "  test     - Test if services are responding"
        echo ""
        echo "Examples:"
        echo "  $0 setup     # First time setup"
        echo "  $0 start     # Start services"
        echo "  $0 test      # Test services"
        echo "  $0 stop      # Stop services"
        exit 1
        ;;
esac

exit 0