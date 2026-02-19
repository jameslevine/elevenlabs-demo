import { Context } from 'aws-lambda';
import {
  ConnectContactFlowEvent,
  ConnectContactFlowResponse,
  SessionStatus,
} from '../../types';
import {
  createSession,
  getSessionById,
  updateSessionStatus,
  getCustomerByPhoneNumber,
  upsertCustomer,
} from '../../adapters/dynamodb';
import { AIRLINE_AGENT_FIRST_MESSAGE } from '../../constants';
import { v4 as uuidv4 } from 'uuid';

/**
 * Lambda handler for Amazon Connect contact flow
 * This handler is invoked when a new call comes in or during the call flow
 */
export const handler = async (
  event: ConnectContactFlowEvent,
  context: Context,
): Promise<ConnectContactFlowResponse> => {
  console.log('Contact Flow Event:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));

  const { Name: functionName, Details } = event;
  const { ContactData, Parameters } = Details;

  try {
    switch (functionName) {
      case 'InitializeSession':
        return await handleInitializeSession(ContactData, Parameters);

      case 'GetSessionStatus':
        return await handleGetSessionStatus(Parameters);

      case 'EndSession':
        return await handleEndSession(Parameters);

      default:
        console.warn(`Unknown function name: ${functionName}`);
        return {
          success: 'false',
          error: `Unknown function: ${functionName}`,
        };
    }
  } catch (error) {
    console.error('Error in contact flow handler:', error);
    return {
      success: 'false',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Initialize a new session when a call comes in
 */
async function handleInitializeSession(
  contactData: ConnectContactFlowEvent['Details']['ContactData'],
  _parameters: Record<string, string>,
): Promise<ConnectContactFlowResponse> {
  const phoneNumber = contactData.CustomerEndpoint.Address;
  const contactId = contactData.ContactId;

  // Check if customer exists
  let customer = await getCustomerByPhoneNumber(phoneNumber);

  // Create customer if not exists
  if (!customer) {
    customer = await upsertCustomer({
      customerId: uuidv4(),
      phoneNumber,
    });
  }

  // Get KVS stream ARN if available
  const kvsStreamArn = contactData.MediaStreams?.Customer?.Audio?.StreamARN;

  // Create new session
  const session = await createSession(contactId, phoneNumber, {
    contactFlowId: contactData.InstanceARN,
    kvsStreamArn,
  });

  // Update customer ID in session
  console.log(
    `Session created: ${session.sessionId} for customer: ${customer.customerId}`,
  );

  // Determine greeting based on customer tier
  let greeting = AIRLINE_AGENT_FIRST_MESSAGE;
  if (customer.loyaltyTier) {
    greeting = `Thank you for calling SkyWay Airlines. I see you're a valued ${customer.loyaltyTier} member. My name is Sarah, and I'm here to provide you with priority assistance today. How may I help you?`;
  }

  return {
    success: 'true',
    sessionId: session.sessionId,
    customerId: customer.customerId,
    customerName: customer.firstName || 'Valued Customer',
    loyaltyTier: customer.loyaltyTier || 'STANDARD',
    greeting,
    kvsStreamArn: kvsStreamArn || '',
  };
}

/**
 * Get the current session status
 */
async function handleGetSessionStatus(
  parameters: Record<string, string>,
): Promise<ConnectContactFlowResponse> {
  const { sessionId } = parameters;

  if (!sessionId) {
    return {
      success: 'false',
      error: 'Session ID is required',
    };
  }

  const session = await getSessionById(sessionId);

  if (!session) {
    return {
      success: 'false',
      error: 'Session not found',
    };
  }

  return {
    success: 'true',
    sessionId: session.sessionId,
    status: session.status,
    startTime: session.startTime,
  };
}

/**
 * End the current session
 */
async function handleEndSession(
  parameters: Record<string, string>,
): Promise<ConnectContactFlowResponse> {
  const { sessionId } = parameters;

  if (!sessionId) {
    return {
      success: 'false',
      error: 'Session ID is required',
    };
  }

  const endTime = new Date().toISOString();
  const session = await updateSessionStatus(
    sessionId,
    SessionStatus.COMPLETED,
    endTime,
  );

  if (!session) {
    return {
      success: 'false',
      error: 'Failed to end session',
    };
  }

  return {
    success: 'true',
    sessionId: session.sessionId,
    status: session.status,
    endTime: session.endTime,
  };
}
