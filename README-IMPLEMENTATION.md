# Implementation & Manual Testing

Use these steps to validate the backend updates for `infinium-chat-api`.

## Environment

- `N8N_WEBHOOK_URL` — required. Destination for `/api/chat` and `/api/event` payloads.
- `N8N_WEBHOOK_SECRET` — required. Sent as `x-infinium-secret` when forwarding to n8n.
- `ALLOWED_ORIGINS` — optional. Defaults to `https://infinium.services` plus localhost ports `3000/5173/4173`.
- `CORS_ALLOW_ALL_ORIGINS` — optional. Set to `true` only for debugging to allow `*`.

## Healthchecks

1. `GET /api/ping`
   ```bash
   curl -i https://your-deployment-url/api/ping
   ```
   Expect HTTP 200 and JSON with `ok: true`, `service`, and `ts`.

2. `GET /api/health`
   ```bash
   curl -i https://your-deployment-url/api/health
   ```
   Expect HTTP 200 and JSON `{ ok: true, service: "infinium-chat-api", n8n: { webhookUrlConfigured, webhookSecretConfigured }, ts: "<ISOString>" }`.

## Chat endpoint (`POST /api/chat`)

1. Forwarding test:
   ```bash
   curl -i \
     -H "Content-Type: application/json" \
     -d '{"message":"Hola","sessionId":"demo-session","meta":{"s":"demo"},"timestamp":"2024-01-01T00:00:00.000Z"}' \
     https://your-deployment-url/api/chat
   ```
   Expect HTTP 200 if n8n responds 200. The response body should mirror what n8n returns.

2. Rate limiting (optional): send >20 requests within 60 seconds using the same `sessionId` to receive HTTP 429.

## Event endpoint (`POST /api/event`)

1. Forwarding test:
   ```bash
   curl -i \
     -H "Content-Type: application/json" \
     -d '{"event":"chat_message_sent","sessionId":"demo-session","meta":{"utm_source":"demo"},"timestamp":"2024-01-01T00:00:00.000Z","page":"https://example.com"}' \
     https://your-deployment-url/api/event
   ```
   Expect HTTP status mirroring the n8n response.

2. Error handling: unset `N8N_WEBHOOK_URL` or `N8N_WEBHOOK_SECRET` and confirm the API returns HTTP 500 with an error message indicating the missing value.

## Notes

- Payloads are forwarded 1:1 with `type` enforced (`chat` or `event`) and `timestamp` defaulted to `new Date().toISOString()` when missing.
- Metadata is never filtered or interpreted; QR or campaign fields pass through untouched.
- CORS responds based on `ALLOWED_ORIGINS` (or `*` when `CORS_ALLOW_ALL_ORIGINS=true`).
