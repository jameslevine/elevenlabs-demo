// Session Types
export interface Session {
  sessionId: string;
  contactId: string;
  customerId?: string;
  phoneNumber: string;
  status: SessionStatus;
  startTime: string;
  endTime?: string;
  metadata: SessionMetadata;
  createdAt: string;
  updatedAt: string;
}

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  TRANSFERRED = 'TRANSFERRED',
}

export interface SessionMetadata {
  agentId?: string;
  queueName?: string;
  contactFlowId?: string;
  kvsStreamArn?: string;
  elevenlabsConversationId?: string;
}

// Conversation Types
export interface ConversationMessage {
  messageId: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  metadata?: MessageMetadata;
}

export enum MessageRole {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  SYSTEM = 'SYSTEM',
}

export interface MessageMetadata {
  confidence?: number;
  intent?: string;
  entities?: Record<string, string>;
  sentiment?: Sentiment;
}

export enum Sentiment {
  POSITIVE = 'POSITIVE',
  NEUTRAL = 'NEUTRAL',
  NEGATIVE = 'NEGATIVE',
}

// Customer Types
export interface Customer {
  customerId: string;
  phoneNumber: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  loyaltyTier?: LoyaltyTier;
  loyaltyPoints?: number;
  preferences?: CustomerPreferences;
  createdAt: string;
  updatedAt: string;
}

export enum LoyaltyTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

export interface CustomerPreferences {
  language?: string;
  communicationChannel?: string;
  specialAssistance?: string[];
}

// Amazon Connect Types
export interface ConnectContactFlowEvent {
  Name: string;
  Details: {
    ContactData: ContactData;
    Parameters: Record<string, string>;
  };
}

export interface ContactData {
  Attributes: Record<string, string>;
  Channel: string;
  ContactId: string;
  CustomerEndpoint: {
    Address: string;
    Type: string;
  };
  InitialContactId: string;
  InitiationMethod: string;
  InstanceARN: string;
  MediaStreams: {
    Customer: {
      Audio: {
        StartFragmentNumber?: string;
        StartTimestamp?: string;
        StreamARN?: string;
      };
    };
  };
  PreviousContactId?: string;
  Queue?: {
    ARN: string;
    Name: string;
  };
  SystemEndpoint: {
    Address: string;
    Type: string;
  };
}

export interface ConnectContactFlowResponse {
  sessionId?: string;
  customerId?: string;
  greeting?: string;
  [key: string]: string | undefined;
}

// ElevenLabs Types
export interface ElevenLabsConfig {
  apiKey: string;
  agentId?: string;
  voiceId?: string;
  modelId?: string;
}

export interface ElevenLabsConversationConfig {
  agentId: string;
  systemPrompt: string;
  firstMessage: string;
  voiceId: string;
  language: string;
  llm: string;
  temperature: number;
  maxTokens?: number;
  stability: number;
  similarityBoost: number;
}

export interface ElevenLabsSTTRequest {
  audio: Buffer;
  languageCode?: string;
}

export interface ElevenLabsSTTResponse {
  text: string;
  confidence: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export interface ElevenLabsTTSRequest {
  text: string;
  voiceId: string;
  modelId?: string;
  voiceSettings?: {
    stability: number;
    similarityBoost: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };
}

export interface ElevenLabsTTSResponse {
  audio: Buffer;
  contentType: string;
}

// Knowledge Base Types
export interface KnowledgeBaseDocument {
  documentId: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  keywords: string[];
  lastUpdated: string;
}

export enum KnowledgeCategory {
  POLICY = 'POLICY',
  PROCEDURE = 'PROCEDURE',
  FAQ = 'FAQ',
}

export interface KnowledgeSearchResult {
  documentId: string;
  title: string;
  snippet: string;
  relevanceScore: number;
}

// Mock Backend Types - Reservation System
export interface Reservation {
  confirmationNumber: string;
  customerId: string;
  flights: Flight[];
  passengers: Passenger[];
  status: ReservationStatus;
  totalPrice: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Flight {
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  status: FlightStatus;
  aircraft?: string;
  gate?: string;
  terminal?: string;
}

export enum FlightStatus {
  SCHEDULED = 'SCHEDULED',
  DELAYED = 'DELAYED',
  CANCELLED = 'CANCELLED',
  BOARDING = 'BOARDING',
  DEPARTED = 'DEPARTED',
  ARRIVED = 'ARRIVED',
}

export enum ReservationStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export interface Passenger {
  passengerId: string;
  firstName: string;
  lastName: string;
  seatNumber?: string;
  mealPreference?: string;
  specialAssistance?: string[];
}

// Mock Backend Types - Baggage
export interface BaggageClaim {
  claimId: string;
  customerId: string;
  confirmationNumber: string;
  baggageTag: string;
  status: BaggageStatus;
  description: string;
  lastKnownLocation?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export enum BaggageStatus {
  CHECKED_IN = 'CHECKED_IN',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED = 'ARRIVED',
  DELAYED = 'DELAYED',
  LOST = 'LOST',
  FOUND = 'FOUND',
  DELIVERED = 'DELIVERED',
}

// Complaint Types
export interface Complaint {
  complaintId: string;
  customerId: string;
  sessionId: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ComplaintCategory {
  FLIGHT_DELAY = 'FLIGHT_DELAY',
  FLIGHT_CANCELLATION = 'FLIGHT_CANCELLATION',
  BAGGAGE_LOST = 'BAGGAGE_LOST',
  BAGGAGE_DAMAGED = 'BAGGAGE_DAMAGED',
  BAGGAGE_DELAYED = 'BAGGAGE_DELAYED',
  SERVICE_QUALITY = 'SERVICE_QUALITY',
  REFUND_REQUEST = 'REFUND_REQUEST',
  REBOOKING = 'REBOOKING',
  OTHER = 'OTHER',
}

export enum ComplaintStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  ESCALATED = 'ESCALATED',
}

export enum ComplaintPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Pagination Types
export interface PaginatedResponse<T> {
  items: T[];
  nextToken?: string;
  totalCount?: number;
}

export interface PaginationParams {
  limit?: number;
  nextToken?: string;
}
