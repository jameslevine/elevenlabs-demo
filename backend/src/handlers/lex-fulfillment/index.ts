import { Context } from 'aws-lambda';

// Lex V2 Event Types
interface LexV2Event {
  messageVersion: string;
  invocationSource: 'DialogCodeHook' | 'FulfillmentCodeHook';
  inputMode: 'Text' | 'Speech' | 'DTMF';
  responseContentType: string;
  sessionId: string;
  inputTranscript: string;
  bot: {
    id: string;
    name: string;
    aliasId: string;
    aliasName: string;
    localeId: string;
    version: string;
  };
  interpretations: Array<{
    intent: {
      name: string;
      slots: Record<string, SlotValue | null>;
      state: string;
      confirmationState: string;
    };
    nluConfidence?: {
      score: number;
    };
  }>;
  sessionState: {
    activeContexts?: Array<{
      name: string;
      contextAttributes: Record<string, string>;
      timeToLive: {
        timeToLiveInSeconds: number;
        turnsToLive: number;
      };
    }>;
    sessionAttributes?: Record<string, string>;
    dialogAction?: {
      type: string;
      slotToElicit?: string;
    };
    intent?: {
      name: string;
      slots: Record<string, SlotValue | null>;
      state: string;
      confirmationState: string;
    };
  };
}

interface SlotValue {
  value: {
    originalValue: string;
    interpretedValue: string;
    resolvedValues: string[];
  };
  shape?: string;
  values?: SlotValue[];
}

interface LexV2Response {
  sessionState: {
    dialogAction: {
      type:
        | 'Close'
        | 'ConfirmIntent'
        | 'Delegate'
        | 'ElicitIntent'
        | 'ElicitSlot';
      slotToElicit?: string;
    };
    intent?: {
      name: string;
      slots: Record<string, SlotValue | null>;
      state: 'Failed' | 'Fulfilled' | 'InProgress' | 'ReadyForFulfillment';
      confirmationState?: 'Confirmed' | 'Denied' | 'None';
    };
    sessionAttributes?: Record<string, string>;
  };
  messages?: Array<{
    contentType: 'PlainText' | 'SSML' | 'CustomPayload' | 'ImageResponseCard';
    content: string;
  }>;
}

// Knowledge base content
const KNOWLEDGE_BASE = {
  refundPolicy: `
    SkyWay Airlines Refund Policy:
    - Full refund within 24 hours of booking for any reason
    - Refundable tickets: Full refund minus $50 processing fee
    - Non-refundable tickets: Credit for future travel minus $150 change fee
    - Flight cancellations by airline: Full refund or rebooking at no cost
    - Medical emergencies: Full refund with documentation
    - Processing time: 7-10 business days
  `,
  baggagePolicy: `
    SkyWay Airlines Baggage Policy:
    - Carry-on: 1 bag (22x14x9 inches) + 1 personal item, free
    - Checked bags: First bag $30, Second bag $45, Third+ $100 each
    - Weight limit: 50 lbs per checked bag
    - Overweight (51-70 lbs): Additional $75
    - Lost baggage: Report within 4 hours, compensation up to $3,500
    - Delayed baggage: $50/day for essentials, max 5 days
  `,
  delayCompensation: `
    SkyWay Airlines Delay Compensation:
    - 2-4 hour delay: $100 voucher or meal voucher
    - 4+ hour delay: $200 voucher + hotel if overnight
    - Cancellation: Full refund or rebooking + $250 voucher
    - Missed connection (airline fault): Rebooking + $150 voucher
    - EU flights: Additional EU261 compensation may apply
  `,
};

/**
 * Generate AI response using ElevenLabs text generation
 * Note: ElevenLabs is primarily for voice, so we use their conversational AI
 * For text generation, we'll use a simple template-based approach with context
 */
