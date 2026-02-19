# Airline Contact Center Architecture

## System Overview

This document describes the architecture of the Airline Contact Center system, which uses Amazon Connect for telephony and ElevenLabs for voice AI capabilities.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              AIRLINE CONTACT CENTER SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌─────────────┐                                                                         │
│  │  Customer   │                                                                         │
│  │  (Phone)    │                                                                         │
│  └──────┬──────┘                                                                         │
│         │                                                                                │
│         │ PSTN/SIP                                                                       │
│         ▼                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                           AMAZON CONNECT LAYER                                   │    │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐  │    │
│  │  │  Phone Number   │───▶│  Contact Flow   │───▶│  Live Media Streaming       │  │    │
│  │  │  (Toll-Free)    │    │  (IVR Logic)    │    │  (Start/Stop)               │  │    │
│  │  └─────────────────┘    └────────┬────────┘    └──────────────┬──────────────┘  │    │
│  │                                  │                            │                  │    │
│  │                                  │ Invoke Lambda              │ Audio Stream     │    │
│  │                                  ▼                            ▼                  │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                     │                            │                       │
│         ┌───────────────────────────┘                            │                       │
│         │                                                        │                       │
│         ▼                                                        ▼                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                           AWS COMPUTE LAYER                                      │    │
│  │                                                                                  │    │
│  │  ┌─────────────────────┐         ┌─────────────────────────────────────────┐   │    │
│  │  │  Contact Flow       │         │  Kinesis Video Streams                   │   │    │
│  │  │  Lambda Handler     │         │  ┌─────────────────────────────────────┐ │   │    │
│  │  │  ─────────────────  │         │  │ AUDIO_FROM_CUSTOMER (Inbound)       │ │   │    │
│  │  │  • Session Init     │         │  │ AUDIO_TO_CUSTOMER (Outbound)        │ │   │    │
│  │  │  • Context Lookup   │         │  └─────────────────────────────────────┘ │   │    │
│  │  │  • Response Routing │         │                    │                      │   │    │
│  │  └──────────┬──────────┘         └────────────────────┼──────────────────────┘   │    │
│  │             │                                         │                          │    │
│  │             │                                         ▼                          │    │
│  │             │                    ┌─────────────────────────────────────────┐     │    │
│  │             │                    │  Audio Processor Lambda                 │     │    │
│  │             │                    │  ─────────────────────────────────────  │     │    │
│  │             │                    │  • Consume KVS Stream                   │     │    │
│  │             │                    │  • Convert Audio Format                 │     │    │
│  │             │                    │  • Stream to ElevenLabs                 │     │    │
│  │             │                    │  • Receive TTS Response                 │     │    │
│  │             │                    │  • Write to KVS (Outbound)              │     │    │
│  │             │                    └──────────────────┬──────────────────────┘     │    │
│  │             │                                       │                            │    │
│  └─────────────┼───────────────────────────────────────┼────────────────────────────┘    │
│                │                                       │                                 │
│                │                                       │ WebSocket/HTTPS                 │
│                │                                       ▼                                 │
│  ┌─────────────┼───────────────────────────────────────────────────────────────────┐    │
│  │             │              ELEVENLABS INTEGRATION LAYER                          │    │
│  │             │                                                                    │    │
│  │             │    ┌─────────────────────────────────────────────────────────┐    │    │
│  │             │    │                 ElevenLabs Conversational AI             │    │    │
│  │             │    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │    │    │
│  │             │    │  │   STT       │  │   Agent     │  │      TTS        │  │    │    │
│  │             │    │  │  (Speech    │─▶│  (LLM +     │─▶│  (Voice         │  │    │    │
│  │             │    │  │   to Text)  │  │   Context)  │  │   Synthesis)    │  │    │    │
│  │             │    │  └─────────────┘  └──────┬──────┘  └─────────────────┘  │    │    │
│  │             │    │                          │                              │    │    │
│  │             │    │                          │ Knowledge Query              │    │    │
│  │             │    │                          ▼                              │    │    │
│  │             │    │                   ┌─────────────┐                       │    │    │
│  │             │    │                   │  Knowledge  │                       │    │    │
│  │             │    │                   │    Base     │                       │    │    │
│  │             │    │                   └─────────────┘                       │    │    │
│  │             │    └─────────────────────────────────────────────────────────┘    │    │
│  │             │                                                                    │    │
│  └─────────────┼────────────────────────────────────────────────────────────────────┘    │
│                │                                                                         │
│                │                                                                         │
│  ┌─────────────┼────────────────────────────────────────────────────────────────────┐    │
│  │             │                    DATA LAYER                                       │    │
│  │             │                                                                     │    │
│  │             ▼                                                                     │    │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐   │    │
│  │  │    DynamoDB     │    │       S3        │    │    Secrets Manager          │   │    │
│  │  │  ─────────────  │    │  ─────────────  │    │  ─────────────────────────  │   │    │
│  │  │  • Sessions     │    │  • Policies     │    │  • ElevenLabs API Key       │   │    │
│  │  │  • Conversation │    │  • Procedures   │    │  • Other Credentials        │   │    │
│  │  │    History      │    │  • FAQs         │    │                             │   │    │
│  │  │  • Customer     │    │  • Transcripts  │    │                             │   │    │
│  │  │    Context      │    │                 │    │                             │   │    │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────────────────┘   │    │
│  │                                                                                   │    │
│  └───────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐   │
│  │                         MOCK BACKEND SERVICES                                      │   │
│  │                                                                                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │   │
│  │  │ Reservation │  │   Loyalty   │  │    CRM      │  │       Baggage           │  │   │
│  │  │   System    │  │   Program   │  │   System    │  │       Tracking          │  │   │
│  │  │ ─────────── │  │ ─────────── │  │ ─────────── │  │ ─────────────────────── │  │   │
│  │  │ • Bookings  │  │ • Points    │  │ • History   │  │ • Status                │  │   │
│  │  │ • Flights   │  │ • Tier      │  │ • Prefs     │  │ • Location              │  │   │
│  │  │ • Seats     │  │ • Benefits  │  │ • Notes     │  │ • Claims                │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────────┘  │   │
│  │                                                                                    │   │
│  └────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Amazon Connect Layer

