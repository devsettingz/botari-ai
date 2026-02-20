/**
 * Botari Widget Types
 */

export interface WidgetConfig {
  /** Business ID for the widget */
  businessId: string | number;
  /** API key for authentication */
  apiKey: string;
  /** API base URL (default: http://localhost:4000) */
  apiUrl?: string;
  /** Widget position (default: 'bottom-right') */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Primary color override (default: #E2725B) */
  primaryColor?: string;
  /** Welcome message shown when chat opens */
  welcomeMessage?: string;
  /** Bot name displayed in header */
  botName?: string;
  /** Business name displayed in header */
  businessName?: string;
  /** Placeholder text for input */
  placeholder?: string;
  /** Auto-open delay in ms (0 to disable) */
  autoOpen?: number;
  /** Enable sound notifications */
  soundEnabled?: boolean;
  /** Custom CSS class for additional styling */
  customClass?: string;
}

export interface Message {
  id: string;
  conversation_id: number;
  sender: 'user' | 'bot' | 'botari' | string;
  text: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  business_id: number;
  customer_name?: string;
  customer_phone?: string;
  status: 'open' | 'closed';
  started_at: string;
  last_message_at?: string;
  employee_id?: number;
}

export interface CreateConversationResponse {
  conversation_id: number;
}

export interface SendMessageResponse {
  reply: string;
}

export type WidgetState = 'closed' | 'open' | 'minimized';

export interface WidgetInstance {
  /** Open the chat window */
  open: () => void;
  /** Close the chat window */
  close: () => void;
  /** Toggle chat window */
  toggle: () => void;
  /** Destroy the widget and remove from DOM */
  destroy: () => void;
  /** Send a message programmatically */
  sendMessage: (text: string) => Promise<void>;
  /** Clear conversation history */
  clear: () => void;
}
