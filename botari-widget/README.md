# Botari Widget

Embeddable chat widget for Botari AI - Add AI-powered customer support to any website.

## Quick Start

### 1. Include the Script

```html
<script src="https://your-cdn.com/botari-widget.umd.js"></script>
```

### 2. Initialize the Widget

```html
<script>
  BotariWidget.init({
    businessId: 'your-business-id',
    apiKey: 'your-api-key',
    botName: 'Amina',
    welcomeMessage: 'Hi! How can I help you today?'
  });
</script>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `businessId` | `string \| number` | **required** | Your business ID |
| `apiKey` | `string` | **required** | Your API key for authentication |
| `apiUrl` | `string` | `http://localhost:4000` | API base URL |
| `position` | `string` | `'bottom-right'` | Widget position (`bottom-right`, `bottom-left`, `top-right`, `top-left`) |
| `primaryColor` | `string` | `'#E2725B'` | Primary accent color |
| `welcomeMessage` | `string` | `'Hello! How can I help you today?'` | Initial bot message |
| `botName` | `string` | `'Botari Assistant'` | Name shown in header |
| `businessName` | `string` | `'Botari AI'` | Business name in footer |
| `placeholder` | `string` | `'Type a message...'` | Input placeholder |
| `autoOpen` | `number` | `0` | Auto-open delay in ms (0 to disable) |
| `soundEnabled` | `boolean` | `true` | Enable notification sounds |
| `customClass` | `string` | `''` | Additional CSS class |

## API Methods

```javascript
// Initialize
const widget = BotariWidget.init(config);

// Control the widget
widget.open();      // Open chat window
widget.close();     // Close chat window
widget.toggle();    // Toggle chat window
widget.clear();     // Clear conversation history
widget.destroy();   // Remove widget from page

// Send message programmatically
await widget.sendMessage('Hello!');

// Get latest instance
const instance = BotariWidget.getInstance();

// Destroy all instances
BotariWidget.destroyAll();
```

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to My Website</h1>
  
  <!-- Botari Widget -->
  <script src="botari-widget.umd.js"></script>
  <script>
    BotariWidget.init({
      businessId: '123',
      apiKey: 'sk_live_abc123',
      apiUrl: 'https://api.botari.ai',
      botName: 'Amina',
      businessName: 'My Business',
      welcomeMessage: '👋 Welcome! I\'m Amina. How can I assist you?',
      position: 'bottom-right',
      primaryColor: '#E2725B',
      autoOpen: 5000,
      soundEnabled: true
    });
  </script>
</body>
</html>
```

## Auto-Initialization

You can also configure the widget via a global config object before loading the script:

```html
<script>
  window.BOTARI_WIDGET_CONFIG = {
    businessId: '123',
    apiKey: 'your-api-key',
    botName: 'Amina'
  };
</script>
<script src="botari-widget.umd.js"></script>
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13.1+
- Edge 80+

## License

ISC
