# Deployment Guide

## Environment variables

Set these variables in your deployment platform:

| Variable | Description | Example |
| --- | --- | --- |
| `OPENAI_API_KEY` | API key for OpenAI chat completions. | `sk-xxxx` |
| `N8N_WEBHOOK_URL` | Full URL for forwarding `/api/event` payloads to n8n. | `https://n8n.example.com/webhook/abc123` |
| `PORT` (if applicable) | Port for local development servers. Some platforms set this automatically. | `3000` |

### CORS
- Allowed origin: `https://infinium.services`
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

- `POST /api/chat` — Forwards messages to OpenAI. Requires `OPENAI_API_KEY`.
- `GET /api/ping` — Health-style check that returns `{ ok: true }`.
- `POST /api/event` — Forwards request body to `N8N_WEBHOOK_URL` and relays response.
