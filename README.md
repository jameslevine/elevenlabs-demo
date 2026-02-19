# Airline Contact Center - ElevenLabs Voice AI Demo

An agentic system for an airline contact center using Amazon Connect and ElevenLabs for voice AI capabilities.

## Overview

This project demonstrates a voice-enabled AI agent for handling customer complaints in an airline contact center. The system uses:

- **Amazon Connect** - Contact center platform for handling inbound calls
- **ElevenLabs** - Voice AI (Conversational AI, Text-to-Speech, Speech-to-Text)
- **AWS Lambda** - Serverless compute for orchestration
- **Amazon Kinesis Video Streams** - Real-time audio streaming
- **Amazon DynamoDB** - Session state and conversation history
- **Amazon S3** - Knowledge base storage

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           AIRLINE CONTACT CENTER                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────┐     ┌──────────────────┐     ┌─────────────────────────────┐  │
│  │   Customer   │────▶│  Amazon Connect  │────▶│   Kinesis Video Streams     │  │
│  │   (Phone)    │◀────│  Contact Flow    │◀────│   (Audio Streaming)         │  │
│  └──────────────┘     └────────┬─────────┘     └──────────────┬──────────────┘  │
│                                │                              │                  │
│                                ▼                              ▼                  │
│                       ┌────────────────┐            ┌─────────────────────┐     │
│                       │  Lambda        │◀──────────▶│  ElevenLabs         │     │
│                       │  Orchestrator  │            │  Conversational AI  │     │
│                       └────────┬───────┘            └─────────────────────┘     │
│                                │                                                 │
│         ┌──────────────────────┼──────────────────────┐                         │
│         ▼                      ▼                      ▼                         │
│  ┌─────────────┐      ┌───────────────┐      ┌───────────────┐                  │
│  │  DynamoDB   │      │   S3 Bucket   │      │  Secrets      │                  │
│  │  (Sessions) │      │  (Knowledge   │      │  Manager      │                  │
│  │             │      │   Base)       │      │  (API Keys)   │                  │
│  └─────────────┘      └───────────────┘      └───────────────┘                  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Features

- **Customer Complaint Handling** - AI-powered voice agent for handling airline complaints
- **Knowledge Base Integration** - Access to airline policies, procedures, and FAQs
- **Real-time Voice Processing** - Low-latency speech-to-text and text-to-speech
- **Session Management** - Persistent conversation context across interactions
- **Mock Backend Services** - Ready for integration with airline systems

## Project Structure

```
elevenlabs-demo/
├── infrastructure/           # CloudFormation templates
│   ├── main.yaml            # Main stack
│   ├── connect.yaml         # Amazon Connect resources
│   ├── kinesis.yaml         # Kinesis Video Streams
│   ├── lambda.yaml          # Lambda functions
│   ├── dynamodb.yaml        # DynamoDB tables
│   ├── s3.yaml              # S3 buckets
│   └── secrets.yaml         # Secrets Manager
│
├── backend/                  # Lambda functions (TypeScript)
│   ├── src/
│   │   ├── handlers/        # Lambda handlers
│   │   ├── adapters/        # External service adapters
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── constants/       # Constants and enums
│   ├── tests/               # Unit tests
│   ├── package.json
│   └── tsconfig.json
│
├── knowledge-base/           # Airline knowledge base
│   ├── policies/            # Airline policies
│   ├── procedures/          # Standard procedures
│   └── faqs/                # Frequently asked questions
│
├── connect-flows/            # Amazon Connect contact flows
│   └── complaint-handler.json
│
└── context/                  # Architecture documentation
    └── architecture.md
```

## Prerequisites

- AWS Account with Amazon Connect enabled
- ElevenLabs API key
- Node.js 18+
- AWS SAM CLI
- AWS CLI configured with appropriate credentials

## Deployment

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Deploy Infrastructure

```bash
sam build
sam deploy --guided
```

### 3. Configure Amazon Connect

1. Create an Amazon Connect instance
2. Import the contact flow from `connect-flows/complaint-handler.json`
3. Assign a phone number to the contact flow

## Environment Variables

| Variable              | Description                      |
| --------------------- | -------------------------------- |
| `ELEVENLABS_API_KEY`  | ElevenLabs API key               |
| `DYNAMODB_TABLE`      | DynamoDB table name for sessions |
| `S3_KNOWLEDGE_BUCKET` | S3 bucket for knowledge base     |

## Testing

```bash
cd backend
npm test
```

## License

MIT
