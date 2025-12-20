# Deployment Guide

## Environment variables

Set these variables in your deployment platform:

| Variable | Description | Example |
| --- | --- | --- |
| `N8N_WEBHOOK_URL` | Full URL for forwarding normalized payloads to n8n. | `https://arturojr.app.n8n.cloud/webhook-test/infinium-event` |
| `N8N_WEBHOOK_SECRET` | Secret sent to n8n as `x-infinium-secret`. | `<string-largo>` |
| `ALLOWED_ORIGINS` | Comma-separated list of origins allowed via CORS. | `https://infinium.services,https://localhost:3000,http://localhost:3000` |
| `NODE_ENV` | Node environment. | `production` |
| `PORT` (if applicable) | Port for local development servers. Some platforms set this automatically. | `3000` |

### CORS
- Allowed origins: configured via `ALLOWED_ORIGINS` (defaults to `https://infinium.services`, `https://localhost:3000`, `http://localhost:3000`).
- Allowed methods per endpoint:
  - `/api/chat`: `POST`, `OPTIONS`
  - `/api/event`: `POST`, `OPTIONS`
  - `/api/ping`: `GET`, `OPTIONS`
- Allowed headers: `Content-Type`

## Running locally

```bash
npm install
npm run dev # or your platform's dev command
```

## Endpoint reference

- `GET /api` — API index with available routes and guidance.
- `POST /api/message` — Alias of `/api/chat`; accepts the same body `{ message, sessionId, meta? }`.
- `POST /api/chat` — Validates `message`, normalizes payload, forwards to `N8N_WEBHOOK_URL` with `x-infinium-secret`, and relays the JSON reply (defaults `actions` to `[]`).
- `POST /api/event` — Validates `event`, normalizes payload (includes `data`), forwards to `N8N_WEBHOOK_URL` with `x-infinium-secret`, and relays the JSON reply (defaults `actions` to `[]`).
- `GET /api/ping` — Health-style check that returns `{ ok: true, service: "infinium-chat-api", ts: "<ISOString>" }`.
- `GET /api/health` — Basic health check returning `{ ok: true, service: "infinium-chat-api", ts }`.

## Testing the healthchecks

You can run these from your browser console or terminal.

### GET /api/ping

**fetch**
```js
fetch("/api/ping")
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error);
```

**curl**
```bash
curl -i https://your-deployment-url/api/ping
```

Expected JSON:
```json
{ "ok": true, "service": "infinium-chat-api", "ts": "2024-01-01T00:00:00.000Z" }
```

### GET /api (index)

**curl**
```bash
curl -i https://your-deployment-url/api
```

Expected JSON:
```json
{
  "ok": true,
  "name": "infinium-chat-api",
  "routes": ["/api/ping", "/api/health", "/api/chat", "/api/event", "/api/message"],
  "tip": "Use POST /api/chat (o /api/message) para enviar mensajes."
}
```

### POST /api/chat

**fetch**
```js
fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "Hola", sessionId: "demo-session" }),
})
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error);
```

**curl**
```bash
curl -i \
  -H "Content-Type: application/json" \
  -d '{"message":"Hola","sessionId":"demo-session"}' \
  https://your-deployment-url/api/chat
```

Expected JSON (mirrors what n8n returns; `actions` defaults to `[]` when missing):
```json
{ "reply": "...", "actions": [] }
```

### POST /api/message (alias of /api/chat)

**curl**
```bash
curl -i \
  -H "Content-Type: application/json" \
  -d '{"message":"Hola","sessionId":"demo-session"}' \
  https://your-deployment-url/api/message
```

**PowerShell**
```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "https://your-deployment-url/api/message" `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"message":"Hola","sessionId":"demo-session"}'
```

Expected JSON: same as `/api/chat` response (including fallback when `N8N_WEBHOOK_URL` is not set).
