# WhatsApp Baileys API

A REST API for WhatsApp using the Baileys library, Express, and Prisma.

## Description

This project provides a REST API to interact with WhatsApp Web using the Baileys library. It allows you to:

- Manage multiple WhatsApp sessions
- Send and receive messages
- Configure webhooks to receive real-time events
- Store message history in a database

## Technologies Used

- **TypeScript**: Programming language
- **Express**: Web framework
- **Baileys**: Library for WhatsApp Web interaction
- **Prisma**: ORM for database access
- **PostgreSQL**: Relational database
- **Docker**: Containerization

## Project Structure

The project follows a component-based architecture:

```
wa-baileys-api/
├── prisma/                  # Prisma configuration and models
├── src/                     # Source code
│   ├── controllers/         # API controllers
│   ├── routes/              # API routes
│   ├── services/            # Business services
│   └── index.ts             # Application entry point
├── .env.example             # Example environment variables
├── docker-compose.yml       # Docker Compose configuration
├── Dockerfile               # Docker configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # Documentation
```

## Installation and Setup

### Prerequisites

- Node.js 18 or higher
- NPM
- PostgreSQL (or Docker to run the database)

### Configuration

1. Clone the repository:
   ```bash
   git clone https://github.com/wnexous/wa-baileys-api.git
   cd wa-baileys-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your settings.

4. Set up the database:
   ```bash
   npm run prisma:migrate
   ```

### Running Locally

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### Running with Docker

```bash
docker-compose up -d
```

## API Endpoints

### Sessions

- `POST /api/sessions`: Create a new session
- `GET /api/sessions`: List all sessions
- `GET /api/sessions/:sessionId`: Get session details
- `GET /api/sessions/:sessionId/qr`: Get QR code for authentication
- `DELETE /api/sessions/:sessionId`: Delete a session

### Messages

- `POST /api/messages/text`: Send a text message
- `POST /api/messages/media`: Send a media message (image, video, audio, document)
- `POST /api/messages/button`: Send a message with buttons
- `POST /api/messages/presence`: Update chat presence (e.g., composing, paused)
- `GET /api/messages`: List messages
- `GET /api/messages/:messageId`: Get message details

### Webhooks

- `POST /api/webhooks`: Register a new webhook
- `GET /api/webhooks`: List webhooks
- `PUT /api/webhooks/:webhookId`: Update a webhook
- `DELETE /api/webhooks/:webhookId`: Delete a webhook

## Webhooks

Webhooks allow you to receive real-time notifications about WhatsApp events. You can configure a URL to receive events such as:

- `connection.open`: When a session is connected
- `connection.logout`: When a session is disconnected
- `qr.update`: When a new QR code is generated
- `messages.received`: When a new message is received

## Usage Examples

### Create a Session

```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "my-session"}'
```

### Send a Message

```bash
curl -X POST http://localhost:3000/api/messages/text \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "my-session",
    "jid": "5511999999999@s.whatsapp.net",
    "text": "Hello, world!"
  }'
```

### Send a Message with Buttons

```bash
curl -X POST http://localhost:3000/api/messages/button \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "my-session",
    "jid": "5511999999999@s.whatsapp.net",
    "text": "Choose an option:",
    "footer": "Message footer",
    "buttons": [
      { "id": "btn1", "displayText": "Button 1" },
      { "id": "btn2", "displayText": "Button 2" }
    ]
  }'
```

### Send an Image

To send an image, use the `/api/messages/media` endpoint. The request body must contain a `media` object with an `image` property, which in turn contains a `url` property with the path to the image file or an image Buffer.

**Example with URL:**

```bash
curl -X POST http://localhost:3000/api/messages/media \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "my-session",
    "jid": "5511999999999@s.whatsapp.net",
    "media": {
      "image": { "url": "/path/to/your/image.jpg" }
    },
    "caption": "Look at this image!"
  }'
```

**Note:** To use a URL, the image file must be accessible by the server where the API is running. To send a Buffer, you will need to construct the request programmatically or use a tool that allows sending `multipart/form-data` and adapt the controller to handle file uploads if that is the intention (currently the controller expects `application/json`). The most direct way via JSON is to send the image as a Base64 encoded Buffer and decode it on the backend, or use a URL for a local file.

### Update Chat Presence

```bash
curl -X POST http://localhost:3000/api/messages/presence \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "my-session",
    "jid": "5511999999999@s.whatsapp.net",
    "presence": "composing"
  }'
```

**Valid presence values:** `composing`, `paused`, `recording`, `available`, `unavailable`.

### Register a Webhook

```bash
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "my-session",
    "url": "https://my-site.com/webhook",
    "events": ["messages.received", "connection.open"]
  }'
```

## License

MIT
