# INFINEUM Chat API

Backend bridge between the public INFINEUM frontend and the internal n8n automation. The API normalizes chat and event payloads, validates requests, applies a simple in-memory rate limit, and forwards everything to the configured n8n webhook with a shared secret header.

## Environment variables

Create a `.env` file (see `.env.example`) with:

| Variable | Description | Example |
| --- | --- | --- |
| `N8N_WEBHOOK_URL` | n8n webhook URL that receives normalized payloads. | `https://arturojr.app.n8n.cloud/webhook-test/infinium-event` |
| `N8N_WEBHOOK_SECRET` | Secret sent as `x-infinium-secret` header to n8n. | `<string-largo>` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed origins for CORS. | `https://infinium.services,https://localhost:3000,http://localhost:3000` |
| `NODE_ENV` | Node environment. | `production` |

If `N8N_WEBHOOK_URL` is not configured, `/api/chat` returns a stable fallback reply with a WhatsApp action and `/api/event` returns `{ ok: true, message: "event accepted (n8n not configured yet)" }`, both with HTTP 200. This prevents misconfiguration from causing 500 errors while keeping CORS and rate limiting intact.

## Endpoints

- `POST /api/chat` — Validates `message` (non-empty string) and forwards normalized payload to n8n. Returns the exact `reply` and `actions` from n8n (defaults `actions` to `[]`).
- `POST /api/event` — Validates `event` (non-empty string) and forwards normalized payload to n8n. Returns the exact `reply` and `actions` from n8n (defaults `actions` to `[]`).
- `GET /api/ping` — Simple health endpoint with timestamp (CORS-enabled).
- `GET /api/health` — Simple health endpoint returning `{ ok, service, ts }`.

### Payload format sent to n8n

```json
{
  "type": "chat" | "event",
  "message": "<string>", // only for type=chat
  "event": "<string>",   // only for type=event
  "sessionId": "<string|null>",
  "meta": { "site_id": "...", "team_id": "...", "campaign_id": "...", "page": "...", "ts": "..." },
  "data": { /* event-specific data */ } // only for type=event
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
- Invalid payloads return `400`.
- Only `POST` is allowed for `/api/chat` and `/api/event`; `OPTIONS` is handled for CORS preflight.

## CORS

Allowed origins are taken from `ALLOWED_ORIGINS`. If not set, defaults to:

- `https://infinium.services`
- `https://localhost:3000`
- `http://localhost:3000`

## Running locally

```bash
npm install
vercel dev   # or `npm run dev` if configured
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
      "site_id":"barberia23",
      "team_id":"teamA",
      "campaign_id":"flyer01",
      "page":"https://infinium.services/?s=...&t=...&c=...",
      "ts":"2025-12-20T12:00:00Z"
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
      "site_id":"barberia23",
      "team_id":"teamA",
      "campaign_id":"flyer01",
      "page":"https://infinium.services/?s=...&t=...&c=...",
      "ts":"2025-12-20T12:00:00Z"
    },
    "data":{
      "cta":"buy",
      "url":"https://..."
    }
  }'
```

## Deploying to Vercel

1. Create a new Vercel project pointing to this repository.
2. Set environment variables (`N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET`, `ALLOWED_ORIGINS`, `NODE_ENV`) in the Vercel dashboard.
3. Deploy. Vercel will expose the API routes under `/api/*`.
4. Test with the curl commands above using your Vercel deployment URL.
