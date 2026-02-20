/**
 * Botari Widget API Client
 * Handles all communication with the Botari backend
 */
import type { WidgetConfig, Message } from './types';
export declare class BotariAPI {
    private config;
    private conversationId;
    constructor(config: WidgetConfig);
    /**
     * Get the current conversation ID
     */
    getConversationId(): number | null;
    /**
     * Set conversation ID (used when restoring from storage)
     */
    setConversationId(id: number): void;
    /**
     * Create headers for API requests
     */
    private getHeaders;
    /**
     * Create a new conversation
     */
    createConversation(customerInfo?: {
        name?: string;
        phone?: string;
    }): Promise<number>;
    /**
     * Get messages for the current conversation
     */
    getMessages(conversationId?: number): Promise<Message[]>;
    /**
     * Send a message and get AI response
     */
    sendMessage(text: string, sender?: string): Promise<string>;
    /**
     * Close the current conversation
     */
    closeConversation(conversationId?: number): Promise<void>;
    /**
     * Check if API is reachable
     */
    healthCheck(): Promise<boolean>;
}
export default BotariAPI;
//# sourceMappingURL=api.d.ts.map