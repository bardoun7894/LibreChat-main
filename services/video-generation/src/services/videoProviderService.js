const axios = require('axios');

class VideoProviderService {
  constructor() {
    // KIE API Configuration
    this.kieConfig = {
      baseUrl: process.env.KIE_API_URL || 'https://api.kie.ai',
      apiKey: process.env.KIE_API_KEY,
      timeout: 300000, // 5 minutes timeout for video generation
    };

    // Direct Veo3 API Configuration (fallback)
    this.veo3Config = {
      baseUrl: process.env.VEO3_API_URL || 'https://api.veo3.ai',
      apiKey: process.env.VEO3_API_KEY,
      timeout: 300000,
    };

    // Direct Sora2 API Configuration (fallback)
    this.sora2Config = {
      baseUrl: process.env.SORA2_API_URL || 'https://api.sora2.ai',
      apiKey: process.env.SORA2_API_KEY,
      timeout: 300000,
    };
  }

  /**
   * Generate a video using KIE API
   * @param {Object} params - Video generation parameters
   * @param {string} params.prompt - Text prompt for video generation
   * @param {string} params.negativePrompt - Negative prompt
   * @param {Object} params.settings - Generation settings
   * @param {string} params.model - Model to use (veo3, sora2, etc.)
   * @returns {Promise<Object>} Generated video data
   */
  async generateVideo(params) {
    try {
      const { prompt, negativePrompt, settings, model } = params;
      
      // Prepare the request payload for KIE API
      const payload = {
        prompt,
        negative_prompt: negativePrompt,
        model: model || 'veo3',
        settings: {
          duration: settings?.duration || 10,
          resolution: settings?.resolution || '1080p',
          style: settings?.style || 'cinematic',
          aspect_ratio: settings?.aspectRatio || '16:9',
          motion_strength: settings?.motionStrength || 0.9,
          seed: settings?.seed || null,
        },
      };

      // Make the request to KIE API
      const response = await axios.post(
        `${this.kieConfig.baseUrl}/v1/video/generate`,
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
      console.error('KIE API video generation error:', error);
      
      // Fallback to direct API if KIE fails
      if (params.model === 'veo3') {
        return this.generateVeo3Video(params);
      } else if (params.model === 'sora2') {
        return this.generateSora2Video(params);
      }
      
      throw new Error(`KIE API video generation error: ${error.message}`);
    }
  }

  /**
   * Generate a video using Veo3 API (direct fallback)
   * @param {Object} params - Video generation parameters
   * @returns {Promise<Object>} Generated video data
   */
  async generateVeo3Video(params) {
    try {
      const { prompt, negativePrompt, settings } = params;
      
      const payload = {
        prompt,
        negative_prompt: negativePrompt,
        settings: {
          duration: settings?.duration || 15,
          resolution: settings?.resolution || '1080p',
          style: settings?.style || 'cinematic',
          aspect_ratio: settings?.aspectRatio || '16:9',
          motion_strength: settings?.motionStrength || 0.9,
          seed: settings?.seed || null,
        },
      };

      const response = await axios.post(
        `${this.veo3Config.baseUrl}/v1/generate`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.veo3Config.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: this.veo3Config.timeout,
        }
      );

      return this.formatVeo3Response(response.data);
    } catch (error) {
      console.error('Veo3 API video generation error:', error);
      throw new Error(`Veo3 API video generation error: ${error.message}`);
    }
  }

