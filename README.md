# Ornina AI Platform

A comprehensive AI SaaS platform for image and video generation with bilingual support (English/Arabic).

## Features

- **Multi-Provider AI Generation**: Support for multiple AI providers including DALL-E 3, Midjourney, Stable Diffusion, Veo3, and Sora2
- **Bilingual Interface**: Full support for English and Arabic with RTL layout for Arabic
- **Microservices Architecture**: Scalable and maintainable service-oriented architecture
- **Custom Branding**: Professional appearance with Ornina branding
- **Docker Support**: Easy deployment with Docker and Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- API keys for AI providers (see Environment Variables)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/bardoun7894/chatOrnina.git
   cd chatOrnina
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Run with Docker**:
   ```bash
   chmod +x scripts/docker-run.sh
   ./scripts/docker-run.sh setup
   ```

4. **Access the application**:
   - Client Application: http://localhost:3012
   - API Gateway: http://localhost:3080

## Environment Variables

Create a `.env` file with the following variables:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-mongodb-password-here

# Chat AI Providers
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
GOOGLE_API_KEY=your-google-api-key-here

# KIE AI API Configuration (Primary Provider)
KIE_API_KEY=your-kie-api-key-here
KIE_API_URL=https://api.kie.ai

# Direct API Configuration (Fallback Providers)
OPENAI_API_URL=https://api.openai.com/v1
MIDJOURNEY_API_KEY=your-midjourney-api-key-here
MIDJOURNEY_API_URL=https://api.midjourney.com/v1
STABLE_DIFFUSION_API_KEY=your-stable-diffusion-api-key-here
STABLE_DIFFUSION_API_URL=https://api.stability.ai/v1
BANANA_API_KEY=your-banana-api-key-here
BANANA_API_URL=https://api.banana.dev/v1
VEO3_API_KEY=your-veo3-api-key-here
VEO3_API_URL=https://api.veo3.ai
SORA2_API_KEY=your-sora2-api-key-here
SORA2_API_URL=https://api.sora2.ai
```

## Architecture

The application consists of the following microservices:

- **API Gateway**: Central routing and authentication service
- **Image Generation Service**: Handles image generation with multiple providers
- **Video Generation Service**: Handles video generation with multiple providers
- **Client Application**: React-based frontend with bilingual support
- **MongoDB**: Data storage
- **Redis**: Caching and session management
- **Nginx**: Reverse proxy and load balancer

## Docker Commands

```bash
# Start the application
./scripts/docker-run.sh start

# Stop the application
./scripts/docker-run.sh stop

# Restart the application
./scripts/docker-run.sh restart

# View logs
./scripts/docker-run.sh logs

# View logs for a specific service
./scripts/docker-run.sh logs api-gateway

# Clean up all containers, networks, and volumes
./scripts/docker-run.sh clean
```

## Local Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run preview`: Preview the production build
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix ESLint issues

## AI Providers

The application supports the following AI providers:

### Image Generation
- **DALL-E 3**: High-quality image generation
- **Midjourney**: Artistic image generation
- **Stable Diffusion**: Open-source image generation
- **Banana**: Alternative image generation provider

### Video Generation
- **Veo3**: High-quality video generation
- **Sora2**: Advanced video generation
- **KIE API**: Unified API for multiple AI models

## Language Support

The application supports:
- **English** (en): Full support with LTR layout
- **Arabic** (ar): Full support with RTL layout and proper typography

## Security

- JWT-based authentication
- Non-root Docker users
- Private Docker networks
- Environment variable protection
- HTTPS support in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit your changes
5. Push to the branch
6. Create a Pull Request

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub.