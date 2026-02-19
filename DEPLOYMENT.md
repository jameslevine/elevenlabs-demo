# Deployment Guide - Airline Contact Center

This guide provides step-by-step instructions for deploying the Airline Contact Center with ElevenLabs Voice AI.

## Prerequisites

### AWS Requirements

- AWS Account with appropriate permissions
- AWS CLI configured with credentials
- AWS SAM CLI installed
- Amazon Connect enabled in your AWS account

### ElevenLabs Requirements

- ElevenLabs account (free tier available)
- API key from ElevenLabs dashboard
- Agent ID: `agent_9001khtqgwq1f13rssz3f81pz0p3` (pre-configured)

### Development Tools

- Node.js 18+
- npm or yarn
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone git@github.com:jameslevine/elevenlabs-demo.git
cd elevenlabs-demo
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Build the Project

```bash
npm run build
```

### 4. Deploy to AWS

```bash
cd ../infrastructure
sam build
sam deploy --guided
```

During the guided deployment, you'll be prompted for:

| Parameter         | Description               | Example                              |
| ----------------- | ------------------------- | ------------------------------------ |
| Stack Name        | CloudFormation stack name | `airline-contact-center-dev`         |
| AWS Region        | Deployment region         | `us-east-1`                          |
| Environment       | Environment name          | `dev`                                |
| ElevenLabsApiKey  | Your ElevenLabs API key   | `sk_xxx...`                          |
| ElevenLabsAgentId | Pre-configured agent ID   | `agent_9001khtqgwq1f13rssz3f81pz0p3` |

## Detailed Deployment Steps

### Step 1: Configure AWS Credentials

Ensure your AWS credentials are configured:

```bash
aws configure
```

Or set environment variables:

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

### Step 2: Deploy Infrastructure

The infrastructure is deployed using AWS SAM (Serverless Application Model).

```bash
cd infrastructure
sam build
sam deploy \
  --stack-name airline-contact-center-dev \
  --parameter-overrides \
    Environment=dev \
    ElevenLabsApiKey=sk_your_api_key \
    ElevenLabsAgentId=agent_9001khtqgwq1f13rssz3f81pz0p3 \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --resolve-s3
```

### Step 3: Upload Knowledge Base

Upload the knowledge base documents to S3:

```bash
# Get the bucket name from CloudFormation outputs
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name airline-contact-center-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`KnowledgeBucketName`].OutputValue' \
  --output text)

# Upload knowledge base documents
aws s3 sync knowledge-base/ s3://$BUCKET_NAME/
```

### Step 4: Configure Amazon Connect

1. **Access Amazon Connect Console**
   - Navigate to Amazon Connect in AWS Console
   - Select your instance (created by CloudFormation)

2. **Claim a Phone Number**
   - Go to Phone Numbers
   - Claim a toll-free or DID number
   - Associate with the contact flow

3. **Configure Contact Flow with Lex V2 Bot**
   - Go to Contact Flows
   - Edit the "Airline Voice Agent" contact flow
   - Add the following blocks in order:
     1. **Set recording behavior** - Enable call recording
     2. **Invoke AWS Lambda function** - Select `dev-airline-contact-flow`
     3. **Play prompt** - "Welcome to SkyWay Airlines..."
     4. **Get customer input** - Configure with Lex V2 bot:
        - Bot: `dev-airline-voice-agent`
        - Alias: `devLive`
        - Bot ID: `NLVRIWKCZR`
        - Alias ID: `CDYFS1W9KM`
     5. **Disconnect** - End the call

4. **Configure Lambda Integration**
   - In the contact flow, add "Invoke AWS Lambda function" block
   - Select the `ContactFlowFunction` Lambda
   - Pass required attributes

5. **Lex V2 Bot Intents**
   The bot is configured with the following intents:
   - **FlightChangeIntent** - Customer wants to change their flight
   - **RefundIntent** - Customer wants a refund
   - **BaggageIntent** - Customer has baggage questions
   - **DelayCompensationIntent** - Customer wants compensation for delay
   - **FallbackIntent** - Default fallback for unrecognized requests

