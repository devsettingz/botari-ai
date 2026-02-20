/**
 * Botari Widget API Client
 * Handles all communication with the Botari backend
 */

import type { 
  WidgetConfig, 
  Conversation, 
  Message, 
  CreateConversationResponse, 
  SendMessageResponse 
} from './types';

export class BotariAPI {
  private config: Required<Pick<WidgetConfig, 'apiUrl' | 'apiKey' | 'businessId'>>;
  private conversationId: number | null = null;

  constructor(config: WidgetConfig) {
    this.config = {
      apiUrl: config.apiUrl || 'http://localhost:4000',
      apiKey: config.apiKey,
      businessId: config.businessId,
    };
  }

  /**
   * Get the current conversation ID
   */
  getConversationId(): number | null {
    return this.conversationId;
  }

  /**
   * Set conversation ID (used when restoring from storage)
   */
  setConversationId(id: number): void {
    this.conversationId = id;
  }

  /**
   * Create headers for API requests
   */
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-API-Key': this.config.apiKey,
      'X-Business-ID': String(this.config.businessId),
    };
  }

  /**
   * Create a new conversation
   */
  async createConversation(customerInfo?: { name?: string; phone?: string }): Promise<number> {
    const response = await fetch(`${this.config.apiUrl}/api/conversations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        customer_name: customerInfo?.name || 'Website Visitor',
        customer_phone: customerInfo?.phone || '',
        employee_id: 1, // Default AI employee
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to create conversation: ${response.status}`);
    }

    const data: CreateConversationResponse = await response.json();
    this.conversationId = data.conversation_id;
    return data.conversation_id;
  }

  /**
   * Get messages for the current conversation
   */
  async getMessages(conversationId?: number): Promise<Message[]> {
    const id = conversationId || this.conversationId;
    if (!id) {
      throw new Error('No conversation ID available');
    }

    const response = await fetch(
      `${this.config.apiUrl}/api/conversations/${id}/messages`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to get messages: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Send a message and get AI response
   */
  async sendMessage(text: string, sender: string = 'user'): Promise<string> {
    if (!this.conversationId) {
      await this.createConversation();
    }

    const response = await fetch(`${this.config.apiUrl}/api/messages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        conversation_id: this.conversationId,
        sender,
        text,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to send message: ${response.status}`);
    }

    const data: SendMessageResponse = await response.json();
    return data.reply;
  }

  /**
   * Close the current conversation
   */
  async closeConversation(conversationId?: number): Promise<void> {
    const id = conversationId || this.conversationId;
    if (!id) return;

    const response = await fetch(
      `${this.config.apiUrl}/api/conversations/${id}/close`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      console.error('Failed to close conversation');
    }

    this.conversationId = null;
  }

  /**
   * Check if API is reachable
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiUrl}/health`, {
        method: 'GET',
        headers: { 'X-API-Key': this.config.apiKey },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default BotariAPI;
