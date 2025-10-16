const axios = require('axios');

class ImageProviderService {
  constructor() {
    // KIE API Configuration
    this.kieConfig = {
      baseUrl: process.env.KIE_API_URL || 'https://api.kie.ai',
      apiKey: process.env.KIE_API_KEY,
      timeout: 120000, // 2 minutes timeout for image generation
    };

    // Direct DALL-E 3 API Configuration (fallback)
    this.dalle3Config = {
      baseUrl: process.env.OPENAI_API_URL || 'https://api.openai.com/v1',
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 120000,
    };

    // Direct Midjourney API Configuration (fallback)
    this.midjourneyConfig = {
      baseUrl: process.env.MIDJOURNEY_API_URL || 'https://api.midjourney.com/v1',
      apiKey: process.env.MIDJOURNEY_API_KEY,
      timeout: 300000, // 5 minutes for Midjourney
    };

    // Direct Stable Diffusion API Configuration (fallback)
    this.stableDiffusionConfig = {
      baseUrl: process.env.STABLE_DIFFUSION_API_URL || 'https://api.stability.ai/v1',
      apiKey: process.env.STABLE_DIFFUSION_API_KEY,
      timeout: 120000,
    };

    // Direct Banana API Configuration (fallback)
    this.bananaConfig = {
      baseUrl: process.env.BANANA_API_URL || 'https://api.banana.dev/v1',
      apiKey: process.env.BANANA_API_KEY,
      timeout: 120000,
    };
  }

