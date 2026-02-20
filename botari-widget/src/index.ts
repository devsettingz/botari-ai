/**
 * Botari Widget - Embeddable Chat Widget
 * Main entry point for the library
 * 
 * Usage:
 * <script src="botari-widget.min.js"></script>
 * <script>
 *   BotariWidget.init({
 *     businessId: '123',
 *     apiKey: 'your-api-key',
 *     botName: 'Amina',
 *     welcomeMessage: 'Hi! How can I help you today?'
 *   });
 * </script>
 */

import type { WidgetConfig, WidgetInstance } from './types';
import { ChatWidget } from './ChatWidget';
import './styles.css';

// Store widget instances
const instances: Map<string, WidgetInstance> = new Map();

/**
 * Initialize a new Botari Widget instance
 * @param config - Widget configuration
 * @returns Widget instance with control methods
 */
export function init(config: WidgetConfig): WidgetInstance {
  const instanceId = `${config.businessId}_${Date.now()}`;
  
  const widget = new ChatWidget(config);
  widget.init();
  
  instances.set(instanceId, widget);
  
  // Store reference on window for global access
  if (typeof window !== 'undefined') {
    (window as any).__botariWidget = widget;
  }
  
  return widget;
}

/**
 * Get the most recently created widget instance
 * @returns The last widget instance or undefined
 */
export function getInstance(): WidgetInstance | undefined {
  const values = Array.from(instances.values());
  return values[values.length - 1];
}

/**
 * Destroy all widget instances
 */
export function destroyAll(): void {
  instances.forEach((instance) => instance.destroy());
  instances.clear();
  
  if (typeof window !== 'undefined') {
    delete (window as any).__botariWidget;
  }
}

/**
 * Version of the widget
 */
export const version = '1.0.0';

// Default export for UMD build
const BotariWidget = {
  init,
  getInstance,
  destroyAll,
  version,
};

// Export for ES modules
export default BotariWidget;

// Auto-initialize if config is present in window
if (typeof window !== 'undefined') {
  const w = window as any;
  
  // Expose to window for UMD
  w.BotariWidget = BotariWidget;
  
  // Auto-init if config is present
  if (w.BOTARI_WIDGET_CONFIG) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        init(w.BOTARI_WIDGET_CONFIG);
      });
    } else {
      init(w.BOTARI_WIDGET_CONFIG);
    }
  }
}
