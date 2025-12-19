# Deployment Guide

## Environment variables

Set these variables in your deployment platform:

| Variable | Description | Example |
| --- | --- | --- |
| `OPENAI_API_KEY` | API key for OpenAI chat completions. | `sk-xxxx` |
| `N8N_WEBHOOK_URL` | Full URL for forwarding `/api/event` payloads to n8n. Optional; if absent, events are only logged. | `https://n8n.example.com/webhook/abc123` |
| `PORT` (if applicable) | Port for local development servers. Some platforms set this automatically. | `3000` |
| `CORS_ALLOW_ALL_ORIGINS` (optional) | Set to `true` to allow `*` during debugging. Defaults to `https://infinium.services`. | `true` |

### CORS
- Allowed origin: `https://infinium.services` by default; `http://localhost:3000`, `http://localhost:5173`, and `http://localhost:4173` are also permitted. Enable `CORS_ALLOW_ALL_ORIGINS=true` for `*` during debugging only.
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

- `POST /api/chat` — Forwards messages to OpenAI. Requires `OPENAI_API_KEY`. Accepts `{ message, sessionId, meta }`. Returns `{ reply, actions, sessionId }`. Actions are auto-added for purchase/join/contact intents.
- `GET /api/chat` — Health check that returns `{ ok: true, note: "Use POST to chat" }`.
- `GET /api/ping` — Health-style check that returns `{ ok: true, service: "infinium-chat-api", ts: "<ISOString>" }`.
- `GET /api/health` — Health-style check that returns `{ ok: true, service: "infinium-chat-api", ts: "<ISOString>" }`.
- `POST /api/event` — Logs `{eventName, sessionId, meta, page, ts}`. If `N8N_WEBHOOK_URL` is set, forwards payload to that URL; otherwise, only logs locally and returns `{ ok: true }`.

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
```

Expected JSON:
```json
{ "ok": true, "note": "Use POST to chat" }
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

**curl**
```bash
curl -i \
  -H "Content-Type: application/json" \
  -d '{"eventName":"chat_message_sent","sessionId":"demo-session","meta":{"utm_source":"demo"},"page":"https://example.com","ts":"2024-01-01T00:00:00.000Z"}' \
  https://your-deployment-url/api/event
```

Expected JSON (with `N8N_WEBHOOK_URL` unset):
```json
{ "ok": true }
```