async function generateAIResponse(
  intent: string,
  slots: Record<string, SlotValue | null>,
  _userInput: string,
  _context: string,
): Promise<string> {
  // For now, use template-based responses enhanced with context
  // In production, you could integrate with OpenAI or another LLM

  const bookingRef =
    slots.BookingReference?.value?.interpretedValue || 'your booking';

  switch (intent) {
    case 'FlightChangeIntent': {
      const newDate =
        slots.NewDate?.value?.interpretedValue || 'the requested date';
      return `I've looked up booking ${bookingRef}. I can help you change your flight to ${newDate}. Based on our policy, if you have a flexible ticket, there's no change fee. For standard tickets, there's a $150 change fee plus any fare difference. Would you like me to proceed with checking availability for ${newDate}?`;
    }

    case 'RefundIntent': {
      const reason = slots.RefundReason?.value?.interpretedValue || '';
      let response = `I've found your booking ${bookingRef}. `;

      if (
        reason.toLowerCase().includes('cancel') ||
        reason.toLowerCase().includes('airline')
      ) {
        response += `Since the flight was cancelled by the airline, you're entitled to a full refund with no fees. I can process this for you right now, and you should see the refund in 7-10 business days.`;
      } else if (
        reason.toLowerCase().includes('medical') ||
        reason.toLowerCase().includes('emergency')
      ) {
        response += `For medical emergencies, we offer full refunds with proper documentation. Please email your medical certificate to refunds@skyway.com with your booking reference, and we'll process your refund within 5 business days.`;
      } else {
        response += `Based on your ticket type, here are your options: If you have a refundable ticket, you'll receive a full refund minus a $50 processing fee. For non-refundable tickets, you can receive credit for future travel minus a $150 change fee. Which option would you prefer?`;
      }
      return response;
    }

    case 'BaggageIntent': {
      const issueType =
        slots.BaggageIssueType?.value?.interpretedValue || 'general';

      if (
        issueType.toLowerCase().includes('lost') ||
        issueType.toLowerCase().includes('missing')
      ) {
        return `I'm sorry to hear your baggage is missing. Here's what we'll do: First, I'll file a lost baggage report for you. You're entitled to $50 per day for essential items while we locate your bag, up to 5 days. Most bags are found within 24-48 hours. Can you describe your bag and confirm your contact information?`;
      } else if (
        issueType.toLowerCase().includes('fee') ||
        issueType.toLowerCase().includes('cost')
      ) {
        return `Here are our baggage fees: Your first checked bag is $30, second bag is $45, and additional bags are $100 each. The weight limit is 50 pounds per bag. Overweight bags between 51-70 pounds have an additional $75 fee. Would you like me to add baggage to your booking?`;
      } else {
        return `For carry-on luggage, you can bring one bag up to 22 by 14 by 9 inches, plus one personal item like a laptop bag or purse, at no charge. For checked bags, the first bag is $30 with a 50-pound weight limit. Is there anything specific about baggage you'd like to know?`;
      }
    }

    case 'DelayCompensationIntent': {
      const flightNumber = slots.FlightNumber?.value?.interpretedValue || '';
      return `I'm sorry about the inconvenience with your flight${flightNumber ? ` ${flightNumber}` : ''}. Let me check the details of your delay. Based on our compensation policy: For delays of 2-4 hours, you're entitled to a $100 voucher or meal voucher. For delays over 4 hours, you receive a $200 voucher plus hotel accommodation if it's overnight. I'll process your compensation request now. You should receive your voucher via email within 24 hours.`;
    }

    case 'GeneralInquiryIntent':
      return `I'm here to help you with anything related to your SkyWay Airlines travel. I can assist with flight changes, refunds, baggage questions, delay compensation, and more. What would you like help with today?`;

    case 'FallbackIntent':
    default:
      return `I apologize, I didn't quite understand that. I can help you with flight changes, refunds, baggage questions, or delay compensation. Could you please tell me more specifically what you need help with?`;
  }
}

/**
 * Build Lex V2 response
 */
function buildResponse(
  event: LexV2Event,
  message: string,
  fulfillmentState: 'Fulfilled' | 'Failed' = 'Fulfilled',
): LexV2Response {
  const intent = event.sessionState.intent || event.interpretations[0]?.intent;

  return {
    sessionState: {
      dialogAction: {
        type: 'Close',
      },
      intent: intent
        ? {
            name: intent.name,
            slots: intent.slots,
            state: fulfillmentState,
            confirmationState: 'None',
          }
        : undefined,
      sessionAttributes: event.sessionState.sessionAttributes || {},
    },
    messages: [
      {
        contentType: 'PlainText',
        content: message,
      },
    ],
  };
}

/**
 * Lambda handler for Lex V2 fulfillment
 */
export const handler = async (
  event: LexV2Event,
  _context: Context,
): Promise<LexV2Response> => {
  console.log('Lex Fulfillment Event:', JSON.stringify(event, null, 2));

  const intentName =
    event.sessionState.intent?.name ||
    event.interpretations[0]?.intent?.name ||
    'FallbackIntent';

  const slots =
    event.sessionState.intent?.slots ||
    event.interpretations[0]?.intent?.slots ||
    {};

  const userInput = event.inputTranscript || '';

  console.log('Intent:', intentName);
  console.log('Slots:', JSON.stringify(slots, null, 2));
  console.log('User Input:', userInput);

  try {
    // Get relevant context based on intent
    let knowledgeContext = '';
    switch (intentName) {
      case 'RefundIntent':
        knowledgeContext = KNOWLEDGE_BASE.refundPolicy;
        break;
      case 'BaggageIntent':
        knowledgeContext = KNOWLEDGE_BASE.baggagePolicy;
        break;
      case 'DelayCompensationIntent':
        knowledgeContext = KNOWLEDGE_BASE.delayCompensation;
        break;
      default:
        knowledgeContext = Object.values(KNOWLEDGE_BASE).join('\n');
    }

    // Generate AI response
    const response = await generateAIResponse(
      intentName,
      slots,
      userInput,
      knowledgeContext,
    );

    console.log('Generated Response:', response);

    return buildResponse(event, response, 'Fulfilled');
  } catch (error) {
    console.error('Error in Lex fulfillment:', error);

    return buildResponse(
      event,
      "I apologize, but I'm experiencing technical difficulties. Please try again or call our customer service line for immediate assistance.",
      'Failed',
    );
  }
};
