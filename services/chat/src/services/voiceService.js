const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { ElevenLabsClient } = require('elevenlabs');
const speech = require('@google-cloud/speech');

class VoiceService {
  constructor() {
    this.elevenLabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });
    
    this.speechClient = new speech.SpeechClient();
    
    // Supported languages for voice
    this.supportedLanguages = {
      en: {
        speech: 'en-US',
        voice: 'Rachel',
        elevenLabsId: '21m00Tcm4TlvDq8ikWAM'
      },
      ar: {
        speech: 'ar-SA',
        voice: 'Fatima',
        elevenLabsId: 'pNInz6obpgDQGcFmaJgB'
      }
    };
  }

  async speechToText(audioBuffer, language = 'en') {
    try {
      const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: this.supportedLanguages[language].speech,
      };

      const audio = {
        content: audioBuffer.toString('base64'),
      };

      const request = {
        config: config,
        audio: audio,
      };

      const [response] = await this.speechClient.recognize(request);
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

      return {
        text: transcription,
        language: language,
        confidence: response.results[0].alternatives[0].confidence,
      };
    } catch (error) {
      console.error('Speech to text error:', error);
      throw new Error(`Speech to text error: ${error.message}`);
    }
  }

  async textToSpeech(text, language = 'en', voice = null) {
    try {
      const selectedVoice = voice || this.supportedLanguages[language].voice;
      const voiceId = this.supportedLanguages[language].elevenLabsId;

      const response = await this.elevenLabs.generate({
        voice: voiceId,
        text: text,
        model_id: 'eleven_multilingual_v2',
      });

      return {
        audioBuffer: response.audio,
        language: language,
        voice: selectedVoice,
      };
    } catch (error) {
      console.error('Text to speech error:', error);
      throw new Error(`Text to speech error: ${error.message}`);
    }
  }

  async processVoiceFile(audioFile, language = 'en') {
    try {
      // Convert audio file to the required format
      const convertedAudio = await this.convertAudioFormat(audioFile);
      
      // Transcribe audio to text
      const transcription = await this.speechToText(convertedAudio, language);
      
      return transcription;
    } catch (error) {
      console.error('Voice file processing error:', error);
      throw new Error(`Voice file processing error: ${error.message}`);
    }
  }

  async convertAudioFormat(inputFile) {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(
        path.dirname(inputFile),
        `converted_${Date.now()}.wav`
      );

      ffmpeg(inputFile)
        .toFormat('wav')
        .audioFrequency(16000)
        .audioChannels(1)
        .on('end', () => {
          fs.readFile(outputPath, (err, data) => {
            if (err) {
              reject(err);
            } else {
              // Clean up the temporary file
              fs.unlinkSync(outputPath);
              resolve(data);
            }
          });
        })
        .on('error', (err) => {
          reject(err);
        })
        .save(outputPath);
    });
  }

  async getAvailableVoices(language = 'en') {
    try {
      const voices = await this.elevenLabs.voices.getAll();
      
      return voices
        .filter(voice => voice.language.includes(language))
        .map(voice => ({
          id: voice.voice_id,
          name: voice.name,
          language: voice.language,
          gender: voice.gender,
          age: voice.age,
        }));
    } catch (error) {
      console.error('Get available voices error:', error);
      throw new Error(`Get available voices error: ${error.message}`);
    }
  }

  async createVoiceClone(audioFile, name) {
    try {
      const response = await this.elevenLabs.voices.add({
        name: name,
        files: [audioFile],
      });

      return {
        voiceId: response.voice_id,
        name: name,
        status: 'processing',
      };
    } catch (error) {
      console.error('Voice clone creation error:', error);
      throw new Error(`Voice clone creation error: ${error.message}`);
    }
  }

  async getVoiceCloneStatus(voiceId) {
    try {
      const response = await this.elevenLabs.voices.get(voiceId);
      
      return {
        voiceId: voiceId,
        name: response.name,
        status: response.status,
        description: response.description,
      };
    } catch (error) {
      console.error('Get voice clone status error:', error);
      throw new Error(`Get voice clone status error: ${error.message}`);
    }
  }

  async addLipSync(videoFile, audioFile, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoFile)
        .input(audioFile)
        .outputOptions([
          '-map 0:v',
          '-map 1:a',
          '-c:v libx264',
          '-c:a aac',
          '-shortest',
        ])
        .on('end', () => {
          resolve(outputPath);
        })
        .on('error', (err) => {
          reject(err);
        })
        .save(outputPath);
    });
  }

  async detectLanguage(audioBuffer) {
    try {
      // Try each supported language and return the one with highest confidence
      const results = [];
      
      for (const [langCode, langConfig] of Object.entries(this.supportedLanguages)) {
        try {
          const config = {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: langConfig.speech,
          };

          const audio = {
            content: audioBuffer.toString('base64'),
          };

          const request = {
            config: config,
            audio: audio,
          };

          const [response] = await this.speechClient.recognize(request);
          
          if (response.results.length > 0) {
            results.push({
              language: langCode,
              confidence: response.results[0].alternatives[0].confidence,
            });
          }
        } catch (error) {
          // Ignore errors for individual language detection attempts
        }
      }

      if (results.length === 0) {
        return { language: 'en', confidence: 0.5 }; // Default to English
      }

      // Sort by confidence and return the best match
      results.sort((a, b) => b.confidence - a.confidence);
      return results[0];
    } catch (error) {
      console.error('Language detection error:', error);
      return { language: 'en', confidence: 0.5 }; // Default to English
    }
  }

  async getVoiceSettings(voiceId) {
    try {
      const response = await this.elevenLabs.voices.get(voiceId);
      
      return {
        voiceId: voiceId,
        name: response.name,
        language: response.language,
        gender: response.gender,
        age: response.age,
        description: response.description,
        use_case: response.use_case,
      };
    } catch (error) {
      console.error('Get voice settings error:', error);
      throw new Error(`Get voice settings error: ${error.message}`);
    }
  }

  async updateVoiceSettings(voiceId, settings) {
    try {
      const response = await this.elevenLabs.voices.edit(voiceId, settings);
      
      return {
        voiceId: voiceId,
        name: response.name,
        language: response.language,
        gender: response.gender,
        age: response.age,
        description: response.description,
        use_case: response.use_case,
      };
    } catch (error) {
      console.error('Update voice settings error:', error);
      throw new Error(`Update voice settings error: ${error.message}`);
    }
  }
}

module.exports = VoiceService;