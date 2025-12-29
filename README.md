# INFINEUM Chat API

Backend bridge between the public INFINEUM frontend, OpenAI Assistants, and the internal n8n automation. The API validates requests, applies simple rate limiting, and forwards chat/event payloads to the configured n8n webhook with the shared secret header.

## Environment variables

Create a `.env` file with:

| Variable | Description | Example |
| --- | --- | --- |
| `N8N_WEBHOOK_URL` | n8n webhook URL that receives forwarded payloads. | `https://example.n8n.cloud/webhook/infinium` |
| `N8N_WEBHOOK_SECRET` | Secret sent as `x-infinium-secret` header to n8n. | `<string-largo>` |
| `OPENAI_API_KEY` | OpenAI API key for Assistants calls used by `/api/chat`. | `<TOKEN_HERE>` |
| `OPENAI_ASSISTANT_ID` | Assistant ID used by `/api/chat`. | `asst_12345678` |
| `ALLOWED_ORIGINS` | Optional comma-separated list of allowed origins for CORS (defaults listed below). | `https://infinium.services,http://localhost:3000` |
| `CORS_ALLOW_ALL_ORIGINS` | Optional. Set to `true` only for debugging to allow `*`. | `true` |
| `NODE_ENV` | Node environment. | `production` |

Both `N8N_WEBHOOK_URL` and `N8N_WEBHOOK_SECRET` are required for forwarding. Requests fail with a 500 if either is missing.

## Endpoints

- `GET /api` — Lists available routes.
- `GET /api/ping` — Health endpoint with timestamp (CORS-enabled).
- `GET /api/health` — Health endpoint returning `{ ok, service, ts, n8n: { webhookUrlConfigured, webhookSecretConfigured } }`.
- `POST /api/chat` — Validates the body, applies rate limiting, assigns `type: "chat"` and an ISO `timestamp` (if missing), then forwards the payload to n8n and relays the response.
- `POST /api/event` — Applies rate limiting, assigns `type: "event"` and an ISO `timestamp` (if missing), then forwards the payload to n8n and relays the response.
- `POST /api/message` — Alias of `/api/chat`.

### Payload format sent to n8n

`POST /api/chat`

```json
{
  "type": "chat",
  "message": "<string>",
  "sessionId": "<string|null>",
  "meta": { "s": "...", "t": "...", "c": "..." },
  "timestamp": "<ISO_DATE>",
  "...": "additional fields are forwarded untouched"
}
```

`POST /api/event`

```json
{
  "type": "event",
  "sessionId": "<string|null>",
  "timestamp": "<ISO_DATE>",
  "...": "original event fields (including QR metadata)"
}
```

Headers to n8n:

- `Content-Type: application/json`
- `x-infinium-secret: <N8N_WEBHOOK_SECRET>`

### Rate limiting

Basic in-memory limiter: 20 requests per 60 seconds per `sessionId` (falls back to IP). Returns `429` when exceeded.

### Timeouts & errors

- Requests to n8n time out after 10s and return `504`.
- Other forwarding errors return `502` with a message.
- Missing webhook configuration returns `500`.
- Invalid payloads return `400`.
- Only `POST` is allowed for `/api/chat` and `/api/event`; `OPTIONS` is handled for CORS preflight.

## CORS

Allowed origins default to:

- `https://infinium.services`
- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:4173`

Override with `ALLOWED_ORIGINS` (comma-separated). Set `CORS_ALLOW_ALL_ORIGINS=true` only for temporary debugging.

## Running locally

```bash
npm install
vercel dev   # or your platform's dev command
```

## Testing with curl

### Chat

```bash
curl -i -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message":"hola",
    "sessionId":"uuid",
    "meta":{
      "s":"barberia23",
      "t":"teamA",
      "c":"flyer01"
    },
    "timestamp":"2025-12-20T12:00:00Z"
  }'
```

### Manual debug snippet

```bash
curl -i -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message":"hola",
    "sessionId":"debug",
    "meta":{
      "site_id":"web",
      "team_id":"t",
      "campaign_id":"c"
    }
  }'
```

### Event

```bash
curl -i -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{
    "event":"cta_click",
    "sessionId":"uuid",
    "meta":{
      "s":"barberia23",
      "t":"teamA",
      "c":"flyer01"
    },
    "data":{
      "cta":"buy",
      "url":"https://..."
    },
    "timestamp":"2025-12-20T12:00:00Z"
  }'
```

## Deploying to Vercel

1. Create a new Vercel project pointing to this repository.
2. Set environment variables (`N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET`, `ALLOWED_ORIGINS`, `CORS_ALLOW_ALL_ORIGINS`, `NODE_ENV`) in the Vercel dashboard.
3. Deploy. Vercel will expose the API routes under `/api/*`.
4. Test with the curl commands above using your Vercel deployment URL.