### Step 5: Test the Deployment

1. **Test Lambda Functions**

```bash
# Test contact flow Lambda
aws lambda invoke \
  --function-name dev-airline-contact-flow \
  --payload '{"Name":"InitializeSession","Details":{"ContactData":{"ContactId":"test-123","CustomerEndpoint":{"Address":"+1234567890","Type":"TELEPHONE_NUMBER"},"InstanceARN":"arn:aws:connect:us-east-1:123456789:instance/xxx"},"Parameters":{}}}' \
  response.json

cat response.json
```

2. **Test ElevenLabs Integration**

```bash
# Using the ElevenLabs MCP server
# The agent is already configured with ID: agent_9001khtqgwq1f13rssz3f81pz0p3
```

3. **Make a Test Call**
   - Call the claimed phone number
   - Verify the greeting plays
   - Test complaint scenarios

## Environment Variables

### Lambda Functions

| Variable                       | Description                         |
| ------------------------------ | ----------------------------------- |
| `ENVIRONMENT`                  | Environment name (dev/staging/prod) |
| `DYNAMODB_SESSIONS_TABLE`      | Sessions table name                 |
| `DYNAMODB_CONVERSATIONS_TABLE` | Conversations table name            |
| `DYNAMODB_CUSTOMERS_TABLE`     | Customers table name                |
| `S3_KNOWLEDGE_BUCKET`          | Knowledge base bucket name          |
| `ELEVENLABS_AGENT_ID`          | ElevenLabs agent ID                 |

### Secrets Manager

The ElevenLabs API key is stored in AWS Secrets Manager:

- Secret Name: `{environment}/airline-contact-center/elevenlabs`
- Secret Key: `apiKey`

## Monitoring

### CloudWatch Logs

Lambda function logs are available in CloudWatch:

- `/aws/lambda/dev-airline-contact-flow`
- `/aws/lambda/dev-airline-audio-processor`

### CloudWatch Metrics

Monitor these key metrics:

- Lambda invocations and errors
- DynamoDB read/write capacity
- API Gateway latency

### Alarms

Set up CloudWatch alarms for:

- Lambda error rate > 5%
- Lambda duration > 10 seconds
- DynamoDB throttling

## Troubleshooting

### Common Issues

#### Lambda Timeout

**Symptom**: Lambda function times out
**Solution**: Increase timeout in `infrastructure/lambda.yaml`

#### ElevenLabs API Errors

**Symptom**: 401 Unauthorized from ElevenLabs
**Solution**: Verify API key in Secrets Manager

#### DynamoDB Errors

**Symptom**: Access denied to DynamoDB
**Solution**: Check IAM role permissions

### Debug Mode

Enable debug logging:

```bash
# Set environment variable
export LOG_LEVEL=debug

# Or update Lambda configuration
aws lambda update-function-configuration \
  --function-name dev-airline-contact-flow \
  --environment "Variables={LOG_LEVEL=debug}"
```

## Cleanup

To remove all deployed resources:

```bash
# Delete CloudFormation stack
aws cloudformation delete-stack --stack-name airline-contact-center-dev

# Wait for deletion
aws cloudformation wait stack-delete-complete --stack-name airline-contact-center-dev
```

**Note**: S3 buckets with content must be emptied before stack deletion.

## Cost Estimation

### Monthly Costs (100 calls/hour)

| Service        | Estimated Cost |
| -------------- | -------------- |
| Amazon Connect | $0.018/minute  |
| Lambda         | ~$5-10         |
| DynamoDB       | ~$5-10         |
| S3             | ~$1-2          |
| ElevenLabs     | Based on usage |

**Total Estimated**: $50-100/month for moderate usage

## Support

For issues or questions:

- GitHub Issues: https://github.com/jameslevine/elevenlabs-demo/issues
- ElevenLabs Docs: https://docs.elevenlabs.io
- AWS Connect Docs: https://docs.aws.amazon.com/connect
