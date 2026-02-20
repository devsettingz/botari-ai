/**
 * Botari Chat Widget
 * Main widget class that handles UI and interactions
 */
import type { WidgetConfig, WidgetInstance } from './types';
export declare class ChatWidget implements WidgetInstance {
    private config;
    private api;
    private state;
    private messages;
    private container;
    private button;
    private window;
    private messagesContainer;
    private input;
    private isTyping;
    private autoOpenTimer;
    private storageKey;
    private customerName;
    constructor(config: WidgetConfig);
    /**
     * Initialize the widget - create DOM elements and attach events
     */
    init(): void;
    /**
     * Create all DOM elements
     */
    private createDOM;
    /**
     * Attach event listeners
     */
    private attachEvents;
    /**
     * Apply custom primary color
     */
    private applyCustomStyles;
    /**
     * Show welcome message
     */
    private showWelcomeMessage;
    /**
     * Initialize or restore conversation
     */
    private initializeConversation;
    /**
     * Handle sending a message
     */
    private handleSend;
    /**
     * Send a message
     */
    sendMessage(text: string): Promise<void>;
    /**
     * Add a message to the UI
     */
    private addMessage;
    /**
     * Show typing indicator
     */
    private showTypingIndicator;
    /**
     * Hide typing indicator
     */
    private hideTypingIndicator;
    /**
     * Show error message
     */
    private showError;
    /**
     * Scroll messages to bottom
     */
    private scrollToBottom;
    /**
     * Escape HTML to prevent XSS
     */
    private escapeHtml;
    /**
     * Play notification sound
     */
    private playNotificationSound;
    /**
     * Restore state from storage
     */
    private restoreState;
    /**
     * Save state to storage
     */
    private saveState;
    open(): void;
    close(): void;
    toggle(): void;
    clear(): void;
    destroy(): void;
}
export default ChatWidget;
//# sourceMappingURL=ChatWidget.d.ts.map