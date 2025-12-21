# Implementation & Manual Testing

Use these steps to validate the backend updates for `infinium-chat-api`.

## Environment

- `OPENAI_API_KEY` — required for `/api/chat` POST.
- `N8N_WEBHOOK_URL` — optional. If set, `/api/event` forwards payloads to this URL; otherwise, it only logs and returns `{ ok: true }`.
- `CORS_ALLOW_ALL_ORIGINS` — optional. Set to `true` only for debugging; otherwise CORS allows `https://infinium.services` plus localhost ports 3000/5173/4173.

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
   Expect HTTP 200 and JSON `{ ok: true, service: "infinium-chat-api", ts: "<ISOString>" }`.

3. `GET /api/chat` (health)
   ```bash
   curl -i https://your-deployment-url/api/chat
   ```
   Expect HTTP 200 and JSON `{ ok: true, note: "Use POST to chat" }`.

## Chat endpoint (`POST /api/chat`)

1. Basic chat:
   ```bash
   curl -i \
     -H "Content-Type: application/json" \
     -d '{"message":"Hola","sessionId":"demo-session","meta":{"utm_source":"demo","utm_campaign":"winter"}}' \
     https://your-deployment-url/api/chat
   ```
   Expect HTTP 200 and JSON `{ reply, actions, sessionId: "demo-session" }`.

2. Actions for purchase intent:
   ```bash
   curl -s \
     -H "Content-Type: application/json" \
     -d '{"message":"Quiero comprar Infinium","sessionId":"demo-session"}' \
     https://your-deployment-url/api/chat | jq .
   ```
   Expect `actions` to include:
   - `Comprar ahora` (vitalhealthglobal URL)
   - `WhatsApp` (wa.me link)

3. Actions for join intent:
   ```bash
   curl -s \
     -H "Content-Type: application/json" \
     -d '{"message":"Quiero unirme al equipo","sessionId":"demo-session"}' \
     https://your-deployment-url/api/chat | jq .
   ```
   Expect `actions` to include:
   - `Unirme` (opportunity URL)
   - `WhatsApp`

## Event endpoint (`POST /api/event`)

1. Logging-only mode (no `N8N_WEBHOOK_URL`):
   ```bash
   curl -i \
     -H "Content-Type: application/json" \
     -d '{"eventName":"chat_message_sent","sessionId":"demo-session","meta":{"utm_source":"demo"},"page":"https://example.com","ts":"2024-01-01T00:00:00.000Z"}' \
     https://your-deployment-url/api/event
   ```
   Expect HTTP 200 and JSON `{ ok: true }`. Verify server logs contain the event payload.

2. Forwarding mode (`N8N_WEBHOOK_URL` set):
   - Set `N8N_WEBHOOK_URL` to your webhook endpoint.
   - Repeat the request above.
   - Expect HTTP 200 with `{ ok: true, status, data }` echoing the webhook response (or a non-200 status if the webhook fails).
