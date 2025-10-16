<div align="center">

# LibreChat

[![GitHub release](https://img.shields.io/github/release/danny-avila/LibreChat.svg)](https://github.com/danny-avila/LibreChat/releases)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](https://github.com/danny-avila/LibreChat/blob/main/LICENSE)
[![Discord](https://img.shields.io/discord/1072943531478362144.svg)](https://discord.gg/CEZJnJt8f3)
[![Docker Pulls](https://img.shields.io/docker/pulls/dannyavila/librechat.svg)](https://hub.docker.com/r/dannyavila/librechat/)
[![GitHub Repo stars](https://img.shields.io/github/stars/danny-avila/LibreChat?style=social)](https://github.com/danny-avila/LibreChat)

**Enhanced ChatGPT Clone**: Features OpenAI, Assistants API, Anthropic, Mistral, Google Palm & Gemini, and more. Supports custom conversation characters, speech synthesis, plugins, multi-user system, and much more!

[**Live Demo**](https://librechat.ai/) | [**Features**](#-features) | [**Quick Start**](#-quick-start) | [**Configuring AI Endpoints**](#-configuring-ai-endpoints) | [**FAQ**](#-faq) | [**Contributing**](#-contributing)

</div>

## ✨ Features

- 🤖 **Multiple AI Model Support**: OpenAI, Azure OpenAI, Anthropic, Google (PaLM & Gemini), Mistral, Groq, Perplexity, Together AI, OpenRouter, and more
- 🎭 **Custom Characters/Personas**: Create and customize AI personalities for different use cases
- 🎤 **Speech-to-Text & Text-to-Speech**: Voice input and output capabilities
- 🔌 **Plugin System**: Extensible architecture for custom functionality
- 👥 **Multi-User Support**: User management and authentication system
- 📁 **File Upload & Management**: Share documents, images, and other files
- 🔍 **Search & Filtering**: Find conversations and messages easily
- 🎨 **Customizable UI**: Dark/light themes, adjustable fonts, and more
- 🌐 **Internationalization**: Multi-language support
- 📱 **Mobile Responsive**: Works seamlessly on all devices
- 🔐 **Security**: JWT authentication, role-based access control
- 📊 **Analytics**: Usage tracking and insights
- 🔄 **Conversation Management**: Save, edit, and organize conversations

## 🚀 Quick Start

### Option 1: Docker (Recommended)

1. **Clone the repository**:

   ```bash
   git clone https://github.com/danny-avila/LibreChat.git
   cd LibreChat
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run with Docker Compose**:

   ```bash
   docker-compose up -d
   ```

4. **Access the application**:
   Open http://localhost:3080 in your browser

### Option 2: Manual Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build the application**:

   ```bash
   npm run frontend
   ```

4. **Start the server**:

   ```bash
   npm run backend
   ```

5. **Access the application**:
   Open http://localhost:3080 in your browser

## 🔧 Configuring AI Endpoints

### OpenAI

Add your OpenAI API key to your `.env` file:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### Azure OpenAI

Configure Azure OpenAI in your `.env` file:

```bash
AZURE_OPENAI_API_KEY=your_azure_api_key
AZURE_OPENAI_API_INSTANCE_NAME=your_azure_instance
AZURE_OPENAI_API_DEPLOYMENT_NAME=your_azure_deployment
AZURE_OPENAI_API_VERSION=2023-12-01-preview
```

### Anthropic

Add your Anthropic API key:

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Google AI

Configure Google AI (PaLM/Gemini):

```bash
GOOGLE_API_KEY=your_google_api_key
```

### And Many More!

LibreChat supports numerous AI providers. Check the [documentation](https://librechat.ai/docs) for the complete list and configuration details.

## ❓ FAQ

**Q: Do I need API keys for all providers?**
A: No, you only need API keys for the providers you want to use.

**Q: Can I use LibreChat commercially?**
A: Yes, LibreChat is licensed under ISC, which allows commercial use.

**Q: How do I add custom AI providers?**
A: Check the [developer documentation](https://librechat.ai/docs/developers) for adding custom providers.

**Q: Is my data secure?**
A: LibreChat is self-hosted, so you have full control over your data. We recommend following security best practices.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📚 Documentation

For comprehensive documentation, visit [librechat.ai/docs](https://librechat.ai/docs)

## 🆘 Support

- 📖 [Documentation](https://librechat.ai/docs)
- 💬 [Discord Community](https://discord.gg/CEZJnJt8f3)
- 🐛 [GitHub Issues](https://github.com/danny-avila/LibreChat/issues)

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=danny-avila/LibreChat&type=Date)](https://star-history.com/#danny-avila/LibreChat&Date)

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by the LibreChat community**

[![GitHub sponsors](https://img.shields.io/github/sponsors/danny-avila?style=social)](https://github.com/sponsors/danny-avila)

</div>
