# Soulseek Web UI

A polished, responsive web interface for a compatible Soulseek backend such as slskd. It does not implement the Soulseek protocol in the browser.

## Features

- Desktop-grade search, filters, result tables, queue controls, and transfer monitoring.
- Responsive navigation, persistent player shell, accessible controls, and dark neutral visual system.
- Server-side API boundary and a clearly labelled demo mode for frontend development.
- Strict TypeScript, Zod input validation, security headers, and focused tests.

## Screenshots

Run the project locally to view the interface. Add project screenshots here when publishing.

## Architecture

React UI calls Next route handlers; route handlers call `src/lib/soulseek/client.ts`. `src/lib/soulseek/gateway.ts` defines the narrow `SoulseekGateway` contract an approved adapter implements. The included `SlskdGateway` implements slskd REST searches, transfers, user browse/info, and server status. Gateway responses are parsed and bounded before entering the UI. Credentials must remain server-side.

## Requirements

Node.js 18.17+ and a Soulseek-compatible backend for live network activity.

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment variables

`SOULSEEK_USERNAME`, `SOULSEEK_PASSWORD`, `SOULSEEK_PORT`, `SOULSEEK_API_URL`, and `SOULSEEK_API_TOKEN` are server-only configuration inputs. `SOULSEEK_ALLOWED_API_ORIGINS` permits specific HTTPS gateway origins entered through setup. `CONFIG_ENCRYPTION_KEY` must be a 32-byte base64 key to enable the per-session encrypted, HTTP-only configuration cookie. Set `NEXT_PUBLIC_DEMO_MODE=true` for the explicit demo interface. Do not commit real credentials.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

## Deployment

### Render

The included `render.yaml` defines a free Render Web Service using `npm ci && npm run build` and `npm run start` with Node 22.14.0. Create the service from the public GitHub repository, then set the following server-side Render environment variables in the dashboard: `SOULSEEK_USERNAME`, `SOULSEEK_PASSWORD`, `SOULSEEK_PORT`, `SOULSEEK_API_URL`, `SOULSEEK_API_TOKEN`, `SOULSEEK_ALLOWED_API_ORIGINS`, and `CONFIG_ENCRYPTION_KEY`. Set `NEXT_PUBLIC_DEMO_MODE=false`.

Generate `CONFIG_ENCRYPTION_KEY` outside source control as a base64-encoded 32-byte random value. The application has no filesystem persistence requirement, so a Render restart only ends encrypted setup-cookie sessions; it does not lose persistent app data.

### Vercel (optional)

Vercel remains supported by `vercel.json`. Configure the same environment values in Vercel. Vercel serverless deployments do not provide persistent encrypted user-secret storage by themselves: use a secured external database or secret manager for user-configured credentials.

Configure a compatible slskd service separately. Keep the base URL in `SOULSEEK_API_URL`; do not accept it from an untrusted browser request, which would create an SSRF risk.

## Authentication and session model

The setup endpoint validates fields and places them in an AES-256-GCM encrypted, HTTP-only, same-site session cookie. It expires after eight hours. The browser cannot read the cookie or any credential field. `POST /api/auth/logout` removes it. This is suitable for a single-user deployment; multi-user or durable configuration needs an external encrypted secrets store and an identity provider.

## Project structure

`src/app` contains pages and routes; `src/components` contains UI; `src/lib/soulseek` isolates backend integration; `src/lib/validation` defines input schemas; `tests` covers critical validation.

## Troubleshooting

If live operations are unavailable, confirm the gateway URL, credentials, port, CORS policy, and gateway health. Demo mode intentionally never represents a live connection.

## Roadmap

Implement a specific gateway adapter, secure persistent sessions, real-time transfer events, and browser stream endpoints.

## Contributing

Open an issue or pull request with a focused change and passing checks.

## License

MIT. See [LICENSE](LICENSE).
