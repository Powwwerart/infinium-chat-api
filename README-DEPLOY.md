# Deployment Guide

## Environment variables

Set these variables in your deployment platform:

| Variable | Description | Example |
| --- | --- | --- |
 codex/fix-backend-not-connected-state-9865ni
| `OPENAI_API_KEY` | API key for OpenAI chat completions. | `sk-xxxx` |
| `N8N_WEBHOOK_URL` | Full URL for forwarding `/api/event` payloads to n8n. Optional; if absent, events are only logged. | `https://n8n.example.com/webhook/abc123` |
=======
| `N8N_WEBHOOK_URL` | Full URL for forwarding normalized payloads to n8n. | `https://arturojr.app.n8n.cloud/webhook-test/infinium-event` |
| `N8N_WEBHOOK_SECRET` | Secret sent to n8n as `x-infinium-secret`. | `<string-largo>` |
| `ALLOWED_ORIGINS` | Comma-separated list of origins allowed via CORS. | `https://infinium.services,https://localhost:3000,http://localhost:3000` |
| `NODE_ENV` | Node environment. | `production` |
 main
| `PORT` (if applicable) | Port for local development servers. Some platforms set this automatically. | `3000` |
| `CORS_ALLOW_ALL_ORIGINS` (optional) | Set to `true` to allow `*` during debugging. Defaults to `https://infinium.services`. | `true` |

### CORS
 codex/fix-backend-not-connected-state-9865ni
- Allowed origin: `https://infinium.services` by default; `http://localhost:3000`, `http://localhost:5173`, and `http://localhost:4173` are also permitted. Enable `CORS_ALLOW_ALL_ORIGINS=true` for `*` during debugging only.
=======
- Allowed origins: configured via `ALLOWED_ORIGINS` (defaults to `https://infinium.services`, `https://localhost:3000`, `http://localhost:3000`).
  main
- Allowed methods per endpoint:
  - `/api/chat`: `GET`, `POST`, `OPTIONS`
  - `/api/event`: `POST`, `OPTIONS`
  - `/api/ping`: `GET`, `OPTIONS`
  - `/api/health`: `GET`, `OPTIONS`
- Allowed headers: `Content-Type`

## Running locally

```bash
npm install
npm run dev # or your platform's dev command
```

## Endpoint reference

codex/fix-backend-not-connected-state-9865ni
- `POST /api/chat` — Forwards messages to OpenAI. Requires `OPENAI_API_KEY`. Accepts `{ message, sessionId, meta }`. Returns `{ reply, actions, sessionId }`. Actions are auto-added for purchase/join/contact intents.
- `GET /api/chat` — Health check that returns `{ ok: true, note: "Use POST to chat" }`.
- `GET /api/ping` — Health-style check that returns `{ ok: true, service: "infinium-chat-api", ts: "<ISOString>" }`.
- `GET /api/health` — Health-style check that returns `{ ok: true, service: "infinium-chat-api", ts: "<ISOString>" }`.
- `POST /api/event` — Logs `{eventName, sessionId, meta, page, ts}`. If `N8N_WEBHOOK_URL` is set, forwards payload to that URL; otherwise, only logs locally and returns `{ ok: true }`.
=======
- `GET /api` — API index with available routes and guidance.
- `POST /api/message` — Alias of `/api/chat`; accepts the same body `{ message, sessionId, meta? }`.
- `POST /api/chat` — Validates `message`, normalizes payload, forwards to `N8N_WEBHOOK_URL` with `x-infinium-secret`, and relays the JSON reply (defaults `actions` to `[]`).
- `POST /api/event` — Validates `event`, normalizes payload (includes `data`), forwards to `N8N_WEBHOOK_URL` with `x-infinium-secret`, and relays the JSON reply (defaults `actions` to `[]`).
- `GET /api/ping` — Health-style check that returns `{ ok: true, service: "infinium-chat-api", ts: "<ISOString>" }`.
- `GET /api/health` — Basic health check returning `{ ok: true, service: "infinium-chat-api", ts }`.
 main

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

 codex/fix-backend-not-connected-state-9865ni
### GET /api/chat (health)

**fetch**
```js
fetch("/api/chat")
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error);
```

**curl**
```bash
curl -i https://your-deployment-url/api/chat
=======
### GET /api (index)

**curl**
```bash
curl -i https://your-deployment-url/api
 main
```

Expected JSON:
```json
 codex/fix-backend-not-connected-state-9865ni
{ "ok": true, "note": "Use POST to chat" }
=======
{
  "ok": true,
  "name": "infinium-chat-api",
  "routes": ["/api/ping", "/api/health", "/api/chat", "/api/event", "/api/message"],
  "tip": "Use POST /api/chat (o /api/message) para enviar mensajes."
}
 main
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

 codex/fix-backend-not-connected-state-9865ni
Expected JSON (reply content depends on the model response):
```json
{ "reply": "...", "actions": [], "sessionId": "demo-session" }
```

### POST /api/event

**fetch**
```js
fetch("/api/event", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    eventName: "chat_message_sent",
    sessionId: "demo-session",
    meta: { utm_source: "demo" },
    page: window.location.href,
    ts: new Date().toISOString(),
  }),
})
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error);
```
=======
Expected JSON (mirrors what n8n returns; `actions` defaults to `[]` when missing):
```json
{ "reply": "...", "actions": [] }
```

### POST /api/message (alias of /api/chat)
 main

**curl**
```bash
curl -i \
  -H "Content-Type: application/json" \
 codex/fix-backend-not-connected-state-9865ni
  -d '{"eventName":"chat_message_sent","sessionId":"demo-session","meta":{"utm_source":"demo"},"page":"https://example.com","ts":"2024-01-01T00:00:00.000Z"}' \
  https://your-deployment-url/api/event
```

Expected JSON (with `N8N_WEBHOOK_URL` unset):
```json
{ "ok": true }
```
=======
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
 main
