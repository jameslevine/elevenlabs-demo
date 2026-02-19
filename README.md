# SkyWay Airlines - AI Voice Assistant

A conversational AI voice assistant for airline customer service, powered by **ElevenLabs Conversational AI**.

## 🎯 Features

- **Voice Conversations**: Natural voice interactions with AI agent "Sarah"
- **Flight Changes**: Help customers modify bookings, change dates, or upgrade seats
- **Refunds**: Process refund requests and explain policies
- **Baggage Inquiries**: Answer questions about allowances, lost luggage, and fees
- **Delay Compensation**: Help customers understand rights and process claims

## 🚀 Quick Start

### Prerequisites

- Python 3.x (for local server)
- Modern web browser with microphone access

### Running Locally

1. **Start the local server**:

   ```bash
   cd frontend
   python3 -m http.server 3000
   ```

2. **Open in browser**: http://localhost:3000

3. **Click "Start a call"** → Accept terms → Start talking!

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Web Browser   │────▶│  ElevenLabs Widget   │────▶│  ElevenLabs AI  │
│   (Frontend)    │◀────│  (Embedded)          │◀────│  Agent "Sarah"  │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
```

### Components

- **Frontend** (`frontend/index.html`): Web UI with ElevenLabs embedded widget
- **ElevenLabs Agent**: Conversational AI with voice synthesis
- **Knowledge Base** (`knowledge-base/`): Policy documents for reference

## 📁 Project Structure

```
elevenlabs-demo/
├── frontend/
│   └── index.html          # Web UI with ElevenLabs widget
├── knowledge-base/
│   └── policies/
│       ├── baggage-policy.md
│       ├── delay-compensation.md
│       └── refund-policy.md
├── context/
│   └── architecture.md     # Architecture documentation
├── .gitignore
└── README.md
```

## 🤖 ElevenLabs Agent Details

| Property     | Value                                 |
| ------------ | ------------------------------------- |
| **Agent ID** | `agent_7301khv4dj57e0grp9kxgvghhbgt`  |
| **Name**     | SkyWay Airlines Assistant             |
| **Voice**    | Sarah (Mature, Reassuring, Confident) |
| **Voice ID** | `EXAVITQu4vr4xnSDxMaL`                |
| **LLM**      | Gemini 2.0 Flash                      |
| **Language** | English                               |

## 📋 Agent Capabilities

### Flight Changes

- Modify existing bookings
- Change travel dates
- Upgrade seats
- Add special requests

### Refunds

- **Within 24 hours**: Full refund available
- **After 24 hours**: Refund minus fees based on fare class
- Process refund requests
- Explain refund policies

### Baggage

- **Economy**: 1 checked bag (23kg)
- **Business**: 2 checked bags (32kg each)
- Report lost luggage
- Add extra bags

### Delay Compensation

- Flights delayed 3+ hours qualify
- €250-600 depending on distance
- Process compensation claims
- Explain passenger rights

## 🔧 Configuration

The ElevenLabs agent is configured with:

- **Temperature**: 0.7 (balanced creativity)
- **Stability**: 0.6 (natural voice variation)
- **Similarity Boost**: 0.8 (consistent voice)
- **Max Duration**: 600 seconds (10 minutes)

## 🚀 Future Enhancements with ElevenLabs

ElevenLabs offers many additional features that could enhance this project:

### 🎯 High Priority

| Feature                        | Description                             | Use Case                                                                      |
| ------------------------------ | --------------------------------------- | ----------------------------------------------------------------------------- |
| **Knowledge Base Integration** | Upload documents directly to the agent  | Add airline policies, FAQs, and route information for more accurate responses |
| **Outbound Calls**             | Agent can make phone calls to customers | Proactive notifications for flight delays, booking confirmations              |
| **Phone Number Integration**   | Assign a phone number to the agent      | Allow customers to call a dedicated airline support line                      |
| **Multi-language Support**     | Support 29+ languages                   | Serve international customers in their native language                        |

### 🔊 Voice & Audio

| Feature                   | Description                  | Use Case                                              |
| ------------------------- | ---------------------------- | ----------------------------------------------------- |
| **Voice Cloning**         | Create a custom brand voice  | Consistent airline brand voice across all touchpoints |
| **Speech-to-Speech**      | Transform voice in real-time | Agent could match customer's accent or speaking style |
| **Text-to-Sound Effects** | Generate ambient sounds      | Add airport ambiance, boarding announcements          |
| **Audio Isolation**       | Remove background noise      | Cleaner audio in noisy environments                   |

### 📊 Analytics & Monitoring

| Feature                     | Description                | Use Case                                             |
| --------------------------- | -------------------------- | ---------------------------------------------------- |
| **Conversation History**    | Access past conversations  | Quality assurance, training data, dispute resolution |
| **Conversation Analytics**  | Track metrics and patterns | Identify common issues, improve agent responses      |
| **Subscription Monitoring** | Track API usage            | Cost management and capacity planning                |

### 🎵 Creative Features

| Feature               | Description                         | Use Case                                  |
| --------------------- | ----------------------------------- | ----------------------------------------- |
| **Music Composition** | Generate custom music               | Hold music, promotional jingles           |
| **Voice Design**      | Create new voices from descriptions | Design the perfect customer service voice |
| **Sound Effects**     | Generate custom sounds              | Notification sounds, UI feedback          |

### 🔌 Integration Options

| Feature                | Description                    | Use Case                                       |
| ---------------------- | ------------------------------ | ---------------------------------------------- |
| **Twilio Integration** | Connect to phone systems       | Enterprise telephony integration               |
| **SIP Trunk Support**  | Direct phone system connection | Connect to existing call center infrastructure |
| **Webhook Events**     | Real-time event notifications  | Trigger workflows based on conversation events |

## 🤖 Built with AI Tooling

This project was built using AI-assisted development, demonstrating the power of modern AI tools for rapid prototyping and development.

### Development Journey

#### Phase 1: Initial AWS Architecture (Scrapped)

We initially attempted to build a complex AWS-based solution using:

- **Amazon Connect** - Contact center platform
- **Amazon Lex** - Conversational AI
- **AWS Lambda** - Serverless compute
- **DynamoDB** - Session storage
- **Kinesis Video Streams** - Audio streaming
- **CloudFormation** - Infrastructure as Code

This approach involved:

- 8+ CloudFormation templates
- Multiple Lambda handlers
- Complex IAM policies
- KMS encryption for secrets
- Integration challenges with ElevenLabs voice

#### Phase 2: Pivot to ElevenLabs-Only Solution

After encountering integration challenges, we pivoted to a simpler, more elegant solution using ElevenLabs' native capabilities:

- **Single HTML file** for the frontend
- **ElevenLabs Conversational AI** for everything else
- **No backend infrastructure** required

### AI Tools Used

| Tool                      | Purpose                                                                    |
| ------------------------- | -------------------------------------------------------------------------- |
| **Cline (Claude AI)**     | AI coding assistant that wrote all code, infrastructure, and documentation |
| **ElevenLabs MCP Server** | Model Context Protocol server for direct ElevenLabs API integration        |
| **AWS MCP Servers**       | CloudFormation and documentation servers for AWS integration               |

### Key AI-Assisted Tasks

1. **Architecture Design**: AI analyzed requirements and proposed multiple architectures
2. **Code Generation**: All TypeScript, YAML, HTML, CSS, and JavaScript written by AI
3. **Infrastructure as Code**: CloudFormation templates generated and validated
4. **Debugging**: AI diagnosed issues with AWS permissions, KMS policies, and API integrations
5. **Refactoring**: AI identified when to pivot from complex to simple solution
6. **Documentation**: README, architecture docs, and inline comments all AI-generated
7. **Agent Creation**: Used ElevenLabs MCP to create and configure the conversational AI agent

### Development Statistics

| Metric                        | Value                            |
| ----------------------------- | -------------------------------- |
| **Total Development Time**    | ~4 hours                         |
| **Lines of Code Written**     | 2,000+ (before cleanup)          |
| **Final Lines of Code**       | ~700                             |
| **AWS Resources Attempted**   | 15+                              |
| **Final Solution Complexity** | 1 HTML file + 1 ElevenLabs agent |

### Lessons Learned

1. **Start Simple**: The ElevenLabs embedded widget provides 90% of functionality with 10% of complexity
2. **AI Accelerates Iteration**: Rapid prototyping allowed quick pivots when approaches didn't work
3. **MCP Servers are Powerful**: Direct API integration through MCP enabled seamless agent creation
4. **Documentation Matters**: AI-generated docs ensure knowledge is captured as you build

## 🌐 Deployment Options

### Static Hosting

The frontend can be deployed to any static hosting service:

- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any web server

### Example: Deploy to GitHub Pages

```bash
# Push to GitHub and enable Pages in repository settings
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

## 📝 License

MIT License

## 🙏 Acknowledgments

- [ElevenLabs](https://elevenlabs.io) - Conversational AI and Voice Synthesis
- [Cline](https://cline.bot) - AI Coding Assistant
- Voice: Sarah from ElevenLabs voice library
