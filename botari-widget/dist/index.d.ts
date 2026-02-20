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
import './styles.css';
/**
 * Initialize a new Botari Widget instance
 * @param config - Widget configuration
 * @returns Widget instance with control methods
 */
export declare function init(config: WidgetConfig): WidgetInstance;
/**
 * Get the most recently created widget instance
 * @returns The last widget instance or undefined
 */
export declare function getInstance(): WidgetInstance | undefined;
/**
 * Destroy all widget instances
 */
export declare function destroyAll(): void;
/**
 * Version of the widget
 */
export declare const version = "1.0.0";
declare const BotariWidget: {
    init: typeof init;
    getInstance: typeof getInstance;
    destroyAll: typeof destroyAll;
    version: string;
};
export default BotariWidget;
//# sourceMappingURL=index.d.ts.map