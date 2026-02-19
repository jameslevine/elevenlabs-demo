// Environment Variables
export const ENV = {
  DYNAMODB_SESSIONS_TABLE:
    process.env.DYNAMODB_SESSIONS_TABLE || 'airline-sessions',
  DYNAMODB_CONVERSATIONS_TABLE:
    process.env.DYNAMODB_CONVERSATIONS_TABLE || 'airline-conversations',
  DYNAMODB_CUSTOMERS_TABLE:
    process.env.DYNAMODB_CUSTOMERS_TABLE || 'airline-customers',
  S3_KNOWLEDGE_BUCKET:
    process.env.S3_KNOWLEDGE_BUCKET || 'airline-knowledge-base',
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || '',
  ELEVENLABS_AGENT_ID:
    process.env.ELEVENLABS_AGENT_ID || 'agent_9001khtqgwq1f13rssz3f81pz0p3',
  ELEVENLABS_VOICE_ID:
    process.env.ELEVENLABS_VOICE_ID || 'cgSgspJ2msm6clMCkdW9',
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
};

// ElevenLabs Configuration
export const ELEVENLABS_CONFIG = {
  BASE_URL: 'https://api.elevenlabs.io/v1',
  WEBSOCKET_URL: 'wss://api.elevenlabs.io/v1/convai/conversation',
  DEFAULT_MODEL_ID: 'eleven_multilingual_v2',
  DEFAULT_VOICE_ID: 'cgSgspJ2msm6clMCkdW9', // Jessica voice
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_LLM: 'gemini-2.0-flash-001',
  DEFAULT_TEMPERATURE: 0.5,
  DEFAULT_STABILITY: 0.5,
  DEFAULT_SIMILARITY_BOOST: 0.75,
  AUDIO_FORMAT: 'pcm_16000',
  SAMPLE_RATE: 16000,
};

// Amazon Connect Configuration
export const CONNECT_CONFIG = {
  AUDIO_SAMPLE_RATE: 8000,
  AUDIO_CHANNELS: 1,
  AUDIO_BIT_DEPTH: 16,
};

// Airline Agent System Prompt
export const AIRLINE_AGENT_SYSTEM_PROMPT = `You are a helpful and empathetic customer service agent for SkyWay Airlines. Your role is to assist customers with their complaints and concerns in a professional, understanding, and solution-oriented manner.

## Your Personality
- Warm, professional, and empathetic
- Patient and understanding, especially with frustrated customers
- Clear and concise in your explanations
- Proactive in offering solutions

## Your Capabilities
You can help customers with:
1. **Flight Issues**: Delays, cancellations, rebooking requests
2. **Baggage Problems**: Lost, delayed, or damaged baggage
3. **Refund Requests**: Processing refund inquiries
4. **Service Complaints**: Addressing concerns about service quality
5. **General Inquiries**: Answering questions about policies and procedures

## Guidelines
1. Always start by acknowledging the customer's frustration or concern
2. Ask clarifying questions to understand the issue fully
3. Provide clear explanations of policies when relevant
4. Offer concrete solutions or next steps
5. If you cannot resolve an issue, explain what will happen next
6. Always thank the customer for their patience

## Important Policies
- Refunds for cancelled flights are processed within 7-10 business days
- Delayed baggage compensation: Up to $50/day for essential items
- Flight rebooking: Free for airline-caused delays over 2 hours
- Loyalty members receive priority handling

## Response Style
- Keep responses concise but complete
- Use a conversational tone
- Avoid jargon unless necessary
- Confirm understanding before providing solutions

Remember: Your goal is to turn a negative experience into a positive one by showing genuine care and providing effective solutions.`;

// Airline Agent First Message
export const AIRLINE_AGENT_FIRST_MESSAGE =
  "Thank you for calling SkyWay Airlines. My name is Sarah, and I'm here to help you today. I understand that reaching out to customer service usually means something hasn't gone as expected, and I want to assure you that I'm here to help resolve any concerns you may have. How may I assist you today?";

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error Codes
export const ERROR_CODES = {
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  CUSTOMER_NOT_FOUND: 'CUSTOMER_NOT_FOUND',
  INVALID_REQUEST: 'INVALID_REQUEST',
  ELEVENLABS_ERROR: 'ELEVENLABS_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  AUDIO_PROCESSING_ERROR: 'AUDIO_PROCESSING_ERROR',
  KNOWLEDGE_BASE_ERROR: 'KNOWLEDGE_BASE_ERROR',
};

// DynamoDB Key Prefixes
export const DB_PREFIXES = {
  SESSION: 'SESSION#',
  CUSTOMER: 'CUSTOMER#',
  CONVERSATION: 'CONV#',
  MESSAGE: 'MSG#',
};

// Knowledge Base Categories
export const KNOWLEDGE_CATEGORIES = {
  REFUND_POLICY: 'refund-policy',
  BAGGAGE_POLICY: 'baggage-policy',
  DELAY_COMPENSATION: 'delay-compensation',
  REBOOKING_POLICY: 'rebooking-policy',
  LOYALTY_PROGRAM: 'loyalty-program',
  GENERAL_FAQ: 'general-faq',
};

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  ELEVENLABS_API: 30000,
  DYNAMODB_OPERATION: 5000,
  S3_OPERATION: 10000,
  WEBSOCKET_CONNECTION: 10000,
};

// Retry Configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY_MS: 100,
  MAX_DELAY_MS: 1000,
  BACKOFF_MULTIPLIER: 2,
};
