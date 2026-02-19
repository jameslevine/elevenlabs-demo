import axios, { AxiosInstance } from 'axios';
import { ENV, ELEVENLABS_CONFIG, TIMEOUTS } from '../../constants';
import {
  ElevenLabsConfig,
  ElevenLabsConversationConfig,
  ElevenLabsSTTRequest,
  ElevenLabsSTTResponse,
  ElevenLabsTTSRequest,
  ElevenLabsTTSResponse,
} from '../../types';

/**
 * ElevenLabs API Adapter
 * Handles all interactions with the ElevenLabs API including:
 * - Text-to-Speech (TTS)
 * - Speech-to-Text (STT)
 * - Conversational AI Agent management
 */
export class ElevenLabsAdapter {
  private client: AxiosInstance;
  private config: ElevenLabsConfig;

  constructor(config?: Partial<ElevenLabsConfig>) {
    this.config = {
      apiKey: config?.apiKey || ENV.ELEVENLABS_API_KEY,
      agentId: config?.agentId || ENV.ELEVENLABS_AGENT_ID,
      voiceId: config?.voiceId || ELEVENLABS_CONFIG.DEFAULT_VOICE_ID,
      modelId: config?.modelId || ELEVENLABS_CONFIG.DEFAULT_MODEL_ID,
    };

    this.client = axios.create({
      baseURL: ELEVENLABS_CONFIG.BASE_URL,
      timeout: TIMEOUTS.ELEVENLABS_API,
      headers: {
        'xi-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Convert text to speech using ElevenLabs TTS API
   */
  async textToSpeech(
    request: ElevenLabsTTSRequest,
  ): Promise<ElevenLabsTTSResponse> {
    const voiceId = request.voiceId || this.config.voiceId;
    const modelId = request.modelId || this.config.modelId;

    const response = await this.client.post(
      `/text-to-speech/${voiceId}`,
      {
        text: request.text,
        model_id: modelId,
        voice_settings: request.voiceSettings || {
          stability: ELEVENLABS_CONFIG.DEFAULT_STABILITY,
          similarity_boost: ELEVENLABS_CONFIG.DEFAULT_SIMILARITY_BOOST,
        },
      },
      {
        responseType: 'arraybuffer',
        headers: {
          Accept: 'audio/mpeg',
        },
      },
    );

    return {
      audio: Buffer.from(response.data),
      contentType: response.headers['content-type'] || 'audio/mpeg',
    };
  }

  /**
   * Convert text to speech with streaming output
   */
  async textToSpeechStream(
    request: ElevenLabsTTSRequest,
    onChunk: (chunk: Buffer) => void,
  ): Promise<void> {
    const voiceId = request.voiceId || this.config.voiceId;
    const modelId = request.modelId || this.config.modelId;

    const response = await this.client.post(
      `/text-to-speech/${voiceId}/stream`,
      {
        text: request.text,
        model_id: modelId,
        voice_settings: request.voiceSettings || {
          stability: ELEVENLABS_CONFIG.DEFAULT_STABILITY,
          similarity_boost: ELEVENLABS_CONFIG.DEFAULT_SIMILARITY_BOOST,
        },
      },
      {
        responseType: 'stream',
        headers: {
          Accept: 'audio/mpeg',
        },
      },
    );

    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk: Buffer) => {
        onChunk(chunk);
      });

      response.data.on('end', () => {
        resolve();
      });

      response.data.on('error', (error: Error) => {
        reject(error);
      });
    });
  }

  /**
   * Transcribe audio using ElevenLabs Speech-to-Text API
   */
  async speechToText(
    request: ElevenLabsSTTRequest,
  ): Promise<ElevenLabsSTTResponse> {
    const formData = new FormData();
    formData.append('audio', new Blob([request.audio]), 'audio.wav');

    if (request.languageCode) {
      formData.append('language_code', request.languageCode);
    }

    const response = await this.client.post('/speech-to-text', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      text: response.data.text,
      confidence: response.data.confidence || 1.0,
      words: response.data.words,
    };
  }

  /**
   * Create a new Conversational AI agent
   */
  async createAgent(
    config: ElevenLabsConversationConfig,
  ): Promise<{ agentId: string }> {
    const response = await this.client.post('/convai/agents/create', {
      name: 'Airline Customer Service Agent',
      conversation_config: {
        agent: {
          prompt: {
            prompt: config.systemPrompt,
          },
          first_message: config.firstMessage,
          language: config.language || ELEVENLABS_CONFIG.DEFAULT_LANGUAGE,
        },
        asr: {
          quality: 'high',
        },
        tts: {
          model_id: ELEVENLABS_CONFIG.DEFAULT_MODEL_ID,
          voice_id: config.voiceId || ELEVENLABS_CONFIG.DEFAULT_VOICE_ID,
          optimize_streaming_latency: 3,
          stability: config.stability || ELEVENLABS_CONFIG.DEFAULT_STABILITY,
          similarity_boost:
            config.similarityBoost ||
            ELEVENLABS_CONFIG.DEFAULT_SIMILARITY_BOOST,
        },
        turn: {
          turn_timeout: 7,
        },
        conversation: {
          max_duration_seconds: 600,
        },
      },
    });

    return {
      agentId: response.data.agent_id,
    };
  }

  /**
   * Get agent details
   */
  async getAgent(agentId: string): Promise<Record<string, unknown>> {
    const response = await this.client.get(`/convai/agents/${agentId}`);
    return response.data;
  }

  /**
   * List all available voices
   */
  async listVoices(): Promise<Array<{ voiceId: string; name: string }>> {
    const response = await this.client.get('/voices');
    return response.data.voices.map(
      (voice: { voice_id: string; name: string }) => ({
        voiceId: voice.voice_id,
        name: voice.name,
      }),
    );
  }

  /**
   * Get voice details
   */
  async getVoice(voiceId: string): Promise<Record<string, unknown>> {
    const response = await this.client.get(`/voices/${voiceId}`);
    return response.data;
  }

  /**
   * Check subscription status and usage
   */
  async getSubscription(): Promise<Record<string, unknown>> {
    const response = await this.client.get('/user/subscription');
    return response.data;
  }

  /**
   * Get available models
   */
  async listModels(): Promise<Array<{ modelId: string; name: string }>> {
    const response = await this.client.get('/models');
    return response.data.map((model: { model_id: string; name: string }) => ({
      modelId: model.model_id,
      name: model.name,
    }));
  }
}

// Export singleton instance
export const elevenlabsAdapter = new ElevenLabsAdapter();
