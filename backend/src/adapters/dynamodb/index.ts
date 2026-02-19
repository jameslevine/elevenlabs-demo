import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { ENV, DB_PREFIXES } from '../../constants';
import {
  Session,
  SessionStatus,
  ConversationMessage,
  MessageRole,
  Customer,
  PaginatedResponse,
  PaginationParams,
} from '../../types';

// Initialize DynamoDB client
const clientConfig: DynamoDBClientConfig = {
  region: ENV.AWS_REGION,
};

const ddbClient = new DynamoDBClient(clientConfig);
const docClient = DynamoDBDocumentClient.from(ddbClient);

// ==================== SESSION OPERATIONS ====================

/**
 * Create a new session
 */
export const createSession = async (
  contactId: string,
  phoneNumber: string,
  metadata?: Partial<Session['metadata']>,
): Promise<Session> => {
  const now = new Date().toISOString();
  const sessionId = uuidv4();

  const session: Session = {
    sessionId,
    contactId,
    phoneNumber,
    status: SessionStatus.ACTIVE,
    startTime: now,
    metadata: metadata || {},
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: ENV.DYNAMODB_SESSIONS_TABLE,
      Item: {
        pk: `${DB_PREFIXES.SESSION}${sessionId}`,
        sk: `${DB_PREFIXES.SESSION}${sessionId}`,
        ...session,
      },
    }),
  );

  return session;
};

/**
 * Get session by ID
 */
export const getSessionById = async (
  sessionId: string,
): Promise<Session | null> => {
  const result = await docClient.send(
    new GetCommand({
      TableName: ENV.DYNAMODB_SESSIONS_TABLE,
      Key: {
        pk: `${DB_PREFIXES.SESSION}${sessionId}`,
        sk: `${DB_PREFIXES.SESSION}${sessionId}`,
      },
    }),
  );

  if (!result.Item) {
    return null;
  }

  return result.Item as Session;
};

/**
 * Update session status
 */
export const updateSessionStatus = async (
  sessionId: string,
  status: SessionStatus,
  endTime?: string,
): Promise<Session | null> => {
  const now = new Date().toISOString();

  const updateExpression = endTime
    ? 'SET #status = :status, endTime = :endTime, updatedAt = :updatedAt'
    : 'SET #status = :status, updatedAt = :updatedAt';

  const expressionAttributeValues: Record<string, unknown> = {
    ':status': status,
    ':updatedAt': now,
  };

  if (endTime) {
    expressionAttributeValues[':endTime'] = endTime;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: ENV.DYNAMODB_SESSIONS_TABLE,
      Key: {
        pk: `${DB_PREFIXES.SESSION}${sessionId}`,
        sk: `${DB_PREFIXES.SESSION}${sessionId}`,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }),
  );

  return result.Attributes as Session;
};

/**
 * Update session metadata
 */
export const updateSessionMetadata = async (
  sessionId: string,
  metadata: Partial<Session['metadata']>,
): Promise<Session | null> => {
  const now = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: ENV.DYNAMODB_SESSIONS_TABLE,
      Key: {
        pk: `${DB_PREFIXES.SESSION}${sessionId}`,
        sk: `${DB_PREFIXES.SESSION}${sessionId}`,
      },
      UpdateExpression: 'SET metadata = :metadata, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':metadata': metadata,
        ':updatedAt': now,
      },
      ReturnValues: 'ALL_NEW',
    }),
  );

  return result.Attributes as Session;
};

// ==================== CONVERSATION OPERATIONS ====================

/**
 * Add a message to the conversation
 */
export const addConversationMessage = async (
  sessionId: string,
  role: MessageRole,
  content: string,
  metadata?: ConversationMessage['metadata'],
): Promise<ConversationMessage> => {
  const now = new Date().toISOString();
  const messageId = uuidv4();

  const message: ConversationMessage = {
    messageId,
    sessionId,
    role,
    content,
    timestamp: now,
    metadata,
  };

  await docClient.send(
    new PutCommand({
      TableName: ENV.DYNAMODB_CONVERSATIONS_TABLE,
      Item: {
        pk: `${DB_PREFIXES.CONVERSATION}${sessionId}`,
        sk: `${DB_PREFIXES.MESSAGE}${now}#${messageId}`,
        ...message,
      },
    }),
  );

  return message;
};

/**
 * Get conversation messages by session ID
 */
export const getConversationMessages = async (
  sessionId: string,
  params?: PaginationParams,
): Promise<PaginatedResponse<ConversationMessage>> => {
  const result = await docClient.send(
    new QueryCommand({
      TableName: ENV.DYNAMODB_CONVERSATIONS_TABLE,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: {
        ':pk': `${DB_PREFIXES.CONVERSATION}${sessionId}`,
      },
      ScanIndexForward: true, // Oldest first
      Limit: params?.limit || 100,
      ExclusiveStartKey: params?.nextToken
        ? JSON.parse(Buffer.from(params.nextToken, 'base64').toString())
        : undefined,
    }),
  );

  const nextToken = result.LastEvaluatedKey
    ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
    : undefined;

  return {
    items: (result.Items || []) as ConversationMessage[],
    nextToken,
  };
};

// ==================== CUSTOMER OPERATIONS ====================

/**
 * Create or update customer
 */
export const upsertCustomer = async (
  customer: Omit<Customer, 'createdAt' | 'updatedAt'>,
): Promise<Customer> => {
  const now = new Date().toISOString();

  const existingCustomer = await getCustomerById(customer.customerId);

  const customerRecord: Customer = {
    ...customer,
    createdAt: existingCustomer?.createdAt || now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: ENV.DYNAMODB_CUSTOMERS_TABLE,
      Item: {
        pk: `${DB_PREFIXES.CUSTOMER}${customer.customerId}`,
        sk: `${DB_PREFIXES.CUSTOMER}${customer.customerId}`,
        ...customerRecord,
      },
    }),
  );

  return customerRecord;
};

/**
 * Get customer by ID
 */
export const getCustomerById = async (
  customerId: string,
): Promise<Customer | null> => {
  const result = await docClient.send(
    new GetCommand({
      TableName: ENV.DYNAMODB_CUSTOMERS_TABLE,
      Key: {
        pk: `${DB_PREFIXES.CUSTOMER}${customerId}`,
        sk: `${DB_PREFIXES.CUSTOMER}${customerId}`,
      },
    }),
  );

  if (!result.Item) {
    return null;
  }

  return result.Item as Customer;
};

/**
 * Get customer by phone number
 */
export const getCustomerByPhoneNumber = async (
  phoneNumber: string,
): Promise<Customer | null> => {
  const result = await docClient.send(
    new QueryCommand({
      TableName: ENV.DYNAMODB_CUSTOMERS_TABLE,
      IndexName: 'phoneNumber-index',
      KeyConditionExpression: 'phoneNumber = :phoneNumber',
      ExpressionAttributeValues: {
        ':phoneNumber': phoneNumber,
      },
      Limit: 1,
    }),
  );

  if (!result.Items || result.Items.length === 0) {
    return null;
  }

  return result.Items[0] as Customer;
};

/**
 * Delete customer
 */
export const deleteCustomer = async (customerId: string): Promise<void> => {
  await docClient.send(
    new DeleteCommand({
      TableName: ENV.DYNAMODB_CUSTOMERS_TABLE,
      Key: {
        pk: `${DB_PREFIXES.CUSTOMER}${customerId}`,
        sk: `${DB_PREFIXES.CUSTOMER}${customerId}`,
      },
    }),
  );
};

// Export the document client for direct access if needed
export { docClient };
