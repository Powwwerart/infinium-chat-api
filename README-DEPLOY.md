# Deployment Guide

The backend is a thin transport layer that validates CORS, rate limits, parses JSON, and forwards payloads to n8n. It does **not** call OpenAI or add business logic.

## Environment variables

Set these variables in your deployment platform:

| Variable | Description | Example |
| --- | --- | --- |
| `N8N_WEBHOOK_URL` | Full URL that receives forwarded `/api/chat` and `/api/event` payloads. | `https://example.n8n.cloud/webhook/infinium` |
| `N8N_WEBHOOK_SECRET` | Shared secret sent as `x-infinium-secret` when forwarding to n8n. | `super-secure-secret` |
| `ALLOWED_ORIGINS` | Optional comma-separated list for CORS. Defaults to `https://infinium.services` plus local dev ports `3000/5173/4173`. | `https://infinium.services,http://localhost:3000` |
| `CORS_ALLOW_ALL_ORIGINS` | Optional. Set to `true` for `*` during debugging only. | `true` |
| `NODE_ENV` | Node environment. | `production` |
| `PORT` | Port for local development (platform-dependent). | `3000` |

### CORS

- Defaults: `https://infinium.services`, `http://localhost:3000`, `http://localhost:5173`, `http://localhost:4173`.
- Override with `ALLOWED_ORIGINS` (comma-separated). Use `CORS_ALLOW_ALL_ORIGINS=true` only for controlled debugging.

## Running locally

```bash
npm install
# Run with your platform's dev server (e.g., `vercel dev` or equivalent)
```

## Endpoint reference

- `GET /api` — Lists available routes.
- `GET /api/ping` — Health check returning `{ ok, service, ts }`.
- `GET /api/health` — Reports `{ ok, service, ts }` plus whether `N8N_WEBHOOK_URL` and `N8N_WEBHOOK_SECRET` are configured.
- `POST /api/chat` — Accepts chat payloads and forwards them 1:1 to n8n with `type: "chat"` and `timestamp` (ISO if missing). Returns the n8n response.
- `POST /api/event` — Accepts event payloads and forwards them 1:1 to n8n with `type: "event"` and `timestamp` (ISO if missing). Returns the n8n response.
- `POST /api/message` — Alias of `/api/chat`.

### Payload shapes

`POST /api/chat`

```json
{
  "type": "chat",
  "message": "...",
  "sessionId": "...",
  "meta": { "s": "...", "t": "...", "c": "..." },
  "timestamp": "<ISO_DATE>",
  "...": "additional fields pass through"
}
```

`POST /api/event`

```json
{
  "type": "event",
  "timestamp": "<ISO_DATE>",
  "sessionId": "...",
  "...": "original event fields (including QR metadata)"
}
```

The backend does not filter or interpret metadata; everything is forwarded to n8n with the shared secret header.
