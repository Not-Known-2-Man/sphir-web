# SphirWeb

Vue 3 frontend for the Sphir local API.

## Requirements

- Node 18+
- Sphir API running at `http://localhost:3000`

## Setup

```bash
npm install && npm run dev
```

App runs at **http://localhost:5173**

> If `npm` isn't found, add Node to your PATH first:
> ```bash
> export PATH="/opt/homebrew/opt/node@26/bin:$PATH"
> ```

All `/api` requests are proxied to `http://localhost:3000` by Vite, so no CORS issues.

## Pages

| Route | Page |
|-------|------|
| `/login` | Sign in (email + password) |
| `/` | Dashboard — collection grid |
| `/c/:id` | Collection detail — cards list |

## API endpoints used

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/v1/auth/sign_in` | Authenticate |
| `GET` | `/api/v1/folders` | List collections |
| `GET` | `/api/v1/users/get_businesses` | List all cards |

Auth token is stored in `localStorage` (`sphir_token` + `sphir_uid`) and sent as `Authorization: Bearer <token>` + `uid: <uid>` on every authenticated request.

## Internationalization (i18n)

SphirWeb supports English and Spanish:
- Default language is detected from browser preferences (any `es*` defaults to Spanish, otherwise English).
- User selection (via the visible EN / ES selector in the header, settings, and login) takes effect immediately and is remembered in `localStorage`.
- English is the source and fallback for missing keys.
- User and AI created card content (titles, descriptions, tags, notes, collection names) is never translated, while card types, labels, dates, and UI controls are translated.
- Unit tests run with `npm test` (`node --test`), verifying locale detection rules and key parity between English and Spanish dictionaries.
