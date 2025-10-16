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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if docker-compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed. Please install docker-compose and try again."
        exit 1
    fi
}

# Function to create .env file if it doesn't exist
create_env_file() {
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cp .env.example .env
        print_warning "Please update the .env file with your API keys and configuration."
    fi
}

# Function to setup the application
setup() {
    print_status "Setting up AI SaaS Platform..."
    
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Create .env file if needed
    create_env_file
    
    # Build and start services
    print_status "Building and starting services..."
    docker-compose up --build -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    print_status "Checking service health..."
    
    # Check API Gateway
    if curl -s http://localhost:3080/health > /dev/null; then
        print_success "API Gateway is healthy"
    else
        print_warning "API Gateway may not be ready yet"
    fi
    
    # Check Client Application
    if curl -s http://localhost:3012 > /dev/null; then
        print_success "Client Application is healthy"
    else
        print_warning "Client Application may not be ready yet"
    fi
    
    print_success "AI SaaS Platform is now running!"
    print_status "Access the application at: http://localhost:3012"
    print_status "API Gateway is available at: http://localhost:3080"
}

# Function to start the application
start() {
    print_status "Starting AI SaaS Platform..."
    docker-compose up -d
    
    print_success "AI SaaS Platform is now running!"
    print_status "Access the application at: http://localhost:3012"
    print_status "API Gateway is available at: http://localhost:3080"
}

# Function to stop the application
stop() {
    print_status "Stopping AI SaaS Platform..."
    docker-compose down
    
    print_success "AI SaaS Platform has been stopped."
}

# Function to restart the application
restart() {
    print_status "Restarting AI SaaS Platform..."
    docker-compose restart
    
    print_success "AI SaaS Platform has been restarted."
    print_status "Access the application at: http://localhost:3012"
    print_status "API Gateway is available at: http://localhost:3080"
}

# Function to view logs
logs() {
    if [ -z "$1" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$1"
    fi
}

# Function to clean up
clean() {
    print_status "Cleaning up AI SaaS Platform..."
    docker-compose down -v --remove-orphans
    
    print_success "AI SaaS Platform has been cleaned up."
}

# Function to show help
show_help() {
    echo "AI SaaS Platform Docker Run Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup    Setup and start the application (first time only)"
    echo "  start    Start the application"
    echo "  stop     Stop the application"
    echo "  restart  Restart the application"
    echo "  logs     Show logs for all services (or specify a service)"
    echo "  clean    Remove all containers, networks, and volumes"
    echo "  help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup           # Setup and start the application"
    echo "  $0 start           # Start the application"
    echo "  $0 logs api-gateway # Show logs for the API Gateway service"
    echo "  $0 clean           # Remove all containers, networks, and volumes"
}

# Main script logic
case "$1" in
    setup)
        setup
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs "$2"
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac