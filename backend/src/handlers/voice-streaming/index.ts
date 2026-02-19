import { Context } from 'aws-lambda';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import {
  KinesisVideoClient,
  GetDataEndpointCommand,
} from '@aws-sdk/client-kinesis-video';
import {
  KinesisVideoMedia,
  GetMediaCommand,
} from '@aws-sdk/client-kinesis-video-media';
import WebSocket from 'ws';

const secretsClient = new SecretsManagerClient({});

interface StreamingEvent {
  Details: {
    ContactData: {
      ContactId: string;
      MediaStreams?: {
        Customer?: {
          Audio?: {
            StreamARN?: string;
            StartFragmentNumber?: string;
          };
        };
      };
    };
  };
}

interface ElevenLabsMessage {
  type: string;
  audio?: string;
  text?: string;
  conversation_id?: string;
}

/**
 * Get ElevenLabs API key from Secrets Manager
 */
async function getElevenLabsApiKey(): Promise<string> {
  const secretArn = process.env.SECRETS_ARN;
  if (!secretArn) {
    throw new Error('SECRETS_ARN environment variable not set');
  }

  const response = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: secretArn }),
  );

  if (!response.SecretString) {
    throw new Error('Secret value is empty');
  }

  const secret = JSON.parse(response.SecretString);
  return secret.ELEVENLABS_API_KEY;
}

/**
 * Connect to ElevenLabs Conversational AI WebSocket
 */
async function connectToElevenLabs(
  apiKey: string,
  agentId: string,
): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`;

    const ws = new WebSocket(wsUrl, {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    ws.on('open', () => {
      console.log('Connected to ElevenLabs WebSocket');
      resolve(ws);
    });

    ws.on('error', (error) => {
      console.error('ElevenLabs WebSocket error:', error);
      reject(error);
    });

    // Set timeout for connection
    setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        ws.close();
        reject(new Error('WebSocket connection timeout'));
      }
    }, 10000);
  });
}

/**
 * Get Kinesis Video Streams data endpoint
 */
async function getKvsDataEndpoint(streamArn: string): Promise<string> {
  const kvsClient = new KinesisVideoClient({});

  const response = await kvsClient.send(
    new GetDataEndpointCommand({
      StreamARN: streamArn,
      APIName: 'GET_MEDIA',
    }),
  );

  if (!response.DataEndpoint) {
    throw new Error('Failed to get KVS data endpoint');
  }

  return response.DataEndpoint;
}

/**
 * Stream audio from KVS to ElevenLabs
 */
async function streamFromKvs(
  streamArn: string,
  startFragmentNumber: string,
  elevenLabsWs: WebSocket,
): Promise<void> {
  const dataEndpoint = await getKvsDataEndpoint(streamArn);

  const kvsMediaClient = new KinesisVideoMedia({
    endpoint: dataEndpoint,
  });

  const response = await kvsMediaClient.send(
    new GetMediaCommand({
      StreamARN: streamArn,
      StartSelector: {
        StartSelectorType: 'FRAGMENT_NUMBER',
        AfterFragmentNumber: startFragmentNumber,
      },
    }),
  );

  if (!response.Payload) {
    throw new Error('No payload from KVS');
  }

  // Process the MKV stream and extract audio
  // Note: This is a simplified version - in production you'd need to parse MKV format
  const stream = response.Payload as NodeJS.ReadableStream;

  stream.on('data', (chunk: Buffer) => {
    // Convert audio chunk to base64 and send to ElevenLabs
    const audioBase64 = chunk.toString('base64');

    if (elevenLabsWs.readyState === WebSocket.OPEN) {
      elevenLabsWs.send(
        JSON.stringify({
          type: 'audio',
          audio: audioBase64,
        }),
      );
    }
  });

  stream.on('error', (error) => {
    console.error('KVS stream error:', error);
  });

  stream.on('end', () => {
    console.log('KVS stream ended');
  });
}

/**
 * Lambda handler for voice streaming
 */
export const handler = async (
  event: StreamingEvent,
  context: Context,
): Promise<{ statusCode: number; body: string }> => {
  console.log('Voice Streaming Event:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));

  const contactId = event.Details?.ContactData?.ContactId;
  const streamArn =
    event.Details?.ContactData?.MediaStreams?.Customer?.Audio?.StreamARN;
  const startFragmentNumber =
    event.Details?.ContactData?.MediaStreams?.Customer?.Audio
      ?.StartFragmentNumber;

  if (!contactId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Contact ID is required' }),
    };
  }

  if (!streamArn || !startFragmentNumber) {
    console.log('No media stream available yet');
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Waiting for media stream',
        contactId,
      }),
    };
  }

  try {
    // Get ElevenLabs API key
    const apiKey = await getElevenLabsApiKey();
    const agentId = process.env.ELEVENLABS_AGENT_ID;

    if (!agentId) {
      throw new Error('ELEVENLABS_AGENT_ID environment variable not set');
    }

    // Connect to ElevenLabs
    const elevenLabsWs = await connectToElevenLabs(apiKey, agentId);

    // Handle messages from ElevenLabs
    elevenLabsWs.on('message', (data: WebSocket.Data) => {
      try {
        const message: ElevenLabsMessage = JSON.parse(data.toString());
        console.log('ElevenLabs message:', message.type);

        if (message.type === 'audio' && message.audio) {
          // In a full implementation, you would send this audio back to the caller
          // via Amazon Connect's audio output mechanism
          console.log(
            'Received audio from ElevenLabs, length:',
            message.audio.length,
          );
        }

        if (message.type === 'transcript' && message.text) {
          console.log('ElevenLabs transcript:', message.text);
        }
      } catch (error) {
        console.error('Error parsing ElevenLabs message:', error);
      }
    });

    elevenLabsWs.on('close', () => {
      console.log('ElevenLabs WebSocket closed');
    });

    // Start streaming from KVS to ElevenLabs
    await streamFromKvs(streamArn, startFragmentNumber, elevenLabsWs);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Streaming started',
        contactId,
        streamArn,
      }),
    };
  } catch (error) {
    console.error('Error in voice streaming:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
