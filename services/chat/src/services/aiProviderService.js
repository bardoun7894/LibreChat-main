const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google-ai/generativelanguage');
const { GoogleAuth } = require('google-auth-library');

class AIProviderService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    this.googleAuth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  async generateResponse(provider, model, messages, options = {}) {
    switch (provider) {
      case 'openai':
        return await this.generateOpenAIResponse(model, messages, options);
      case 'anthropic':
        return await this.generateAnthropicResponse(model, messages, options);
      case 'google':
        return await this.generateGoogleResponse(model, messages, options);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  async generateOpenAIResponse(model, messages, options = {}) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: model || 'gpt-4',
        messages: this.formatMessagesForOpenAI(messages),
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048,
        stream: options.stream || false,
      });

      if (options.stream) {
        return completion;
      }

      return {
        content: completion.choices[0].message.content,
        role: 'assistant',
        metadata: {
          provider: 'openai',
          model: model,
          usage: completion.usage,
        }
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  async generateAnthropicResponse(model, messages, options = {}) {
    try {
      const completion = await this.anthropic.messages.create({
        model: model || 'claude-3-opus-20240229',
        max_tokens: options.maxTokens || 2048,
        temperature: options.temperature || 0.7,
        messages: this.formatMessagesForAnthropic(messages),
        stream: options.stream || false,
      });

      if (options.stream) {
        return completion;
      }

      return {
        content: completion.content[0].text,
        role: 'assistant',
        metadata: {
          provider: 'anthropic',
          model: model,
          usage: completion.usage,
        }
      };
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }

  async generateGoogleResponse(model, messages, options = {}) {
    try {
      const authClient = await this.googleAuth.getClient();
      const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
      const generativeModel = googleAI.getGenerativeModel({ 
        model: model || 'gemini-pro' 
      });

      const prompt = this.formatMessagesForGoogle(messages);
      const result = await generativeModel.generateContent(prompt);
      const response = await result.response;

      return {
        content: response.text(),
        role: 'assistant',
        metadata: {
          provider: 'google',
          model: model,
          usage: response.usageMetadata,
        }
      };
    } catch (error) {
      console.error('Google AI API error:', error);
      throw new Error(`Google AI API error: ${error.message}`);
    }
  }

  formatMessagesForOpenAI(messages) {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  formatMessagesForAnthropic(messages) {
    // Filter out system messages and handle them separately
    const systemMessages = messages.filter(msg => msg.role === 'system');
    const conversationMessages = messages.filter(msg => msg.role !== 'system');

    const formattedMessages = conversationMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }));

    // Add system message if present
    if (systemMessages.length > 0) {
      return {
        system: systemMessages[0].content,
        messages: formattedMessages,
      };
    }

    return formattedMessages;
  }

  formatMessagesForGoogle(messages) {
    // Google AI API expects a single prompt string
    // We'll format the conversation into a single prompt
    let prompt = '';
    
    for (const message of messages) {
      if (message.role === 'system') {
        prompt += `System: ${message.content}\n\n`;
      } else if (message.role === 'user') {
        prompt += `Human: ${message.content}\n\n`;
      } else if (message.role === 'assistant') {
        prompt += `Assistant: ${message.content}\n\n`;
      }
    }
    
    prompt += 'Assistant: ';
    return prompt;
  }

  async detectLanguage(text) {
    // Simple language detection based on character patterns
    // In a production environment, you would use a proper language detection library
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text) ? 'ar' : 'en';
  }

  async translateText(text, targetLanguage) {
    // This is a placeholder for translation functionality
    // In a production environment, you would integrate with a translation service
    // For now, we'll just return the original text
    return text;
  }

  async isTextRTL(text) {
    // Check if text contains RTL characters
    const rtlPattern = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return rtlPattern.test(text);
  }

  async getProviderCapabilities(provider) {
    switch (provider) {
      case 'openai':
        return {
          models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'],
          maxTokens: 128000,
          supportsStreaming: true,
          supportsImages: true,
          supportsTools: true,
        };
      case 'anthropic':
        return {
          models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
          maxTokens: 200000,
          supportsStreaming: true,
          supportsImages: true,
          supportsTools: true,
        };
      case 'google':
        return {
          models: ['gemini-pro', 'gemini-pro-vision'],
          maxTokens: 32768,
          supportsStreaming: true,
          supportsImages: true,
          supportsTools: false,
        };
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }
}

module.exports = AIProviderService;