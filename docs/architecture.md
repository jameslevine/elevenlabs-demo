# SkyWay Airlines - Architecture Documentation

## Overview

This project implements a conversational AI voice assistant for airline customer service using **ElevenLabs Conversational AI**. The solution provides a web-based interface where customers can have natural voice conversations with an AI agent named "Sarah".

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER DEVICE                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        Web Browser                               │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │              SkyWay Airlines Web UI                      │   │   │
│  │  │         (frontend/index.html)                            │   │   │
│  │  │                                                          │   │   │
│  │  │  ┌────────────────────────────────────────────────────┐ │   │   │
│  │  │  │         ElevenLabs Embedded Widget                  │ │   │   │
│  │  │  │    <elevenlabs-convai agent-id="...">              │ │   │   │
│  │  │  └────────────────────────────────────────────────────┘ │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ WebSocket / HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        ELEVENLABS CLOUD                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                  Conversational AI Platform                      │   │
│  │                                                                  │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │   │
│  │  │   Speech     │  │    LLM       │  │   Text-to-Speech     │  │   │
│  │  │ Recognition  │──│  (Gemini)    │──│   (Sarah Voice)      │  │   │
│  │  │   (ASR)      │  │              │  │                      │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘  │   │
│  │                                                                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │              Agent: SkyWay Airlines Assistant             │  │   │
│  │  │              ID: agent_7301khv4dj57e0grp9kxgvghhbgt       │  │   │
│  │  │              Voice: Sarah (EXAVITQu4vr4xnSDxMaL)          │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Frontend (Web UI)

**Location**: `frontend/index.html`

A single-page web application that provides:

- Beautiful dark-themed UI for SkyWay Airlines
- ElevenLabs embedded widget for voice conversations
- Agent information display (Sarah - Virtual Customer Service Agent)
- Feature cards explaining available services

**Technologies**:

- HTML5
- CSS3 (custom styling, no frameworks)
- JavaScript (vanilla)
- ElevenLabs Convai Widget

### 2. ElevenLabs Conversational AI Agent

**Agent Configuration**:
| Setting | Value |
|---------|-------|
| Agent ID | `agent_7301khv4dj57e0grp9kxgvghhbgt` |
| Name | SkyWay Airlines Assistant |
| Voice | Sarah (Mature, Reassuring, Confident) |
| Voice ID | `EXAVITQu4vr4xnSDxMaL` |
| LLM | Gemini 2.0 Flash |
| Language | English |
| Temperature | 0.7 |
| Stability | 0.6 |
| Similarity Boost | 0.8 |
| Max Duration | 600 seconds |

**System Prompt**:
The agent is configured to act as Sarah, a professional and friendly customer service agent for SkyWay Airlines, capable of helping with:

- Flight changes
- Refunds
- Baggage inquiries
- Delay compensation

### 3. Knowledge Base

**Location**: `knowledge-base/policies/`

Reference documents containing airline policies:

- `baggage-policy.md` - Baggage allowances and fees
- `delay-compensation.md` - Compensation rules for delays
- `refund-policy.md` - Refund policies and procedures

## Data Flow

```
1. User speaks into microphone
         │
         ▼
2. Browser captures audio via WebRTC
         │
         ▼
3. Audio streamed to ElevenLabs via WebSocket
         │
         ▼
4. ElevenLabs ASR converts speech to text
         │
         ▼
5. Text sent to LLM (Gemini 2.0 Flash) with system prompt
         │
         ▼
6. LLM generates response based on airline policies
         │
         ▼
7. Response text sent to TTS (Sarah voice)
         │
         ▼
8. Audio streamed back to browser
         │
         ▼
9. User hears Sarah's response
```

## Security Considerations

- **No API keys in frontend**: The ElevenLabs widget uses the agent ID only
- **HTTPS required**: All communication is encrypted
- **Microphone permissions**: Browser prompts user for consent
- **Terms acceptance**: Users must accept terms before starting

## Deployment

### Local Development

```bash
cd frontend
python3 -m http.server 3000
# Open http://localhost:3000
```

### Production Deployment

The frontend can be deployed to any static hosting service:

- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any web server

## Future Enhancements

1. **Knowledge Base Integration**: Add knowledge base documents to the ElevenLabs agent for more accurate responses
2. **Multi-language Support**: Add support for additional languages
3. **Analytics Dashboard**: Track conversation metrics and customer satisfaction
4. **Phone Integration**: Add phone number support via ElevenLabs phone features
5. **Custom Voice**: Create a custom voice clone for brand consistency
