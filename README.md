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
- `POST /api/messages/audio`: Send an audio message (voice note or regular audio)
- `POST /api/messages/presence`: Update chat presence (e.g., composing, paused)
- `POST /api/messages/react`: React to a message
- `POST /api/messages/delete`: Delete a message
- `POST /api/messages/edit`: Edit a message
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

To send an image, use the `/api/messages/media` endpoint. The request body must contain a `media` object with an `image` property. The `url` field can be:

1. A path to an image file accessible by the server.
2. A **base64 string** of the image (either raw base64 or a full `data:` URI).

**Example with file URL:**

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

**Example with base64 (data URI):**

```bash
curl -X POST http://localhost:3000/api/messages/media \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "my-session",
    "jid": "5511999999999@s.whatsapp.net",
    "media": {
      "image": {
        "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
      }
    },
    "caption": "Base64 image"
  }'
```

**Notes:**
- When providing a file path, the image must be reachable by the API server.
- When providing a base64 string, you can use a raw base64 string or a full `data:` URI as shown above. The backend will automatically detect and decode it.

### Send an Audio Message

To send audio, use the `/api/messages/audio` endpoint. The request body must contain an `audio` object. The `url` field can be:

1. A path to an audio file accessible by the server.
2. A **base64 string** of the audio (either raw base64 or a full `data:` URI).

Optionally, set `ptt` to `true` to send the audio as a voice note.

**Example with file URL:**

```bash
curl -X POST http://localhost:3000/api/messages/audio \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "my-session",
    "jid": "5511999999999@s.whatsapp.net",
    "audio": { "url": "/path/to/your/audio.mp3" },
    "ptt": false
  }'
```

**Example with base64 (data URI) as voice note:**

```bash
curl -X POST http://localhost:3000/api/messages/audio \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "my-session",
    "jid": "5511999999999@s.whatsapp.net",
    "audio": {
      "url": "data:audio/ogg;base64,T2dnUwACAAAAAAAAAACZ..."
    },
    "ptt": true
  }'
```

### React to a Message

```bash
curl -X POST http://localhost:3000/api/messages/react \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "my-session",
    "key": { "remoteJid": "5511999999999@s.whatsapp.net", "id": "MESSAGE_ID" },
    "reaction": "👍"
  }'
```

### Delete a Message

```bash
curl -X POST http://localhost:3000/api/messages/delete \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "my-session",
    "key": { "remoteJid": "5511999999999@s.whatsapp.net", "id": "MESSAGE_ID" }
  }'
```

### Edit a Message

```bash
curl -X POST http://localhost:3000/api/messages/edit \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "my-session",
    "key": { "remoteJid": "5511999999999@s.whatsapp.net", "id": "MESSAGE_ID" },
    "text": "Edited text"
  }'
```

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
