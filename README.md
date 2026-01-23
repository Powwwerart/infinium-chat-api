# INFINEUM Chat API

Backend bridge between the public INFINEUM frontend, OpenAI Assistants, and the optional n8n automation. The API validates requests, applies simple rate limiting, and can forward normalized chat/event payloads to a configured n8n webhook.

## Environment variables

Create a `.env` file with:

| Variable | Description | Example |
| --- | --- | --- |
| `FRONTEND_ORIGIN` | Allowed origin(s) for CORS, comma-separated. Optional; if missing, the API echoes the request origin. | `https://infinium.services` |
| `BUY_URL` | Public shop URL appended to every chat response. | `https://vitalhealthglobal.com/collections/all?refID=145748` |
| `WHATSAPP_PHONE` | WhatsApp phone number (digits only) used to build the contact URL. | `19565505115` |
| `N8N_WEBHOOK_URL` | Optional n8n webhook URL that receives normalized payloads. | `https://example.n8n.cloud/webhook/infinium` |
| `N8N_WEBHOOK_SECRET` | Optional secret sent as `x-infinium-secret` header to n8n. | `<string-largo>` |
| `NODE_ENV` | Node environment. | `production` |

When `N8N_WEBHOOK_URL` is missing, the API responds with a stable fallback reply and still returns `200` for logging events.

## Endpoints

- `GET /api` — Lists available routes.
- `GET /api/ping` — Health endpoint with timestamp (CORS-enabled).
- `GET /api/health` — Health endpoint returning `{ ok, service, ts, n8n: { webhookUrlConfigured, webhookSecretConfigured } }`.
- `POST /api/chat` — Validates the body, detects one of 9 wellness intents, optionally forwards to n8n, and always returns a stable reply with shop + WhatsApp links.
- `POST /api/event` — Receives logging events, normalizes them, optionally forwards to n8n, and always replies `200`.
- `POST /api/message` — Alias of `/api/chat`.

### Normalized payload format

`POST /api/chat`

```json
{
  "event_type": "lead",
  "source": "web",
  "project": "INFINIUM",
  "user": { "name": null, "contact": null },
  "intent": "info",
  "confidence": 0.0,
  "priority": "low",
  "message": "<string>",
  "meta": { "site_id": "", "campaign_id": "" },
  "timestamp": "<ISO_DATE>",
  "sessionId": "<string>"
}
```

`POST /api/event`

```json
{
  "event_type": "alerta",
  "source": "web",
  "project": "INFINIUM",
  "user": { "name": null, "contact": null },
  "intent": null,
  "confidence": 0.0,
  "priority": "low",
  "message": "<string>",
  "meta": { "site_id": "", "campaign_id": "" },
  "timestamp": "<ISO_DATE>",
  "sessionId": "<string>",
  "raw": { "...": "original event payload" }
}
```

Headers to n8n (when configured):

- `Content-Type: application/json`
- `x-infinium-secret: <N8N_WEBHOOK_SECRET>` (optional)

### Rate limiting

Basic in-memory limiter: 20 requests per 60 seconds per `sessionId` (falls back to IP). Returns `429` when exceeded.

### Timeouts & errors

- Requests to n8n time out after 10s and return `504`.
- Other forwarding errors return `502` with a message.
- Invalid payloads return `400`.
- Only `POST` is allowed for `/api/chat` and `/api/event`; `OPTIONS` is handled for CORS preflight.

## CORS

- If `FRONTEND_ORIGIN` is set, the API uses it as the allowed origin(s).
- If `FRONTEND_ORIGIN` is missing, the API echoes the request origin so the frontend is never blocked.

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
      "site_id":"barberia23",
      "team_id":"teamA",
      "campaign_id":"flyer01"
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
      "campaign_id":"flyer01"
    },
    "data":{
      "cta":"buy",
      "url":"https://..."
    }
  }'
```

## Deploying to Vercel

1. Create a new Vercel project pointing to this repository.
2. Set environment variables (`FRONTEND_ORIGIN`, `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET`, `NODE_ENV`) in the Vercel dashboard.
3. Deploy. Vercel will expose the API routes under `/api/*`.
4. Test with the curl commands above using your Vercel deployment URL.
