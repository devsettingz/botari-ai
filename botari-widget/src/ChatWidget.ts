/**
 * Botari Chat Widget
 * Main widget class that handles UI and interactions
 */

import type { WidgetConfig, WidgetInstance, Message, WidgetState } from './types';
import { BotariAPI } from './api';

// SVG Icons
const ICONS = {
  chat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>`,
  close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  send: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></svg>`,
  minimize: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="M14 10 4 20"/><path d="m20 4-10 10"/></svg>`,
  clear: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
  bot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`,
  user: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
};

export class ChatWidget implements WidgetInstance {
  private config: Required<WidgetConfig>;
  private api: BotariAPI;
  private state: WidgetState = 'closed';
  private messages: Message[] = [];
  private container: HTMLElement | null = null;
  private button: HTMLButtonElement | null = null;
  private window: HTMLElement | null = null;
  private messagesContainer: HTMLElement | null = null;
  private input: HTMLTextAreaElement | null = null;
  private isTyping = false;
  private autoOpenTimer: number | null = null;
  private storageKey: string;
  private customerName: string = 'You';

  constructor(config: WidgetConfig) {
    // Validate required config
    if (!config.businessId) {
      throw new Error('BotariWidget: businessId is required');
    }
    if (!config.apiKey) {
      throw new Error('BotariWidget: apiKey is required');
    }

    // Set default config
    this.config = {
      businessId: config.businessId,
      apiKey: config.apiKey,
      apiUrl: config.apiUrl || 'http://localhost:4000',
      position: config.position || 'bottom-right',
      primaryColor: config.primaryColor || '#E2725B',
      welcomeMessage: config.welcomeMessage || 'Hello! How can I help you today?',
      botName: config.botName || 'Botari Assistant',
      businessName: config.businessName || 'Botari AI',
      placeholder: config.placeholder || 'Type a message...',
      autoOpen: config.autoOpen || 0,
      soundEnabled: config.soundEnabled !== false,
      customClass: config.customClass || '',
    };

    this.api = new BotariAPI(this.config);
    this.storageKey = `botari_widget_${this.config.businessId}`;

    // Restore saved state
    this.restoreState();
  }

  /**
   * Initialize the widget - create DOM elements and attach events
   */
  init(): void {
    if (this.container) {
      console.warn('BotariWidget: Already initialized');
      return;
    }

    this.createDOM();
    this.attachEvents();
    this.applyCustomStyles();

    // Auto-open if configured
    if (this.config.autoOpen > 0) {
      this.autoOpenTimer = window.setTimeout(() => {
        this.open();
      }, this.config.autoOpen);
    }

    // Create or restore conversation
    this.initializeConversation();
  }

  /**
   * Create all DOM elements
   */
  private createDOM(): void {
    // Main container
    this.container = document.createElement('div');
    this.container.className = `botari-widget botari-widget--${this.config.position} ${this.config.customClass}`;
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', 'Botari Chat Widget');

    // Chat button
    this.button = document.createElement('button');
    this.button.className = 'botari-widget__button';
    this.button.setAttribute('aria-label', 'Open chat');
    this.button.innerHTML = ICONS.chat;
    this.container.appendChild(this.button);

    // Chat window
    this.window = document.createElement('div');
    this.window.className = 'botari-widget__window';
    this.window.setAttribute('role', 'dialog');
    this.window.setAttribute('aria-label', 'Chat with us');

    // Header
    const header = document.createElement('div');
    header.className = 'botari-widget__header';
    header.innerHTML = `
      <div class="botari-widget__header-info">
        <div class="botari-widget__avatar">${this.config.botName.charAt(0)}</div>
        <div class="botari-widget__header-text">
          <h3 class="botari-widget__bot-name">${this.config.botName}</h3>
          <span class="botari-widget__status">
            <span class="botari-widget__status-dot"></span>
            Online
          </span>
        </div>
      </div>
      <div class="botari-widget__header-actions">
        <button class="botari-widget__header-btn" data-action="clear" title="Clear chat" aria-label="Clear chat">
          ${ICONS.clear}
        </button>
        <button class="botari-widget__header-btn" data-action="close" title="Close chat" aria-label="Close chat">
          ${ICONS.close}
        </button>
      </div>
    `;
    this.window.appendChild(header);

    // Messages container
    this.messagesContainer = document.createElement('div');
    this.messagesContainer.className = 'botari-widget__messages';
    this.window.appendChild(this.messagesContainer);

    // Input area
    const inputArea = document.createElement('div');
    inputArea.className = 'botari-widget__input-area';
    inputArea.innerHTML = `
      <textarea 
        class="botari-widget__input" 
        placeholder="${this.config.placeholder}"
        rows="1"
        aria-label="Message"
      ></textarea>
      <button class="botari-widget__send-btn" aria-label="Send message">
        ${ICONS.send}
      </button>
    `;
    this.window.appendChild(inputArea);

    // Powered by
    const powered = document.createElement('div');
    powered.className = 'botari-widget__powered';
    powered.innerHTML = `Powered by <a href="https://botari.ai" target="_blank" rel="noopener">${this.config.businessName}</a>`;
    this.window.appendChild(powered);

    this.container.appendChild(this.window);

    // Store references
    this.input = inputArea.querySelector('.botari-widget__input') as HTMLTextAreaElement;

    // Append to body
    document.body.appendChild(this.container);

    // Show welcome message
    this.showWelcomeMessage();
  }

