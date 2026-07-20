# Jazz91

Live-music events platform for Jazz91's recurring monthly session. See `sec.md` for the product spec.


## Structure

- `backend/` — Django + Django REST Framework API
- `frontend/` — Next.js (App Router, TypeScript, Tailwind, shadcn/ui)

## Local development (Docker)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API + admin: http://localhost:8000 / http://localhost:8000/admin/
- Postgres: localhost:5432 (db: `songroom`, user/password: `songroom`)

Create a Django superuser once the containers are up:

```bash
docker compose exec backend python manage.py createsuperuser
```

## Local development (without Docker)

### Backend

```bash
cd backend
source .venv/bin/activate
python manage.py migrate
python manage.py runserver
```

API runs at http://localhost:8000, admin at http://localhost:8000/admin/.
Defaults to a local sqlite database; set `DATABASE_URL` in `backend/.env` to
point at Postgres instead (see `backend/.env.example`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Site runs at http://localhost:3000.


URL: http://localhost:8000/admin/
Username: admin
Password: Jazz91Admin123!

## API Reference

Base URL: `http://localhost:8000`. Endpoints under `/api/` return JSON unless noted.

### Auth — `/api/auth/`

| Method | URL | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register/` | — | Create an account. Body: `{username, email, password}` |
| POST | `/api/auth/login/` | — | Obtain JWT pair. Body: `{username, password}` → `{access, refresh}` |
| POST | `/api/auth/refresh/` | — | Refresh an access token. Body: `{refresh}` → `{access}` |
| GET | `/api/auth/me/` | Bearer token | Current user's profile |
| PATCH | `/api/auth/me/` | Bearer token | Update `bio` / `avatar_url` |

### Events, Ticket Types & Venues — `/api/`

| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/api/events/?when=upcoming\|past` | — | List published events, optionally filtered by date |
| GET | `/api/events/{slug}/` | — | Event detail: description, `ticket_types[]`, `lineup[]`, `min_price`, `tickets_sold` |
| POST | `/api/events/{slug}/waitlist/` | — | Join the waitlist. Body: `{name, email, phone?}` |
| GET | `/api/events/{slug}/attendees/` | Bearer token, Host/Admin role | Door list: all tickets for the event, `?search=` filters by name/email |
| GET | `/api/venues/` | — | List venues |
| GET | `/api/venues/{slug}/` | — | Venue detail |
| GET | `/api/artists/` | — | List the artist/band roster |
| GET | `/api/artists/{slug}/` | — | Artist detail |

### Orders / Checkout — `/api/orders/`

| Method | URL | Auth | Description |
|---|---|---|---|
| POST | `/api/orders/` | — | Create an order. Body: `{event (slug), email, items: [{ticket_type, quantity}]}` → `{order, client_secret, stripe_configured}` |
| GET | `/api/orders/{public_id}/` | — | Order detail, including its `items[]` and `tickets` |
| POST | `/api/orders/{public_id}/confirm/` | — | Confirm payment after the client-side Stripe step completes |

If `STRIPE_SECRET_KEY` isn't set, or the order total is `0` (e.g. a guest-list ticket type), `POST /api/orders/` auto-completes the order (no payment) so the flow is testable without live keys. Guest-list ticket types (`is_guest_list: true`) can't be combined with other ticket types in the same order.

### Tickets — `/api/tickets/`

| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/api/tickets/{qr_token}/qr/` | — | Ticket QR code as a PNG image |
| POST | `/api/tickets/{qr_token}/check-in/` | Bearer token, Host/Admin role | Mark a ticket used; rejects re-scans |

### Payments

| Method | URL | Auth | Description |
|---|---|---|---|
| POST | `/api/stripe/webhook/` | Stripe signature | Stripe webhook receiver — not for manual/browser use |

### Admin

| URL | Description |
|---|---|
| `/admin/` | Django Admin (Jazzmin-themed) — manage venues, events, ticket types, artists, orders, tickets, users |
| `/admin/scanner` | Door staff: check in a ticket by QR token (Host/Admin only) |
| `/admin/door` | Door staff: browse upcoming sessions' guest lists and check attendees in by name/email (Host/Admin only) |
