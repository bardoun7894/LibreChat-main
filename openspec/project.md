# Project Context

## Purpose
Develop and launch a comprehensive AI-powered SaaS platform featuring an advanced chatbot similar to GPT capable of interacting in both Arabic and English, along with professional-grade image and video generation tools integrated with audio effects and character voice LIPS. The platform will target both individuals and companies to facilitate communication, creativity, and accelerate digital production processes (لتسهيل التواصل، الإبداع، وتسريع عمليات الإنتاج الرقمي).

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS with RTL support
- **Backend**: Node.js, Express, MongoDB
- **AI Integration**:
  - Primary: OpenAI GPT-4/GPT-4o (strong Arabic capabilities)
  - Secondary: Anthropic Claude, Google Gemini
  - Image Generation: DALL-E 3, Midjourney API, Stable Diffusion
  - Video Generation: RunwayML, Pika Labs, or similar APIs
  - Audio/Voice: ElevenLabs for character voices and LIPS synchronization
  - Code Generation: GitHub Copilot API, CodeT5
  - Design Analysis: Custom vision models for design-to-prompt conversion
  - MCP Integration: Model Context Protocol for extending AI capabilities
  - Workflow Automation: n8n integration for custom workflows and automation
- **Authentication**: JWT, OAuth2, LDAP support
- **Payment**: Stripe for subscription management
- **Deployment**: Docker, Docker Compose, Cloud hosting (AWS/Azure)
- **File Storage**: S3, CloudFront for CDN
- **Search**: Meilisearch with Arabic text search optimization
- **Internationalization**: i18next for Arabic/English language support

## Project Conventions

### Code Style
- ESLint and Prettier for code formatting
- TypeScript for type safety
- Component-based architecture for frontend
- RESTful API design for backend
- Arabic language support (RTL layout considerations)
- Arabic naming conventions for user-facing elements
- Microservices architecture for different AI tools
- MCP (Model Context Protocol) server implementation for tool extensions
- n8n workflow integration for automation and custom processes

### Architecture Patterns
- Microservices architecture with separate API and client
- Modular plugin system for AI providers
- Event-driven architecture for real-time features
- Repository pattern for data access
- Middleware-based request processing
- Language-aware components for Arabic/English switching
- Subscription-based access control
- Queue-based processing for heavy AI tasks

### Testing Strategy
- Jest for unit testing
- Playwright for end-to-end testing
- API testing with Supertest
- Coverage requirements: minimum 80% for critical paths
- Arabic language testing as part of QA process
- RTL layout testing for Arabic UI components
- Payment gateway testing with Stripe test environment
- Load testing for AI processing queues
- MCP server testing and validation
- n8n workflow integration testing

### Git Workflow
- Feature branches for new development
- Main branch for production releases
- Semantic versioning for releases
- Commit messages follow conventional format
- Pull reviews required for all changes
- Arabic documentation alongside English
- Separate branches for subscription tiers

## Domain Context
This is a comprehensive AI SaaS platform targeting both Arabic and English markets. Key domain considerations:
- Bilingual AI chat interface with advanced text and voice interaction
- Professional image generation with customization options
- AI video generation using templates or text instructions
- Code generation capabilities for developers
- Design analysis tool to convert visual designs to text prompts
- User-friendly dashboard for managing all tools
- Subscription-based model with monthly and annual plans
- Scalability for future service integrations
- MCP server for extending AI capabilities with custom tools
- n8n integration for workflow automation and process optimization
- Arabic text processing and RTL (right-to-left) layout requirements
- Cultural adaptations for Middle Eastern users
- Integration with multiple AI providers for different capabilities
- Compliance with regional regulations and cultural norms
- Support for Arabic content moderation and filtering
- Arabic typography and font rendering optimization

## Important Constraints
- **Licensing**: Must comply with LibreChat's MIT license and Terms of Service
- **Security**: Proper handling of API keys and user data
- **Performance**: Optimized for Arabic text processing and rendering
- **Scalability**: Must handle potential growth in Arabic-speaking user base
- **Accessibility**: WCAG compliance with Arabic language considerations
- **Data Privacy**: Compliance with data protection regulations
- **AI Model Limitations**: Working with existing models' Arabic capabilities rather than building custom models
- **Subscription Management**: Secure payment processing and tier access control
- **Resource Management**: Efficient queue management for AI processing tasks
- **Cost Control**: Monitoring and limiting API usage per subscription tier

## External Dependencies
- **AI Providers**: 
  - OpenAI (GPT-4/GPT-4o) - Primary choice for Arabic language support
  - Anthropic Claude - Secondary option
  - Google Gemini - Alternative option
  - Image Generation: DALL-E 3, Midjourney API, Stable Diffusion
  - Video Generation: RunwayML, Pika Labs
  - Audio/Voice: ElevenLabs for character voices
  - Code Generation: GitHub Copilot API
- **Database**: MongoDB for data persistence with Arabic text indexing
- **Search**: Meilisearch with Arabic tokenization and stemming
- **Authentication**: Various OAuth providers (Google, GitHub, etc.)
- **Payment**: Stripe for subscription management
- **File Storage**: S3, CloudFront for CDN
- **Deployment**: Docker containers for consistent deployment
- **Monitoring**: Logging and error tracking systems
- **Arabic Language Libraries**: Arabic text processing, RTL layout utilities
- **Queue Management**: Redis/BullMQ for AI task processing
- **Email Services**: SendGrid or similar for user notifications
- **MCP Server**: Custom MCP server implementation for tool extensions
- **Workflow Automation**: n8n for custom workflow creation and execution
- **Process Orchestration**: n8n nodes for AI tool chaining and automation