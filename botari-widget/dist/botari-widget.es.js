class BotariAPI {
  constructor(config) {
    this.conversationId = null;
    this.config = {
      apiUrl: config.apiUrl || "http://localhost:4000",
      apiKey: config.apiKey,
      businessId: config.businessId
    };
  }
  /**
   * Get the current conversation ID
   */
  getConversationId() {
    return this.conversationId;
  }
  /**
   * Set conversation ID (used when restoring from storage)
   */
  setConversationId(id) {
    this.conversationId = id;
  }
  /**
   * Create headers for API requests
   */
  getHeaders() {
    return {
      "Content-Type": "application/json",
      "X-API-Key": this.config.apiKey,
      "X-Business-ID": String(this.config.businessId)
    };
  }
  /**
   * Create a new conversation
   */
  async createConversation(customerInfo) {
    const response = await fetch(`${this.config.apiUrl}/api/conversations`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        customer_name: (customerInfo == null ? void 0 : customerInfo.name) || "Website Visitor",
        customer_phone: (customerInfo == null ? void 0 : customerInfo.phone) || "",
        employee_id: 1
        // Default AI employee
      })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `Failed to create conversation: ${response.status}`);
    }
    const data = await response.json();
    this.conversationId = data.conversation_id;
    return data.conversation_id;
  }
  /**
   * Get messages for the current conversation
   */
  async getMessages(conversationId) {
    const id = conversationId || this.conversationId;
    if (!id) {
      throw new Error("No conversation ID available");
    }
    const response = await fetch(
      `${this.config.apiUrl}/api/conversations/${id}/messages`,
      {
        method: "GET",
        headers: this.getHeaders()
      }
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `Failed to get messages: ${response.status}`);
    }
    return response.json();
  }
  /**
   * Send a message and get AI response
   */
  async sendMessage(text, sender = "user") {
    if (!this.conversationId) {
      await this.createConversation();
    }
    const response = await fetch(`${this.config.apiUrl}/api/messages`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        conversation_id: this.conversationId,
        sender,
        text
      })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `Failed to send message: ${response.status}`);
    }
    const data = await response.json();
    return data.reply;
  }
  /**
   * Close the current conversation
   */
  async closeConversation(conversationId) {
    const id = conversationId || this.conversationId;
    if (!id) return;
    const response = await fetch(
      `${this.config.apiUrl}/api/conversations/${id}/close`,
      {
        method: "PUT",
        headers: this.getHeaders()
      }
    );
    if (!response.ok) {
      console.error("Failed to close conversation");
    }
    this.conversationId = null;
  }
  /**
   * Check if API is reachable
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.config.apiUrl}/health`, {
        method: "GET",
        headers: { "X-API-Key": this.config.apiKey }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
const ICONS = {
  chat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>`,
  close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  send: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></svg>`,
  clear: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
  user: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
};
class ChatWidget {
  constructor(config) {
    this.state = "closed";
    this.messages = [];
    this.container = null;
    this.button = null;
    this.window = null;
    this.messagesContainer = null;
    this.input = null;
    this.isTyping = false;
    this.autoOpenTimer = null;
    this.customerName = "You";
    if (!config.businessId) {
      throw new Error("BotariWidget: businessId is required");
    }
    if (!config.apiKey) {
      throw new Error("BotariWidget: apiKey is required");
    }
    this.config = {
      businessId: config.businessId,
      apiKey: config.apiKey,
      apiUrl: config.apiUrl || "http://localhost:4000",
      position: config.position || "bottom-right",
      primaryColor: config.primaryColor || "#E2725B",
      welcomeMessage: config.welcomeMessage || "Hello! How can I help you today?",
      botName: config.botName || "Botari Assistant",
      businessName: config.businessName || "Botari AI",
      placeholder: config.placeholder || "Type a message...",
      autoOpen: config.autoOpen || 0,
      soundEnabled: config.soundEnabled !== false,
      customClass: config.customClass || ""
    };
    this.api = new BotariAPI(this.config);
    this.storageKey = `botari_widget_${this.config.businessId}`;
    this.restoreState();
  }
  /**
   * Initialize the widget - create DOM elements and attach events
   */
  init() {
    if (this.container) {
      console.warn("BotariWidget: Already initialized");
      return;
    }
    this.createDOM();
    this.attachEvents();
    this.applyCustomStyles();
    if (this.config.autoOpen > 0) {
      this.autoOpenTimer = window.setTimeout(() => {
        this.open();
      }, this.config.autoOpen);
    }
    this.initializeConversation();
  }
  /**
   * Create all DOM elements
   */
  createDOM() {
    this.container = document.createElement("div");
    this.container.className = `botari-widget botari-widget--${this.config.position} ${this.config.customClass}`;
    this.container.setAttribute("role", "region");
    this.container.setAttribute("aria-label", "Botari Chat Widget");
    this.button = document.createElement("button");
    this.button.className = "botari-widget__button";
    this.button.setAttribute("aria-label", "Open chat");
    this.button.innerHTML = ICONS.chat;
    this.container.appendChild(this.button);
    this.window = document.createElement("div");
    this.window.className = "botari-widget__window";
    this.window.setAttribute("role", "dialog");
    this.window.setAttribute("aria-label", "Chat with us");
    const header = document.createElement("div");
    header.className = "botari-widget__header";
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
    this.messagesContainer = document.createElement("div");
    this.messagesContainer.className = "botari-widget__messages";
    this.window.appendChild(this.messagesContainer);
    const inputArea = document.createElement("div");
    inputArea.className = "botari-widget__input-area";
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
    const powered = document.createElement("div");
    powered.className = "botari-widget__powered";
    powered.innerHTML = `Powered by <a href="https://botari.ai" target="_blank" rel="noopener">${this.config.businessName}</a>`;
    this.window.appendChild(powered);
    this.container.appendChild(this.window);
    this.input = inputArea.querySelector(".botari-widget__input");
    document.body.appendChild(this.container);
    this.showWelcomeMessage();
  }
  /**
   * Attach event listeners
   */
  attachEvents() {
    if (!this.button || !this.window || !this.input) return;
    this.button.addEventListener("click", () => this.toggle());
    this.window.addEventListener("click", (e) => {
      const target = e.target;
      const btn = target.closest("[data-action]");
      if (btn) {
        const action = btn.getAttribute("data-action");
        if (action === "close") this.close();
        if (action === "clear") this.clear();
      }
    });
    const sendBtn = this.window.querySelector(".botari-widget__send-btn");
    sendBtn.addEventListener("click", () => this.handleSend());
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });
    this.input.addEventListener("input", () => {
      this.input.style.height = "auto";
      this.input.style.height = Math.min(this.input.scrollHeight, 120) + "px";
    });
    document.addEventListener("click", (e) => {
      const target = e.target;
      if (this.state === "open" && !this.window.contains(target) && !this.button.contains(target)) {
        this.close();
      }
    });
  }
  /**
   * Apply custom primary color
   */
  applyCustomStyles() {
    if (this.config.primaryColor !== "#E2725B" && this.container) {
      this.container.style.setProperty("--botari-primary", this.config.primaryColor);
    }
  }
  /**
   * Show welcome message
   */
  showWelcomeMessage() {
    if (this.messages.length === 0) {
      this.addMessage({
        id: "welcome",
        conversation_id: 0,
        sender: "bot",
        text: this.config.welcomeMessage,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }
  /**
   * Initialize or restore conversation
   */
  async initializeConversation() {
    try {
      const savedConversationId = localStorage.getItem(`${this.storageKey}_conversation_id`);
      if (savedConversationId) {
        this.api.setConversationId(parseInt(savedConversationId, 10));
      } else {
        const conversationId = await this.api.createConversation({
          name: this.customerName
        });
        localStorage.setItem(`${this.storageKey}_conversation_id`, String(conversationId));
      }
    } catch (error) {
      console.error("BotariWidget: Failed to initialize conversation", error);
      this.showError("Failed to start conversation. Please try again.");
    }
  }
  /**
   * Handle sending a message
   */
  async handleSend() {
    if (!this.input || this.isTyping) return;
    const text = this.input.value.trim();
    if (!text) return;
    this.input.value = "";
    this.input.style.height = "auto";
    await this.sendMessage(text);
  }
  /**
   * Send a message
   */
  async sendMessage(text) {
    this.addMessage({
      id: Date.now().toString(),
      conversation_id: this.api.getConversationId() || 0,
      sender: "user",
      text,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    this.showTypingIndicator();
    try {
      const reply = await this.api.sendMessage(text, "user");
      this.hideTypingIndicator();
      this.addMessage({
        id: (Date.now() + 1).toString(),
        conversation_id: this.api.getConversationId() || 0,
        sender: "bot",
        text: reply,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (this.config.soundEnabled) {
        this.playNotificationSound();
      }
    } catch (error) {
      this.hideTypingIndicator();
      console.error("BotariWidget: Failed to send message", error);
      this.showError("Failed to send message. Please try again.");
    }
  }
  /**
   * Add a message to the UI
   */
  addMessage(message) {
    this.messages.push(message);
    if (!this.messagesContainer) return;
    const isBot = message.sender === "bot" || message.sender === "botari";
    const messageEl = document.createElement("div");
    messageEl.className = `botari-widget__message botari-widget__message--${isBot ? "bot" : "user"}`;
    const avatar = isBot ? "🤖" : ICONS.user;
    const time = new Date(message.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
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
  showTypingIndicator() {
    this.isTyping = true;
    if (!this.messagesContainer) return;
    const indicator = document.createElement("div");
    indicator.className = "botari-widget__typing";
    indicator.id = "botari-typing-indicator";
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
  hideTypingIndicator() {
    this.isTyping = false;
    const indicator = document.getElementById("botari-typing-indicator");
    if (indicator) {
      indicator.remove();
    }
  }
  /**
   * Show error message
   */
  showError(message) {
    if (!this.messagesContainer) return;
    const errorEl = document.createElement("div");
    errorEl.className = "botari-widget__error";
    errorEl.textContent = message;
    this.messagesContainer.appendChild(errorEl);
    this.scrollToBottom();
    setTimeout(() => errorEl.remove(), 5e3);
  }
  /**
   * Scroll messages to bottom
   */
  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }
  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  /**
   * Play notification sound
   */
  playNotificationSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.value = 0.1;
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch {
    }
  }
  /**
   * Restore state from storage
   */
  restoreState() {
    const savedName = localStorage.getItem(`${this.storageKey}_customer_name`);
    if (savedName) {
      this.customerName = savedName;
    }
  }
  /**
   * Save state to storage
   */
  saveState() {
    localStorage.setItem(`${this.storageKey}_customer_name`, this.customerName);
  }
  // Public API methods
  open() {
    if (this.state === "open" || !this.window || !this.button) return;
    this.state = "open";
    this.window.classList.add("botari-widget__window--open");
    this.button.innerHTML = ICONS.close;
    this.button.setAttribute("aria-label", "Close chat");
    if (this.input) {
      setTimeout(() => {
        var _a;
        return (_a = this.input) == null ? void 0 : _a.focus();
      }, 100);
    }
    this.saveState();
  }
  close() {
    if (this.state === "closed" || !this.window || !this.button) return;
    this.state = "closed";
    this.window.classList.remove("botari-widget__window--open");
    this.button.innerHTML = ICONS.chat;
    this.button.setAttribute("aria-label", "Open chat");
    this.saveState();
  }
  toggle() {
    if (this.state === "open") {
      this.close();
    } else {
      this.open();
    }
  }
  clear() {
    this.messages = [];
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = "";
    }
    this.showWelcomeMessage();
    localStorage.removeItem(`${this.storageKey}_conversation_id`);
    this.initializeConversation();
  }
  destroy() {
    if (this.autoOpenTimer) {
      clearTimeout(this.autoOpenTimer);
    }
    this.api.closeConversation();
    if (this.container) {
      this.container.remove();
    }
    this.container = null;
    this.button = null;
    this.window = null;
    this.messagesContainer = null;
    this.input = null;
  }
}
const instances = /* @__PURE__ */ new Map();
function init(config) {
  const instanceId = `${config.businessId}_${Date.now()}`;
  const widget = new ChatWidget(config);
  widget.init();
  instances.set(instanceId, widget);
  if (typeof window !== "undefined") {
    window.__botariWidget = widget;
  }
  return widget;
}
function getInstance() {
  const values = Array.from(instances.values());
  return values[values.length - 1];
}
function destroyAll() {
  instances.forEach((instance) => instance.destroy());
  instances.clear();
  if (typeof window !== "undefined") {
    delete window.__botariWidget;
  }
}
const version = "1.0.0";
const BotariWidget = {
  init,
  getInstance,
  destroyAll,
  version
};
if (typeof window !== "undefined") {
  const w = window;
  w.BotariWidget = BotariWidget;
  if (w.BOTARI_WIDGET_CONFIG) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        init(w.BOTARI_WIDGET_CONFIG);
      });
    } else {
      init(w.BOTARI_WIDGET_CONFIG);
    }
  }
}
export {
  BotariWidget as default,
  destroyAll,
  getInstance,
  init,
  version
};
//# sourceMappingURL=botari-widget.es.js.map