  /**
   * Attach event listeners
   */
  private attachEvents(): void {
    if (!this.button || !this.window || !this.input) return;

    // Toggle button click
    this.button.addEventListener('click', () => this.toggle());

    // Header button clicks
    this.window.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('[data-action]') as HTMLButtonElement;
      if (btn) {
        const action = btn.getAttribute('data-action');
        if (action === 'close') this.close();
        if (action === 'clear') this.clear();
      }
    });

    // Send button click
    const sendBtn = this.window.querySelector('.botari-widget__send-btn') as HTMLButtonElement;
    sendBtn.addEventListener('click', () => this.handleSend());

    // Input keypress (Enter to send, Shift+Enter for new line)
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });

    // Auto-resize textarea
    this.input.addEventListener('input', () => {
      this.input!.style.height = 'auto';
      this.input!.style.height = Math.min(this.input!.scrollHeight, 120) + 'px';
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (this.state === 'open' && 
          !this.window!.contains(target) && 
          !this.button!.contains(target)) {
        this.close();
      }
    });
  }

  /**
   * Apply custom primary color
   */
  private applyCustomStyles(): void {
    if (this.config.primaryColor !== '#E2725B' && this.container) {
      this.container.style.setProperty('--botari-primary', this.config.primaryColor);
    }
  }

  /**
   * Show welcome message
   */
  private showWelcomeMessage(): void {
    if (this.messages.length === 0) {
      this.addMessage({
        id: 'welcome',
        conversation_id: 0,
        sender: 'bot',
        text: this.config.welcomeMessage,
        created_at: new Date().toISOString(),
      });
    }
  }

  /**
   * Initialize or restore conversation
   */
  private async initializeConversation(): Promise<void> {
    try {
      // Try to restore from storage
      const savedConversationId = localStorage.getItem(`${this.storageKey}_conversation_id`);
      if (savedConversationId) {
        this.api.setConversationId(parseInt(savedConversationId, 10));
        // TODO: Load message history when endpoint is available
      } else {
        // Create new conversation
        const conversationId = await this.api.createConversation({
          name: this.customerName,
        });
        localStorage.setItem(`${this.storageKey}_conversation_id`, String(conversationId));
      }
    } catch (error) {
      console.error('BotariWidget: Failed to initialize conversation', error);
      this.showError('Failed to start conversation. Please try again.');
    }
  }

  /**
   * Handle sending a message
   */
  private async handleSend(): Promise<void> {
    if (!this.input || this.isTyping) return;

    const text = this.input.value.trim();
    if (!text) return;

    // Clear input
    this.input.value = '';
    this.input.style.height = 'auto';

    await this.sendMessage(text);
  }

  /**
   * Send a message
   */
  async sendMessage(text: string): Promise<void> {
    // Add user message to UI
    this.addMessage({
      id: Date.now().toString(),
      conversation_id: this.api.getConversationId() || 0,
      sender: 'user',
      text,
      created_at: new Date().toISOString(),
    });

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Send to API
      const reply = await this.api.sendMessage(text, 'user');

      // Hide typing indicator
      this.hideTypingIndicator();

      // Add bot response
      this.addMessage({
        id: (Date.now() + 1).toString(),
        conversation_id: this.api.getConversationId() || 0,
        sender: 'bot',
        text: reply,
        created_at: new Date().toISOString(),
      });

      // Play sound if enabled
      if (this.config.soundEnabled) {
        this.playNotificationSound();
      }
    } catch (error) {
      this.hideTypingIndicator();
      console.error('BotariWidget: Failed to send message', error);
      this.showError('Failed to send message. Please try again.');
    }
  }

  /**
   * Add a message to the UI
   */
  private addMessage(message: Message): void {
    this.messages.push(message);

    if (!this.messagesContainer) return;

    const isBot = message.sender === 'bot' || message.sender === 'botari';
    const messageEl = document.createElement('div');
    messageEl.className = `botari-widget__message botari-widget__message--${isBot ? 'bot' : 'user'}`;

    const avatar = isBot ? '🤖' : ICONS.user;
    const time = new Date(message.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    messageEl.innerHTML = `
      <div class="botari-widget__message-avatar">
        ${isBot ? avatar : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'}
      </div>
      <div class="botari-widget__message-content">
        <div class="botari-widget__message-bubble">${this.escapeHtml(message.text)}</div>
        <span class="botari-widget__message-time">${time}</span>
      </div>
    `;

    this.messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
  }

  /**
   * Show typing indicator
   */
  private showTypingIndicator(): void {
    this.isTyping = true;
    if (!this.messagesContainer) return;

    const indicator = document.createElement('div');
    indicator.className = 'botari-widget__typing';
    indicator.id = 'botari-typing-indicator';
    indicator.innerHTML = `
      <div class="botari-widget__message-avatar">🤖</div>
      <div class="botari-widget__typing-dots">
        <span class="botari-widget__typing-dot"></span>
        <span class="botari-widget__typing-dot"></span>
        <span class="botari-widget__typing-dot"></span>
      </div>
    `;

    this.messagesContainer.appendChild(indicator);
    this.scrollToBottom();
  }

  /**
   * Hide typing indicator
   */
  private hideTypingIndicator(): void {
    this.isTyping = false;
    const indicator = document.getElementById('botari-typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    if (!this.messagesContainer) return;

    const errorEl = document.createElement('div');
    errorEl.className = 'botari-widget__error';
    errorEl.textContent = message;

    this.messagesContainer.appendChild(errorEl);
    this.scrollToBottom();

    // Auto-remove after 5 seconds
    setTimeout(() => errorEl.remove(), 5000);
  }

  /**
   * Scroll messages to bottom
   */
  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Play notification sound
   */
  private playNotificationSound(): void {
    // Create a simple beep sound
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch {
      // Audio not supported, ignore
    }
  }

  /**
   * Restore state from storage
   */
  private restoreState(): void {
    const savedName = localStorage.getItem(`${this.storageKey}_customer_name`);
    if (savedName) {
      this.customerName = savedName;
    }
  }

  /**
   * Save state to storage
   */
  private saveState(): void {
    localStorage.setItem(`${this.storageKey}_customer_name`, this.customerName);
  }

  // Public API methods

  open(): void {
    if (this.state === 'open' || !this.window || !this.button) return;
    
    this.state = 'open';
    this.window.classList.add('botari-widget__window--open');
    this.button.innerHTML = ICONS.close;
    this.button.setAttribute('aria-label', 'Close chat');
    
    // Focus input
    if (this.input) {
      setTimeout(() => this.input?.focus(), 100);
    }

    this.saveState();
  }

  close(): void {
    if (this.state === 'closed' || !this.window || !this.button) return;
    
    this.state = 'closed';
    this.window.classList.remove('botari-widget__window--open');
    this.button.innerHTML = ICONS.chat;
    this.button.setAttribute('aria-label', 'Open chat');

    this.saveState();
  }

  toggle(): void {
    if (this.state === 'open') {
      this.close();
    } else {
      this.open();
    }
  }

  clear(): void {
    this.messages = [];
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = '';
    }
    this.showWelcomeMessage();
    
    // Clear conversation ID to start fresh
    localStorage.removeItem(`${this.storageKey}_conversation_id`);
    this.initializeConversation();
  }

  destroy(): void {
    // Clear auto-open timer
    if (this.autoOpenTimer) {
      clearTimeout(this.autoOpenTimer);
    }

    // Close conversation
    this.api.closeConversation();

    // Remove from DOM
    if (this.container) {
      this.container.remove();
    }

    // Clear references
    this.container = null;
    this.button = null;
    this.window = null;
    this.messagesContainer = null;
    this.input = null;
  }
}

export default ChatWidget;
