# Jazz91 — Feature Log

## Completed

### Public site
- Home — dynamic full-bleed banner (next upcoming event's photo, or a branded gradient fallback), bold "Next Session" callout with live-pulse indicator
- About — mission story + "Meet the Band": constant house-band roster (`is_house_band=true`) shown as full-bleed photo cards with expandable bios, separated from one-off per-event guest artists
- Events — Upcoming / Past tabs, centered responsive card grid, cover-image thumbnails
- Event detail —
  - Banner image, date/venue/price, lineup (expandable dropdown per artist: photo, role, bio, Instagram)
  - **Past events**: no ticket button — "Past session" badge instead, plus photo gallery slider ("From the night") and YouTube recap video ("Recap")
  - **Upcoming events**: same gallery/video slots relabeled "Sneak peek" / "Promo" and shown alongside the ticket CTA
- Contact — real form wired to the backend, emails the venue via Resend, logged to an admin inbox
- Auth — register/login (JWT)

### Ticketing & checkout
- Multiple ticket tiers per event (name, price, capacity, on-sale window)
- Free **Guest List** tier — skips Stripe entirely, can't be mixed with paid tiers in the same order
- Capacity-aware checkout: running total, color-coded tier accents, per-tier sold-out state
- Waitlist capture when an event/tier is sold out
- Stripe integration with a dev auto-complete fallback when no live keys are configured
- Ticket confirmation redesigned as proper ticket stubs (event/date/venue/tier + QR in a torn-edge card), not a bare QR image
- Per-ticket-type purchase cap: 10 per line item per order

### Door / admin tools
- Django admin (Jazzmin-themed, Jazz91-branded) — venues, events, ticket types, artists, orders, tickets, contact messages, site settings
- Image uploads with live preview: event banners, artist photos, event photo galleries, site logo
- Camera-based QR scanner (`/admin/scanner`, frontend) with manual-entry fallback
- Guest list / door list (`/admin/door`, frontend) — searchable attendee table, filter by ticket type, one-click check-in
- Role-gated to Host/Admin accounts

### Design system
- Bold, Jazz Cafe-inspired look: Anton display typeface, large uppercase headlines, sharp-cornered CTAs
- Wine-tinted near-black background, gold primary, wine/yellow/lime/red functional accent colors
- Dark-only theme, consistent across all pages

### Backend architecture
- Apps: `events`, `venues`, `artists`, `tickets`, `orders`, `users`, `contact`, `branding`
- All migrations additive since the initial build — no destructive resets once real data existed

### Docs
- `DEPLOYMENT.md` — Vercel + Railway recommendation, domain/DNS steps, env var reference, pre-launch checklist

---

## Suggested for next sprint

### Production readiness (do before going live on the real domain)
- [ ] Add `gunicorn` + `whitenoise`, switch off `manage.py runserver` for the deployed backend
- [ ] Move uploaded media (banners, photos, logo) off local disk to Cloudinary or S3-compatible storage — current setup won't survive a redeploy on most hosts
- [ ] Set live Stripe keys + register the production webhook endpoint
- [ ] Verify `jazz91lounge.art` as a sending domain in Resend
- [ ] `DEBUG=False` in production env

### Ticketing
- [ ] Promo / discount codes at checkout
- [ ] Configurable per-order ticket cap (currently 10 per tier, no combined order-wide limit)
- [ ] Apple Wallet / Google Wallet pass generation (bigger lift — needs Apple Developer certs + Google Wallet API setup)
- [ ] Email confirmation with a calendar (.ics) invite attached

### Content
- [ ] Clean up `is_house_band` flags on existing artists (flagged earlier — a few guest artists may still be marked as house band from before the default changed)
- [ ] Real logo upload (still a text wordmark fallback until one's uploaded)

### Out of original scope (stub pages exist, never built)
- [ ] Song Vault, Stories, Membership, Gallery — "coming soon" placeholders from the original spec, not part of this build
- [ ] Recurring-event engine (each month is currently a manually-created event, by design)

### Smaller polish
- [ ] Wire up members-only early booking, if Membership is ever built out
- [ ] Analytics dashboard beyond what Django admin already shows
