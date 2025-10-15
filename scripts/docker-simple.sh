#!/bin/bash

# AI SaaS Platform Simple Docker Script

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
    sleep 10
    
    # Start application services
    print_status "Starting application services..."
    docker-compose -f docker-compose.simple.yml up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
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
        if check_env_file; then
            build_images
            start_services
            check_health
            show_urls
        else
            print_error "Please configure .env file and run this script again."
            exit 1
        fi
        ;;
    "start")
        print_status "Starting services..."
        check_docker
        check_env_file
        start_services
        check_health
        show_urls
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        start_services
        check_health
        ;;
    "logs")
        show_logs
        ;;
    "build")
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
    *)
        echo "AI SaaS Platform Simple Docker Script"
        echo ""
        echo "Usage: $0 {setup|start|stop|restart|logs|build|health|cleanup|urls}"
        echo ""
        echo "Commands:"
        echo "  setup    - Set up the environment (first time setup)"
        echo "  start    - Start all services"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - Show logs for all services"
        echo "  build    - Build Docker images"
        echo "  health   - Check service health"
        echo "  cleanup  - Clean up containers and volumes"
        echo "  urls     - Show service URLs"
        echo ""
        echo "Examples:"
        echo "  $0 setup     # First time setup"
        echo "  $0 start     # Start services"
        echo "  $0 logs      # View logs"
        echo "  $0 stop      # Stop services"
        exit 1
        ;;
esac

exit 0