#### Phone Number

- Toll-free or DID number assigned to the contact flow
- Handles PSTN/SIP connectivity

#### Contact Flow

- Entry point for all inbound calls
- Manages IVR logic and routing
- Initiates live media streaming
- Invokes Lambda functions for business logic
- Integrates with Amazon Lex V2 for natural language understanding

#### Amazon Lex V2 Bot

- Bot Name: `dev-airline-voice-agent`
- Bot ID: `NLVRIWKCZR`
- Alias: `devLive` (ID: `CDYFS1W9KM`)
- Intents:
  - **FlightChangeIntent**: Handle flight change requests
  - **RefundIntent**: Process refund requests
  - **BaggageIntent**: Answer baggage questions
  - **DelayCompensationIntent**: Handle delay compensation claims
  - **FallbackIntent**: Handle unrecognized requests

#### Live Media Streaming

- Streams audio to Kinesis Video Streams
- Bidirectional: AUDIO_FROM_CUSTOMER and AUDIO_TO_CUSTOMER
- PCM audio format at 8kHz

### 2. AWS Compute Layer

#### Contact Flow Lambda Handler

- Triggered by Amazon Connect contact flow
- Initializes session in DynamoDB
- Retrieves customer context
- Routes responses back to contact flow

#### Audio Processor Lambda

- Consumes audio from Kinesis Video Streams
- Converts audio format for ElevenLabs compatibility
- Manages WebSocket connection to ElevenLabs
- Streams TTS responses back to customer

#### Kinesis Video Streams

- Real-time audio streaming
- Two tracks: inbound (customer) and outbound (agent)
- Retention for compliance and analytics

### 3. ElevenLabs Integration Layer

#### Speech-to-Text (STT)

- Real-time transcription of customer speech
- Supports multiple languages
- Low latency for conversational flow

#### Conversational AI Agent

- LLM-powered conversation management
- System prompt configured for airline context
- Knowledge base integration for accurate responses
- Handles complaint scenarios

#### Text-to-Speech (TTS)

- Natural voice synthesis
- Configurable voice characteristics
- Streaming output for low latency

### 4. Data Layer

#### DynamoDB Tables

- **Sessions Table**: Active call sessions
- **Conversations Table**: Conversation history
- **Customer Context Table**: Customer preferences and history

#### S3 Buckets

- **Knowledge Base**: Airline policies, procedures, FAQs
- **Transcripts**: Call transcripts for compliance
- **Audio Archives**: Recorded calls (if enabled)

#### Secrets Manager

- ElevenLabs API key
- Other sensitive credentials

### 5. Mock Backend Services

These services simulate airline backend systems for demo purposes:

#### Reservation System

- Flight bookings and modifications
- Seat assignments
- Itinerary management

#### Loyalty Program

- Frequent flyer points
- Membership tier
- Benefits and rewards

#### CRM System

- Customer interaction history
- Preferences and notes
- Complaint history

#### Baggage Tracking

- Baggage status
- Location tracking
- Claim management

## Data Flow

### Inbound Call Flow

1. Customer calls the toll-free number
2. Amazon Connect receives the call
3. Contact flow starts and initiates live media streaming
4. Audio streams to Kinesis Video Streams
5. Audio Processor Lambda consumes the stream
6. Customer speech is sent to ElevenLabs STT
7. Transcribed text is processed by the AI agent
8. Agent queries knowledge base and mock backends
9. Response is generated and sent to ElevenLabs TTS
10. Audio response streams back through KVS
11. Customer hears the response
12. Loop continues until call ends

### Session Management

1. Contact Flow Lambda creates session in DynamoDB
2. Session ID is passed as contact attribute
3. Audio Processor Lambda retrieves session context
4. Conversation history is updated in real-time
5. Session is closed when call ends

## Security Considerations

### Authentication & Authorization

- IAM roles for Lambda functions
- Secrets Manager for API keys
- VPC endpoints for private connectivity

### Data Protection

- Encryption at rest (S3, DynamoDB)
- Encryption in transit (TLS)
- PII handling compliance

### Compliance

- Call recording consent
- Data retention policies
- Audit logging

## Scalability

### Design for 100 calls/hour

- Lambda concurrency: 100 concurrent executions
- DynamoDB on-demand capacity
- KVS with sufficient shards
- ElevenLabs API rate limits considered

### Auto-scaling

- Lambda scales automatically
- DynamoDB on-demand scales with load
- CloudWatch alarms for monitoring

## Monitoring & Observability

### CloudWatch Metrics

- Lambda invocations and errors
- DynamoDB read/write capacity
- KVS stream metrics

### CloudWatch Logs

- Lambda function logs
- Contact flow logs
- API Gateway logs

### Alarms

- Error rate thresholds
- Latency thresholds
- Capacity warnings

## Cost Optimization

### Pay-per-use Services

- Lambda: Pay per invocation
- DynamoDB: On-demand pricing
- S3: Pay for storage and requests

### Cost Monitoring

- AWS Cost Explorer
- Budget alerts
- Resource tagging for cost allocation