  /**
   * Generate an image using KIE API
   * @param {Object} params - Image generation parameters
   * @param {string} params.prompt - Text prompt for image generation
   * @param {string} params.negativePrompt - Negative prompt
   * @param {Object} params.settings - Generation settings
   * @param {string} params.model - Model to use (dalle3, midjourney, stable-diffusion, etc.)
   * @returns {Promise<Object>} Generated image data
   */
  async generateImage(params) {
    try {
      const { prompt, negativePrompt, settings, model } = params;
      
      // Prepare the request payload for KIE API
      const payload = {
        prompt,
        negative_prompt: negativePrompt,
        model: model || 'dalle3',
        settings: {
          width: settings?.width || 1024,
          height: settings?.height || 1024,
          steps: settings?.steps || 20,
          cfg_scale: settings?.cfgScale || 7,
          sampler: settings?.sampler || 'DPM++ 2M Karras',
          style: settings?.style || 'realistic',
          seed: settings?.seed || null,
        },
      };

      // Make the request to KIE API
      const response = await axios.post(
        `${this.kieConfig.baseUrl}/v1/image/generate`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.kieConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: this.kieConfig.timeout,
        }
      );

      return this.formatKieResponse(response.data);
    } catch (error) {
      console.error('KIE API image generation error:', error);
      
      // Fallback to direct API if KIE fails
      if (params.model === 'dalle3') {
        return this.generateDalle3Image(params);
      } else if (params.model === 'midjourney') {
        return this.generateMidjourneyImage(params);
      } else if (params.model === 'stable-diffusion') {
        return this.generateStableDiffusionImage(params);
      } else if (params.model === 'banana') {
        return this.generateBananaImage(params);
      }
      
      throw new Error(`KIE API image generation error: ${error.message}`);
    }
  }

  /**
   * Generate an image using DALL-E 3 API (direct fallback)
   * @param {Object} params - Image generation parameters
   * @returns {Promise<Object>} Generated image data
   */
  async generateDalle3Image(params) {
    try {
      const { prompt, negativePrompt, settings } = params;
      
      const payload = {
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: `${settings?.width || 1024}x${settings?.height || 1024}`,
        quality: settings?.quality || 'standard',
        style: settings?.style === 'realistic' ? 'natural' : 'vivid',
      };

      const response = await axios.post(
        `${this.dalle3Config.baseUrl}/images/generations`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.dalle3Config.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: this.dalle3Config.timeout,
        }
      );

      return this.formatDalle3Response(response.data);
    } catch (error) {
      console.error('DALL-E 3 API image generation error:', error);
      throw new Error(`DALL-E 3 API image generation error: ${error.message}`);
    }
  }

  /**
   * Generate an image using Midjourney API (direct fallback)
   * @param {Object} params - Image generation parameters
   * @returns {Promise<Object>} Generated image data
   */
  async generateMidjourneyImage(params) {
    try {
      const { prompt, negativePrompt, settings } = params;
      
      const payload = {
        prompt,
        negative_prompt: negativePrompt,
        mode: 'generation',
        width: settings?.width || 1024,
        height: settings?.height || 1024,
        style: settings?.style || 'realistic',
        seed: settings?.seed || null,
      };

      const response = await axios.post(
        `${this.midjourneyConfig.baseUrl}/imagine`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.midjourneyConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: this.midjourneyConfig.timeout,
        }
      );

      return this.formatMidjourneyResponse(response.data);
    } catch (error) {
      console.error('Midjourney API image generation error:', error);
      throw new Error(`Midjourney API image generation error: ${error.message}`);
    }
  }

  /**
   * Generate an image using Stable Diffusion API (direct fallback)
   * @param {Object} params - Image generation parameters
   * @returns {Promise<Object>} Generated image data
   */
  async generateStableDiffusionImage(params) {
    try {
      const { prompt, negativePrompt, settings } = params;
      
      const payload = {
        prompt,
        negative_prompt: negativePrompt,
        width: settings?.width || 1024,
        height: settings?.height || 1024,
        steps: settings?.steps || 20,
        cfg_scale: settings?.cfgScale || 7,
        sampler: settings?.sampler || 'DPM++ 2M Karras',
        seed: settings?.seed || null,
      };

      const response = await axios.post(
        `${this.stableDiffusionConfig.baseUrl}/text-to-image`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.stableDiffusionConfig.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: this.stableDiffusionConfig.timeout,
        }
      );

      return this.formatStableDiffusionResponse(response.data);
    } catch (error) {
      console.error('Stable Diffusion API image generation error:', error);
      throw new Error(`Stable Diffusion API image generation error: ${error.message}`);
    }
  }

  /**
   * Generate an image using Banana API (direct fallback)
   * @param {Object} params - Image generation parameters
   * @returns {Promise<Object>} Generated image data
   */
  async generateBananaImage(params) {
    try {
      const { prompt, negativePrompt, settings } = params;
      
      const payload = {
        prompt,
        negative_prompt: negativePrompt,
        model: 'runwayml/stable-diffusion-v1-5',
        width: settings?.width || 1024,
        height: settings?.height || 1024,
        num_inference_steps: settings?.steps || 20,
        guidance_scale: settings?.cfgScale || 7,
        seed: settings?.seed || null,
      };

      const response = await axios.post(
        `${this.bananaConfig.baseUrl}/run`,
        {
          modelKey: 'runwayml/stable-diffusion-v1-5',
          modelInputs: payload,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.bananaConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: this.bananaConfig.timeout,
        }
      );

      return this.formatBananaResponse(response.data);
    } catch (error) {
      console.error('Banana API image generation error:', error);
      throw new Error(`Banana API image generation error: ${error.message}`);
    }
  }

  /**
   * Edit an image using KIE API
   * @param {string} imageUrl - URL of the image to edit
   * @param {string} prompt - Edit prompt
   * @param {Object} options - Edit options
   * @returns {Promise<Object>} Edited image data
   */
  async editImage(imageUrl, prompt, options = {}) {
    try {
      const payload = {
        image_url: imageUrl,
        prompt,
        options: {
          strength: options.strength || 0.7,
          guidance_scale: options.guidanceScale || 7.5,
          seed: options.seed || null,
        },
      };

      const response = await axios.post(
        `${this.kieConfig.baseUrl}/v1/image/edit`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.kieConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: this.kieConfig.timeout,
        }
      );

      return this.formatKieResponse(response.data);
    } catch (error) {
      console.error('KIE API image edit error:', error);
      throw new Error(`KIE API image edit error: ${error.message}`);
    }
  }

  /**
   * Upscale an image using KIE API
   * @param {string} imageUrl - URL of the image to upscale
   * @param {number} scaleFactor - Factor to upscale by (2, 4)
   * @returns {Promise<Object>} Upscaled image data
   */
  async upscaleImage(imageUrl, scaleFactor = 2) {
    try {
      const payload = {
        image_url: imageUrl,
        scale_factor: scaleFactor,
      };

      const response = await axios.post(
        `${this.kieConfig.baseUrl}/v1/image/upscale`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.kieConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: this.kieConfig.timeout,
        }
      );

      return this.formatKieResponse(response.data);
    } catch (error) {
      console.error('KIE API image upscale error:', error);
      throw new Error(`KIE API image upscale error: ${error.message}`);
    }
  }

  /**
   * Get available models from KIE API
   * @returns {Promise<Array>} Available models
   */
  async getAvailableModels() {
    try {
      const response = await axios.get(
        `${this.kieConfig.baseUrl}/v1/models`,
        {
          headers: {
            'Authorization': `Bearer ${this.kieConfig.apiKey}`,
          },
        }
      );

      return response.data.models || [];
    } catch (error) {
      console.error('KIE API get models error:', error);
      // Return default models if API fails
      return [
        { id: 'dalle3', name: 'DALL-E 3', type: 'image' },
        { id: 'midjourney', name: 'Midjourney', type: 'image' },
        { id: 'stable-diffusion', name: 'Stable Diffusion', type: 'image' },
        { id: 'banana', name: 'Banana', type: 'image' },
      ];
    }
  }

  /**
   * Get provider capabilities
   * @param {string} provider - Provider name
   * @returns {Object} Provider capabilities
   */
  async getProviderCapabilities(provider) {
    switch (provider) {
      case 'kie':
        return {
          models: ['dalle3', 'midjourney', 'stable-diffusion', 'banana'],
          maxResolution: '2048x2048',
          supportedFormats: ['png', 'jpg'],
          styles: ['realistic', 'artistic', 'anime', '3d'],
          supportsEditing: true,
          supportsUpscaling: true,
          maxPrompts: 4000,
        };
      case 'dalle3':
        return {
          models: ['dall-e-3'],
          maxResolution: '1024x1024',
          supportedFormats: ['png'],
          styles: ['natural', 'vivid'],
          supportsEditing: false,
          supportsUpscaling: false,
          maxPrompts: 4000,
        };
      case 'midjourney':
        return {
          models: ['midjourney-v6'],
          maxResolution: '2048x2048',
          supportedFormats: ['png', 'jpg'],
          styles: ['realistic', 'artistic', 'anime', '3d'],
          supportsEditing: true,
          supportsUpscaling: false,
          maxPrompts: 4000,
        };
      case 'stable-diffusion':
        return {
          models: ['stable-diffusion-v1-5', 'stable-diffusion-xl'],
          maxResolution: '2048x2048',
          supportedFormats: ['png', 'jpg'],
          styles: ['realistic', 'artistic', 'anime', '3d'],
          supportsEditing: true,
          supportsUpscaling: true,
          maxPrompts: 4000,
        };
      case 'banana':
        return {
          models: ['runwayml/stable-diffusion-v1-5'],
          maxResolution: '1024x1024',
          supportedFormats: ['png', 'jpg'],
          styles: ['realistic', 'artistic', 'anime', '3d'],
          supportsEditing: false,
          supportsUpscaling: false,
          maxPrompts: 2000,
        };
      default:
        throw new Error(`Unsupported image provider: ${provider}`);
    }
  }

  /**
   * Calculate cost for image generation
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @param {string} model - Model used
   * @returns {number} Cost in USD
   */
  calculateCost(width, height, model) {
    // KIE API pricing (example rates)
    const megapixel = (width * height) / 1000000;
    const baseCost = 0.05; // $0.05 per megapixel
    
    const modelMultiplier = {
      'dalle3': 1.2,
      'midjourney': 1.5,
      'stable-diffusion': 0.8,
      'banana': 0.6,
    }[model] || 1;
    
    return baseCost * megapixel * modelMultiplier;
  }

  /**
   * Calculate cost for image editing
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @param {string} model - Model used
   * @returns {number} Cost in USD
   */
  calculateEditCost(width, height, model) {
    // KIE API edit pricing (example rates)
    const megapixel = (width * height) / 1000000;
    const baseCost = 0.04; // $0.04 per megapixel
    
    const modelMultiplier = {
      'dalle3': 1.2,
      'midjourney': 1.5,
      'stable-diffusion': 0.8,
      'banana': 0.6,
    }[model] || 1;
    
    return baseCost * megapixel * modelMultiplier;
  }

  /**
   * Calculate cost for image upscaling
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @param {number} scaleFactor - Scale factor
   * @returns {number} Cost in USD
   */
  calculateUpscaleCost(width, height, scaleFactor) {
    // KIE API upscale pricing (example rates)
    const megapixel = (width * height) / 1000000;
    const baseCost = 0.03; // $0.03 per megapixel
    
    // Higher scale factor costs more
    const scaleMultiplier = scaleFactor === 4 ? 1.5 : 1;
    
    return baseCost * megapixel * scaleMultiplier;
  }

  /**
   * Format KIE API response
   * @param {Object} data - Raw response data
   * @returns {Object} Formatted response
   */
  formatKieResponse(data) {
    return {
      id: data.id,
      imageUrl: data.image_url,
      thumbnailUrl: data.thumbnail_url,
      status: data.status,
      prompt: data.prompt,
      model: data.model,
      width: data.width,
      height: data.height,
      style: data.style,
      createdAt: data.created_at,
      cost: this.calculateCost(data.width, data.height, data.model),
    };
  }

  /**
   * Format DALL-E 3 API response
   * @param {Object} data - Raw response data
   * @returns {Object} Formatted response
   */
  formatDalle3Response(data) {
    const image = data.data[0];
    return {
      id: image.url,
      imageUrl: image.url,
      thumbnailUrl: image.url,
      status: 'completed',
      prompt: data.prompt,
      model: 'dalle3',
      width: 1024,
      height: 1024,
      style: data.style === 'natural' ? 'realistic' : 'artistic',
      createdAt: new Date().toISOString(),
      cost: this.calculateCost(1024, 1024, 'dalle3'),
    };
  }

  /**
   * Format Midjourney API response
   * @param {Object} data - Raw response data
   * @returns {Object} Formatted response
   */
  formatMidjourneyResponse(data) {
    return {
      id: data.id,
      imageUrl: data.image_url,
      thumbnailUrl: data.thumbnail_url,
      status: data.status,
      prompt: data.prompt,
      model: 'midjourney',
      width: data.width || 1024,
      height: data.height || 1024,
      style: data.style,
      createdAt: data.created_at,
      cost: this.calculateCost(data.width || 1024, data.height || 1024, 'midjourney'),
    };
  }

  /**
   * Format Stable Diffusion API response
   * @param {Object} data - Raw response data
   * @returns {Object} Formatted response
   */
  formatStableDiffusionResponse(data) {
    const image = data.images[0];
    return {
      id: data.id,
      imageUrl: `data:image/png;base64,${image}`,
      thumbnailUrl: `data:image/png;base64,${image}`,
      status: 'completed',
      prompt: data.prompt,
      model: 'stable-diffusion',
      width: data.width || 1024,
      height: data.height || 1024,
      style: 'realistic',
      createdAt: new Date().toISOString(),
      cost: this.calculateCost(data.width || 1024, data.height || 1024, 'stable-diffusion'),
    };
  }

  /**
   * Format Banana API response
   * @param {Object} data - Raw response data
   * @returns {Object} Formatted response
   */
  formatBananaResponse(data) {
    const image = data.modelOutputs[0].image_base64;
    return {
      id: data.id,
      imageUrl: `data:image/png;base64,${image}`,
      thumbnailUrl: `data:image/png;base64,${image}`,
      status: 'completed',
      prompt: data.modelInputs.prompt,
      model: 'banana',
      width: data.modelInputs.width || 1024,
      height: data.modelInputs.height || 1024,
      style: 'realistic',
      createdAt: new Date().toISOString(),
      cost: this.calculateCost(data.modelInputs.width || 1024, data.modelInputs.height || 1024, 'banana'),
    };
  }
}

module.exports = ImageProviderService;