const OpenAI = require('openai');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const sharp = require('sharp');

class ImageProviderService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Midjourney configuration (using Discord API or third-party service)
    this.midjourneyConfig = {
      apiKey: process.env.MIDJOURNEY_API_KEY,
      baseUrl: process.env.MIDJOURNEY_API_URL || 'https://api.midjourney.com',
    };
    
    // Stable Diffusion configuration
    this.stableDiffusionConfig = {
      apiKey: process.env.STABLE_DIFFUSION_API_KEY,
      baseUrl: process.env.STABLE_DIFFUSION_API_URL || 'https://api.stability.ai',
    };
    
    // Banana API configuration
    this.bananaConfig = {
      apiKey: process.env.BANANA_API_KEY,
      baseUrl: process.env.BANANA_API_URL || 'https://api.banana.dev',
    };
  }

  async generateImage(provider, prompt, options = {}) {
    switch (provider) {
      case 'dall-e-3':
        return await this.generateDALLE3Image(prompt, options);
      case 'midjourney':
        return await this.generateMidjourneyImage(prompt, options);
      case 'stable-diffusion':
        return await this.generateStableDiffusionImage(prompt, options);
      case 'banana':
        return await this.generateBananaImage(prompt, options);
      default:
        throw new Error(`Unsupported image provider: ${provider}`);
    }
  }

  async generateDALLE3Image(prompt, options = {}) {
    try {
      const {
        size = '1024x1024',
        quality = 'standard',
        style = 'vivid',
        n = 1,
        model = 'dall-e-3'
      } = options;

      const response = await this.openai.images.generate({
        model,
        prompt,
        n,
        size,
        quality,
        style,
        response_format: 'url',
      });

      const images = response.data.map(img => ({
        url: img.url,
        revisedPrompt: img.revised_prompt,
        size,
        providerId: img.id || null,
        metadata: {
          provider: 'dall-e-3',
          model,
          quality,
          style,
        }
      }));

      return {
        images,
        cost: this.calculateDALLE3Cost(size, quality, n),
        provider: 'dall-e-3',
        model,
      };
    } catch (error) {
      console.error('DALL-E 3 API error:', error);
      throw new Error(`DALL-E 3 API error: ${error.message}`);
    }
  }

  async generateMidjourneyImage(prompt, options = {}) {
    try {
      const {
        width = 1024,
        height = 1024,
        quality = 'standard',
        steps = 20,
        cfgScale = 7.5,
        style = 'vivid',
        n = 1,
        negativePrompt = '',
        seed = null
      } = options;

      // Midjourney API implementation (using third-party service)
      const payload = {
        prompt,
        width,
        height,
        quality,
        steps,
        cfg_scale: cfgScale,
        style,
        n,
        negative_prompt: negativePrompt,
        seed,
      };

      const response = await axios.post(
        `${this.midjourneyConfig.baseUrl}/v1/imagine`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.midjourneyConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 300000, // 5 minutes timeout for image generation
        }
      );

      const images = response.data.images.map((img, index) => ({
        url: img.url,
        revisedPrompt: img.revised_prompt || prompt,
        size: `${width}x${height}`,
        providerId: img.id || null,
        metadata: {
          provider: 'midjourney',
          width,
          height,
          quality,
          steps,
          cfgScale,
          style,
          seed: img.seed || seed,
        }
      }));

      return {
        images,
        cost: this.calculateMidjourneyCost(width, height, quality, n),
        provider: 'midjourney',
        model: 'midjourney-v6',
      };
    } catch (error) {
      console.error('Midjourney API error:', error);
      throw new Error(`Midjourney API error: ${error.message}`);
    }
  }

  async generateStableDiffusionImage(prompt, options = {}) {
    try {
      const {
        width = 1024,
        height = 1024,
        samples = 1,
        steps = 20,
        cfgScale = 7.5,
        sampler = 'K_DPMPP_2M',
        seed = null,
        negativePrompt = '',
        stylePreset = null
      } = options;

      // Stable Diffusion API implementation
      const payload = {
        prompt,
        negative_prompt: negativePrompt,
        width,
        height,
        samples,
        steps,
        cfg_scale: cfgScale,
        sampler,
        seed,
        style_preset: stylePreset,
      };

      const response = await axios.post(
        `${this.stableDiffusionConfig.baseUrl}/v1/generation/stable-diffusion/text-to-image`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.stableDiffusionConfig.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 300000, // 5 minutes timeout for image generation
        }
      );

      const images = response.data.artifacts.map((img, index) => ({
        url: img.base64 ? `data:image/png;base64,${img.base64}` : img.url,
        revisedPrompt: prompt,
        size: `${width}x${height}`,
        providerId: img.id || null,
        metadata: {
          provider: 'stable-diffusion',
          width,
          height,
          steps,
          cfgScale,
          sampler,
          seed: img.seed || seed,
          stylePreset,
        }
      }));

      return {
        images,
        cost: this.calculateStableDiffusionCost(width, height, steps, samples),
        provider: 'stable-diffusion',
        model: 'stable-diffusion-xl',
      };
    } catch (error) {
      console.error('Stable Diffusion API error:', error);
      throw new Error(`Stable Diffusion API error: ${error.message}`);
    }
  }

  async generateBananaImage(prompt, options = {}) {
    try {
      const {
        model = 'banana-image-v1',
        width = 1024,
        height = 1024,
        steps = 20,
        cfgScale = 7.5,
        negativePrompt = '',
        seed = null,
        samples = 1
      } = options;

      // Banana API implementation
      const payload = {
        model,
        inputs: {
          prompt,
          negative_prompt: negativePrompt,
          width,
          height,
          num_inference_steps: steps,
          guidance_scale: cfgScale,
          seed,
          num_images: samples
        }
      };

      const response = await axios.post(
        `${this.bananaConfig.baseUrl}/start/v1`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.bananaConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 300000, // 5 minutes timeout for image generation
        }
      );

      const callID = response.data.callID;
      
      // Poll for results
      let result;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max wait time
      
      do {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        const statusResponse = await axios.get(
          `${this.bananaConfig.baseUrl}/status/v1/${callID}`,
          {
            headers: {
              'Authorization': `Bearer ${this.bananaConfig.apiKey}`,
            }
          }
        );
        result = statusResponse.data;
        attempts++;
      } while (result.status === 'IN_QUEUE' && attempts < maxAttempts);
      
      if (result.status !== 'COMPLETED') {
        throw new Error(`Banana API error: Generation failed with status ${result.status}`);
      }

      const images = result.outputs.images.map((img, index) => ({
        url: img.startsWith('data:') ? img : `data:image/png;base64,${img}`,
        revisedPrompt: prompt,
        size: `${width}x${height}`,
        providerId: callID,
        metadata: {
          provider: 'banana',
          model,
          width,
          height,
          steps,
          cfgScale,
          seed: result.outputs.seed || seed,
        }
      }));

      return {
        images,
        cost: this.calculateBananaCost(model, width, height, samples),
        provider: 'banana',
        model,
      };
    } catch (error) {
      console.error('Banana API error:', error);
      throw new Error(`Banana API error: ${error.message}`);
    }
  }

  async editImage(provider, imageUrl, prompt, options = {}) {
    switch (provider) {
      case 'dall-e-3':
        return await this.editDALLE3Image(imageUrl, prompt, options);
      case 'stable-diffusion':
        return await this.editStableDiffusionImage(imageUrl, prompt, options);
      case 'banana':
        return await this.editBananaImage(imageUrl, prompt, options);
      default:
        throw new Error(`Image editing not supported for provider: ${provider}`);
    }
  }

  async editDALLE3Image(imageUrl, prompt, options = {}) {
    try {
      const response = await this.openai.images.edit({
        image: fs.createReadStream(imageUrl),
        prompt,
        n: options.n || 1,
        size: options.size || '1024x1024',
        model: 'dall-e-3',
      });

      const images = response.data.map(img => ({
        url: img.url,
        revisedPrompt: img.revised_prompt,
        size: options.size || '1024x1024',
        providerId: img.id || null,
        metadata: {
          provider: 'dall-e-3',
          model: 'dall-e-3',
          edit: true,
        }
      }));

      return {
        images,
        cost: this.calculateDALLE3EditCost(options.size || '1024x1024', options.n || 1),
        provider: 'dall-e-3',
        model: 'dall-e-3',
      };
    } catch (error) {
      console.error('DALL-E 3 edit API error:', error);
      throw new Error(`DALL-E 3 edit API error: ${error.message}`);
    }
  }

  async editStableDiffusionImage(imageUrl, prompt, options = {}) {
    try {
      const {
        width = 1024,
        height = 1024,
        samples = 1,
        steps = 20,
        cfgScale = 7.5,
        sampler = 'K_DPMPP_2M',
        seed = null,
        negativePrompt = '',
        maskImage = null
      } = options;

      // Convert image to base64 if needed
      let imageBase64;
      if (imageUrl.startsWith('data:')) {
        imageBase64 = imageUrl.split(',')[1];
      } else {
        const imageBuffer = fs.readFileSync(imageUrl);
        imageBase64 = imageBuffer.toString('base64');
      }

      let maskBase64 = null;
      if (maskImage) {
        if (maskImage.startsWith('data:')) {
          maskBase64 = maskImage.split(',')[1];
        } else {
          const maskBuffer = fs.readFileSync(maskImage);
          maskBase64 = maskBuffer.toString('base64');
        }
      }

      const payload = {
        prompt,
        negative_prompt: negativePrompt,
        init_image: imageBase64,
        init_image_mode: 'image_strength',
        image_strength: 0.75,
        width,
        height,
        samples,
        steps,
        cfg_scale: cfgScale,
        sampler,
        seed,
        mask_image: maskBase64,
      };

      const response = await axios.post(
        `${this.stableDiffusionConfig.baseUrl}/v1/generation/stable-diffusion/image-to-image`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.stableDiffusionConfig.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 300000,
        }
      );

      const images = response.data.artifacts.map((img, index) => ({
        url: `data:image/png;base64,${img.base64}`,
        revisedPrompt: prompt,
        size: `${width}x${height}`,
        providerId: img.id || null,
        metadata: {
          provider: 'stable-diffusion',
          width,
          height,
          steps,
          cfgScale,
          sampler,
          seed: img.seed || seed,
          edit: true,
        }
      }));

      return {
        images,
        cost: this.calculateStableDiffusionEditCost(width, height, steps, samples),
        provider: 'stable-diffusion',
        model: 'stable-diffusion-xl',
      };
    } catch (error) {
      console.error('Stable Diffusion edit API error:', error);
      throw new Error(`Stable Diffusion edit API error: ${error.message}`);
    }
  }

  async editBananaImage(imageUrl, prompt, options = {}) {
    try {
      const {
        model = 'banana-image-edit-v1',
        width = 1024,
        height = 1024,
        steps = 20,
        cfgScale = 7.5,
        negativePrompt = '',
        seed = null,
        maskImage = null
      } = options;

      // Convert image to base64 if needed
      let imageBase64;
      if (imageUrl.startsWith('data:')) {
        imageBase64 = imageUrl.split(',')[1];
      } else {
        const imageBuffer = fs.readFileSync(imageUrl);
        imageBase64 = imageBuffer.toString('base64');
      }

      let maskBase64 = null;
      if (maskImage) {
        if (maskImage.startsWith('data:')) {
          maskBase64 = maskImage.split(',')[1];
        } else {
          const maskBuffer = fs.readFileSync(maskImage);
          maskBase64 = maskBuffer.toString('base64');
        }
      }

      // Banana API implementation
      const payload = {
        model,
        inputs: {
          prompt,
          negative_prompt: negativePrompt,
          image: imageBase64,
          mask_image: maskBase64,
          width,
          height,
          num_inference_steps: steps,
          guidance_scale: cfgScale,
          seed
        }
      };

      const response = await axios.post(
        `${this.bananaConfig.baseUrl}/start/v1`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.bananaConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 300000, // 5 minutes timeout for image generation
        }
      );

      const callID = response.data.callID;
      
      // Poll for results
      let result;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max wait time
      
      do {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        const statusResponse = await axios.get(
          `${this.bananaConfig.baseUrl}/status/v1/${callID}`,
          {
            headers: {
              'Authorization': `Bearer ${this.bananaConfig.apiKey}`,
            }
          }
        );
        result = statusResponse.data;
        attempts++;
      } while (result.status === 'IN_QUEUE' && attempts < maxAttempts);
      
      if (result.status !== 'COMPLETED') {
        throw new Error(`Banana API error: Generation failed with status ${result.status}`);
      }

      const images = result.outputs.images.map((img, index) => ({
        url: img.startsWith('data:') ? img : `data:image/png;base64,${img}`,
        revisedPrompt: prompt,
        size: `${width}x${height}`,
        providerId: callID,
        metadata: {
          provider: 'banana',
          model,
          width,
          height,
          steps,
          cfgScale,
          seed: result.outputs.seed || seed,
          edit: true,
        }
      }));

      return {
        images,
        cost: this.calculateBananaCost(model, width, height, 1),
        provider: 'banana',
        model,
      };
    } catch (error) {
      console.error('Banana edit API error:', error);
      throw new Error(`Banana edit API error: ${error.message}`);
    }
  }

  async upscaleImage(provider, imageUrl, options = {}) {
    switch (provider) {
      case 'stable-diffusion':
        return await this.upscaleStableDiffusionImage(imageUrl, options);
      case 'banana':
        return await this.upscaleBananaImage(imageUrl, options);
      default:
        throw new Error(`Image upscaling not supported for provider: ${provider}`);
    }
  }

  async upscaleStableDiffusionImage(imageUrl, options = {}) {
    try {
      const {
        width = 2048,
        height = 2048,
        creativity = 0.3,
        sampler = 'K_DPMPP_2M'
      } = options;

      // Convert image to base64
      let imageBase64;
      if (imageUrl.startsWith('data:')) {
        imageBase64 = imageUrl.split(',')[1];
      } else {
        const imageBuffer = fs.readFileSync(imageUrl);
        imageBase64 = imageBuffer.toString('base64');
      }

      const payload = {
        image: imageBase64,
        width,
        height,
        creativity,
        sampler,
      };

      const response = await axios.post(
        `${this.stableDiffusionConfig.baseUrl}/v1/generation/stable-diffusion/upscale`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.stableDiffusionConfig.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 300000,
        }
      );

      const images = response.data.artifacts.map((img, index) => ({
        url: `data:image/png;base64,${img.base64}`,
        revisedPrompt: 'Upscaled image',
        size: `${width}x${height}`,
        providerId: img.id || null,
        metadata: {
          provider: 'stable-diffusion',
          width,
          height,
          creativity,
          sampler,
          upscale: true,
        }
      }));

      return {
        images,
        cost: this.calculateStableDiffusionUpscaleCost(width, height),
        provider: 'stable-diffusion',
        model: 'stable-diffusion-xl',
      };
    } catch (error) {
      console.error('Stable Diffusion upscale API error:', error);
      throw new Error(`Stable Diffusion upscale API error: ${error.message}`);
    }
  }

  async upscaleBananaImage(imageUrl, options = {}) {
    try {
      const {
        model = 'banana-upscale-v1',
        width = 2048,
        height = 2048,
        creativity = 0.3
      } = options;

      // Convert image to base64
      let imageBase64;
      if (imageUrl.startsWith('data:')) {
        imageBase64 = imageUrl.split(',')[1];
      } else {
        const imageBuffer = fs.readFileSync(imageUrl);
        imageBase64 = imageBuffer.toString('base64');
      }

      // Banana API implementation
      const payload = {
        model,
        inputs: {
          image: imageBase64,
          width,
          height,
          creativity
        }
      };

      const response = await axios.post(
        `${this.bananaConfig.baseUrl}/start/v1`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.bananaConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 300000, // 5 minutes timeout for image generation
        }
      );

      const callID = response.data.callID;
      
      // Poll for results
      let result;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max wait time
      
      do {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        const statusResponse = await axios.get(
          `${this.bananaConfig.baseUrl}/status/v1/${callID}`,
          {
            headers: {
              'Authorization': `Bearer ${this.bananaConfig.apiKey}`,
            }
          }
        );
        result = statusResponse.data;
        attempts++;
      } while (result.status === 'IN_QUEUE' && attempts < maxAttempts);
      
      if (result.status !== 'COMPLETED') {
        throw new Error(`Banana API error: Generation failed with status ${result.status}`);
      }

      const images = result.outputs.images.map((img, index) => ({
        url: img.startsWith('data:') ? img : `data:image/png;base64,${img}`,
        revisedPrompt: 'Upscaled image',
        size: `${width}x${height}`,
        providerId: callID,
        metadata: {
          provider: 'banana',
          model,
          width,
          height,
          creativity,
          upscale: true,
        }
      }));

      return {
        images,
        cost: this.calculateBananaCost(model, width, height, 1),
        provider: 'banana',
        model,
      };
    } catch (error) {
      console.error('Banana upscale API error:', error);
      throw new Error(`Banana upscale API error: ${error.message}`);
    }
  }

  async getProviderCapabilities(provider) {
    switch (provider) {
      case 'dall-e-3':
        return {
          models: ['dall-e-3'],
          maxResolution: '1024x1024',
          supportedSizes: ['1024x1024', '1792x1024', '1024x1792'],
          qualities: ['standard', 'hd'],
          styles: ['vivid', 'natural'],
          supportsEditing: true,
          supportsUpscaling: false,
          maxPrompts: 4000,
        };
      case 'midjourney':
        return {
          models: ['midjourney-v6'],
          maxResolution: '2048x2048',
          supportedSizes: ['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792', '2048x2048'],
          qualities: ['standard', 'hd'],
          styles: ['vivid', 'natural', 'anime', 'realistic'],
          supportsEditing: false,
          supportsUpscaling: false,
          maxPrompts: 4000,
        };
      case 'stable-diffusion':
        return {
          models: ['stable-diffusion-xl', 'stable-diffusion-2.1'],
          maxResolution: '2048x2048',
          supportedSizes: ['256x256', '512x512', '768x768', '1024x1024', '1536x1536', '2048x2048'],
          qualities: ['standard'],
          styles: ['anime', 'photographic', 'digital-art', 'comic-book', 'fantasy-art'],
          supportsEditing: true,
          supportsUpscaling: true,
          maxPrompts: 4000,
        };
      case 'banana':
        return {
          models: ['banana-image-v1', 'banana-image-edit-v1', 'banana-upscale-v1'],
          maxResolution: '2048x2048',
          supportedSizes: ['256x256', '512x512', '768x768', '1024x1024', '1536x1536', '2048x2048'],
          qualities: ['standard'],
          styles: ['realistic', 'artistic', 'anime', '3d-render'],
          supportsEditing: true,
          supportsUpscaling: true,
          maxPrompts: 4000,
        };
      default:
        throw new Error(`Unsupported image provider: ${provider}`);
    }
  }

  calculateDALLE3Cost(size, quality, n) {
    // DALL-E 3 pricing (example rates)
    const baseCost = 0.04; // $0.04 per image for standard quality
    const hdMultiplier = quality === 'hd' ? 2 : 1;
    const sizeMultiplier = (size === '1792x1024' || size === '1024x1792') ? 1.5 : 1;
    
    return baseCost * hdMultiplier * sizeMultiplier * n;
  }

  calculateDALLE3EditCost(size, n) {
    // DALL-E 3 edit pricing
    const baseCost = 0.04; // $0.04 per image
    const sizeMultiplier = (size === '1792x1024' || size === '1024x1792') ? 1.5 : 1;
    
    return baseCost * sizeMultiplier * n;
  }

  calculateMidjourneyCost(width, height, quality, n) {
    // Midjourney pricing (example rates)
    const baseCost = 0.03; // $0.03 per image
    const sizeMultiplier = (width * height) / (1024 * 1024);
    const qualityMultiplier = quality === 'hd' ? 1.5 : 1;
    
    return baseCost * sizeMultiplier * qualityMultiplier * n;
  }

  calculateStableDiffusionCost(width, height, steps, samples) {
    // Stable Diffusion pricing (example rates)
    const baseCost = 0.01; // $0.01 per image
    const sizeMultiplier = (width * height) / (1024 * 1024);
    const stepsMultiplier = steps / 20;
    
    return baseCost * sizeMultiplier * stepsMultiplier * samples;
  }

  calculateStableDiffusionEditCost(width, height, steps, samples) {
    // Stable Diffusion edit pricing
    const baseCost = 0.015; // $0.015 per image
    const sizeMultiplier = (width * height) / (1024 * 1024);
    const stepsMultiplier = steps / 20;
    
    return baseCost * sizeMultiplier * stepsMultiplier * samples;
  }

  calculateStableDiffusionUpscaleCost(width, height) {
    // Stable Diffusion upscale pricing
    const baseCost = 0.02; // $0.02 per image
    const sizeMultiplier = (width * height) / (1024 * 1024);
    
    return baseCost * sizeMultiplier;
  }

  calculateBananaCost(model, width, height, samples) {
    // Banana API pricing (example rates)
    const baseCost = 0.02; // $0.02 per image
    const sizeMultiplier = (width * height) / (1024 * 1024);
    
    // Adjust cost based on model type
    let modelMultiplier = 1;
    if (model.includes('edit')) {
      modelMultiplier = 1.2;
    } else if (model.includes('upscale')) {
      modelMultiplier = 1.5;
    }
    
    return baseCost * sizeMultiplier * modelMultiplier * samples;
  }

  async processImage(imageUrl, options = {}) {
    const {
      resize = null,
      format = 'png',
      quality = 90,
      optimize = true
    } = options;

    try {
      let imageBuffer;
      
      if (imageUrl.startsWith('data:')) {
        // Extract base64 data
        const base64Data = imageUrl.split(',')[1];
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else {
        // Read from file system
        imageBuffer = fs.readFileSync(imageUrl);
      }

      let image = sharp(imageBuffer);

      // Apply resize if specified
      if (resize) {
        image = image.resize(resize.width, resize.height, {
          fit: resize.fit || 'cover',
          position: resize.position || 'center'
        });
      }

      // Apply format and quality
      const formatOptions = {};
      if (format === 'jpeg') {
        formatOptions.quality = quality;
      } else if (format === 'png') {
        formatOptions.compressionLevel = optimize ? 9 : 6;
      } else if (format === 'webp') {
        formatOptions.quality = quality;
      }

      imageBuffer = await image.toFormat(format, formatOptions).toBuffer();

      return {
        url: `data:image/${format};base64,${imageBuffer.toString('base64')}`,
        size: imageBuffer.length,
        format,
        metadata: await sharp(imageBuffer).metadata()
      };
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error(`Image processing error: ${error.message}`);
    }
  }
}

module.exports = ImageProviderService;