  /**
   * Generate a video using Sora2 API (direct fallback)
   * @param {Object} params - Video generation parameters
   * @returns {Promise<Object>} Generated video data
   */
  async generateSora2Video(params) {
    try {
      const { prompt, negativePrompt, settings } = params;
      
      const payload = {
        prompt,
        negative_prompt: negativePrompt,
        settings: {
          duration: settings?.duration || 30,
          resolution: settings?.resolution || '1080p',
          style: settings?.style || 'realistic',
          aspect_ratio: settings?.aspectRatio || '16:9',
          seed: settings?.seed || null,
        },
      };

      const response = await axios.post(
        `${this.sora2Config.baseUrl}/v1/videos/generations`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.sora2Config.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: this.sora2Config.timeout,
        }
      );

      return this.formatSora2Response(response.data);
    } catch (error) {
      console.error('Sora2 API video generation error:', error);
      throw new Error(`Sora2 API video generation error: ${error.message}`);
    }
  }

  /**
   * Edit a video using KIE API
   * @param {string} videoId - ID of the video to edit
   * @param {string} prompt - Edit prompt
   * @param {Object} options - Edit options
   * @returns {Promise<Object>} Edited video data
   */
  async editVideo(videoId, prompt, options = {}) {
    try {
      const payload = {
        video_id: videoId,
        prompt,
        options: {
          strength: options.strength || 0.7,
          guidance_scale: options.guidanceScale || 7.5,
          seed: options.seed || null,
        },
      };

      const response = await axios.post(
        `${this.kieConfig.baseUrl}/v1/video/edit`,
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
      console.error('KIE API video edit error:', error);
      throw new Error(`KIE API video edit error: ${error.message}`);
    }
  }

  /**
   * Upload a video to KIE API for editing
   * @param {string|Buffer} videoUrl - URL or buffer of the video to upload
   * @returns {Promise<Object>} Uploaded video data
   */
  async uploadVideo(videoUrl) {
    try {
      let videoBuffer;
      
      if (typeof videoUrl === 'string' && videoUrl.startsWith('http')) {
        // Download video from URL
        const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });
        videoBuffer = Buffer.from(response.data, 'binary');
      } else if (typeof videoUrl === 'string') {
        // Read video from file system
        const fs = require('fs');
        videoBuffer = fs.readFileSync(videoUrl);
      } else {
        // Use provided buffer
        videoBuffer = videoUrl;
      }

      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('video', videoBuffer, {
        filename: `video-${Date.now()}.mp4`,
        contentType: 'video/mp4',
      });

      const response = await axios.post(
        `${this.kieConfig.baseUrl}/v1/video/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.kieConfig.apiKey}`,
            ...formData.getHeaders(),
          },
          timeout: this.kieConfig.timeout,
        }
      );

      return response.data;
    } catch (error) {
      console.error('KIE API video upload error:', error);
      throw new Error(`KIE API video upload error: ${error.message}`);
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
        { id: 'veo3', name: 'Veo3', type: 'video' },
        { id: 'sora2', name: 'Sora2', type: 'video' },
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
          models: ['veo3', 'sora2'],
          maxDuration: 120, // seconds
          supportedResolutions: ['720p', '1080p', '4k'],
          supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:2'],
          styles: ['realistic', 'cinematic', 'documentary', 'animation'],
          supportsEditing: true,
          maxPrompts: 4000,
        };
      case 'veo3':
        return {
          models: ['veo3-v1'],
          maxDuration: 60, // seconds
          supportedResolutions: ['720p', '1080p', '4k'],
          supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3'],
          styles: ['cinematic', 'documentary', 'animation', 'artistic'],
          supportsEditing: true,
          maxPrompts: 2000,
        };
      case 'sora2':
        return {
          models: ['sora-2'],
          maxDuration: 120, // seconds
          supportedResolutions: ['720p', '1080p', '4k'],
          supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:2'],
          styles: ['realistic', 'cinematic', 'documentary', 'animation'],
          supportsEditing: true,
          maxPrompts: 4000,
        };
      default:
        throw new Error(`Unsupported video provider: ${provider}`);
    }
  }

  /**
   * Calculate cost for video generation
   * @param {number} duration - Video duration in seconds
   * @param {string} resolution - Video resolution
   * @param {string} model - Model used
   * @returns {number} Cost in USD
   */
  calculateCost(duration, resolution, model) {
    // KIE API pricing (example rates)
    const baseCost = 0.1; // $0.1 per second
    const resolutionMultiplier = {
      '720p': 1,
      '1080p': 1.5,
      '4k': 3,
    }[resolution] || 1;
    
    const modelMultiplier = {
      'veo3': 1.2,
      'sora2': 1.5,
    }[model] || 1;
    
    return baseCost * duration * resolutionMultiplier * modelMultiplier;
  }

  /**
   * Calculate cost for video editing
   * @param {number} duration - Video duration in seconds
   * @param {string} resolution - Video resolution
   * @param {string} model - Model used
   * @returns {number} Cost in USD
   */
  calculateEditCost(duration, resolution, model) {
    // KIE API edit pricing (example rates)
    const baseCost = 0.08; // $0.08 per second
    const resolutionMultiplier = {
      '720p': 1,
      '1080p': 1.5,
      '4k': 3,
    }[resolution] || 1;
    
    const modelMultiplier = {
      'veo3': 1.2,
      'sora2': 1.5,
    }[model] || 1;
    
    return baseCost * duration * resolutionMultiplier * modelMultiplier;
  }

  /**
   * Format KIE API response
   * @param {Object} data - Raw response data
   * @returns {Object} Formatted response
   */
  formatKieResponse(data) {
    return {
      id: data.id,
      videoUrl: data.video_url,
      thumbnailUrl: data.thumbnail_url,
      status: data.status,
      prompt: data.prompt,
      model: data.model,
      duration: data.duration,
      resolution: data.resolution,
      style: data.style,
      aspectRatio: data.aspect_ratio,
      createdAt: data.created_at,
      cost: this.calculateCost(data.duration, data.resolution, data.model),
    };
  }

  /**
   * Format Veo3 API response
   * @param {Object} data - Raw response data
   * @returns {Object} Formatted response
   */
  formatVeo3Response(data) {
    return {
      id: data.id,
      videoUrl: data.video_url,
      thumbnailUrl: data.thumbnail_url,
      status: data.status,
      prompt: data.prompt,
      model: 'veo3',
      duration: data.duration,
      resolution: data.resolution,
      style: data.style,
      aspectRatio: data.aspect_ratio,
      createdAt: data.created_at,
      cost: this.calculateCost(data.duration, data.resolution, 'veo3'),
    };
  }

  /**
   * Format Sora2 API response
   * @param {Object} data - Raw response data
   * @returns {Object} Formatted response
   */
  formatSora2Response(data) {
    return {
      id: data.id,
      videoUrl: data.video_url,
      thumbnailUrl: data.thumbnail_url,
      status: data.status,
      prompt: data.prompt,
      model: 'sora2',
      duration: data.duration,
      resolution: data.resolution,
      style: data.style,
      aspectRatio: data.aspect_ratio,
      createdAt: data.created_at,
      cost: this.calculateCost(data.duration, data.resolution, 'sora2'),
    };
  }
}

module.exports = VideoProviderService;