# Deploying Jazz91 to Production

This app is three pieces that need to go live separately:

| Piece | What it is | Where it lives now |
|---|---|---|
| **Frontend** | Next.js (App Router) | `frontend/` |
| **Backend API + admin** | Django + DRF | `backend/` |
| **Database** | PostgreSQL | `docker-compose.yml` (local only) |

Plus one thing that isn't wired up yet but matters for production: **uploaded images** (event banners, artist photos, gallery photos, site logo) currently save to local disk on the backend server. That works in Docker Compose but **will not survive a deploy or restart** on most hosting platforms. See [Media storage](#media-storage-fix-this-before-launch) — fix this before pointing your real domain at it.

---

## Recommended path: Vercel + Railway

For a single small-venue site like this, the simplest reliable combo is:

- **Frontend → [Vercel](https://vercel.com)** — built by the makers of Next.js, this app's framework already assumes it (see `sec.md`'s original tech spec). Zero-config: point it at the `frontend/` folder, it detects Next.js and handles builds, previews, and SSL automatically.
- **Backend + Database → [Railway](https://railway.app)** — one-click managed Postgres, persistent volumes for media, simple `git push` deploys, custom domains with automatic SSL. Render (below) is a very close second choice if you prefer it.

This pairing is cheap (both have usable free/low tiers for low traffic like a monthly event), requires the least ops knowledge, and each platform is excellent at exactly the one job you're giving it.

### Steps

**1. Push to GitHub** (if not already) — both platforms deploy from a git repo.

**2. Backend on Railway:**
1. New Project → Deploy from GitHub repo → select this repo, set the **root directory to `backend/`**.
2. Add a **PostgreSQL** plugin (Railway → New → Database → PostgreSQL). It auto-injects a `DATABASE_URL` env var into your backend service — matches what `config/settings.py` already expects via `django-environ`.
3. Add a **volume** mounted at `/app/media` (Railway → your backend service → Settings → Volumes) so uploaded images persist across deploys. This is a stopgap — see [Media storage](#media-storage-fix-this-before-launch) for the real fix.
4. Set the environment variables listed in [Environment variables](#environment-variables) below.
5. Railway needs a production start command — see [Before you deploy](#before-you-deploy-required-code-changes), you must add `gunicorn` first.
6. Deploy. Railway gives you a `*.up.railway.app` URL — confirm `https://<that-url>/api/events/` returns `[]` before moving on.

**3. Frontend on Vercel:**
1. New Project → import the same GitHub repo → set **root directory to `frontend/`**. Vercel auto-detects Next.js.
2. Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (see below) in Vercel's Environment Variables panel.
3. Deploy. Vercel gives you a `*.vercel.app` URL to sanity-check before the domain switch.

**4. Connect your domain** — see [Custom domain](#custom-domain) below.

---

## Before you deploy: required code changes

The Dockerfiles in this repo (`backend/Dockerfile`, `frontend/Dockerfile`) run **development servers** (`manage.py runserver`, `npm run dev`) — fine for local Docker Compose, not safe or performant for real traffic. Before going live:

1. **Add a production WSGI server to the backend.**
   ```
   # backend/requirements.txt
   gunicorn==23.0.0
   whitenoise==6.8.2
   ```
   `whitenoise` serves Django admin/Jazzmin static assets without needing a separate nginx — add it to `MIDDLEWARE` in `config/settings.py` (right after `SecurityMiddleware`) and set (Django 6.0's `STORAGES` setting, not the older `STATICFILES_STORAGE` which was removed in this version):
   ```python
   STORAGES = {
       "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
       "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
   }
   ```
   Then the platform's start command becomes:
   ```
   python manage.py collectstatic --noinput && python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
   ```
   (Railway/Render let you set this as the service's "Start Command" — no Dockerfile edit strictly required, but update `backend/Dockerfile`'s `CMD` too if you deploy it as-is elsewhere.)

2. **Frontend build step.** Vercel handles this natively (ignores the Dockerfile, runs `next build` + `next start` itself) — no change needed if you deploy via Vercel proper. If you instead containerize the frontend for Railway/Fly/etc., change `frontend/Dockerfile`'s `CMD` to `npm run build && npm run start`.

3. **`DEBUG=False`** in production env vars — `config/settings.py` already reads this from env (`DEBUG = env.bool("DEBUG", default=True)`), just make sure you explicitly set `DEBUG=False` wherever you deploy.

I can implement all three of these for you when you're ready — just ask.

---

## Media storage: fix this before launch

Right now `MEDIA_ROOT`/`MEDIA_URL` point at local disk (`backend/media/`). A Railway/Render volume (mentioned above) is a workable stopgap, but the original tech spec (`sec.md`) already calls for **Cloudinary** for storage, and it's genuinely the easier long-term fix for an image-heavy site like this — free tier is generous, it handles resizing/optimization for you (useful for the banner/gallery images), and it decouples images from wherever the backend happens to be running.

To switch: add `django-cloudinary-storage` + `cloudinary` to `requirements.txt`, set `DEFAULT_FILE_STORAGE` to Cloudinary's backend, and add your Cloudinary API credentials as env vars. This is a ~30 minute change — ask when you're ready and I'll wire it up. Any S3-compatible bucket (AWS S3, DigitalOcean Spaces, Backblaze B2) works too via `django-storages` if you'd rather not use Cloudinary.

---

## Custom domain

Assuming your domain (e.g. `jazz91lounge.art`) is registered elsewhere (Namecheap, GoDaddy, Cloudflare Registrar, etc.) — you're pointing DNS records at Vercel and Railway, not moving the domain itself.

**Frontend — apex + www:**
1. Vercel project → Settings → Domains → add `jazz91lounge.art` and `www.jazz91lounge.art`.
2. Vercel shows you the exact records to add. Typically:
   - `jazz91lounge.art` → `A` record → `76.76.21.21` (Vercel's anycast IP — Vercel will show the current value)
   - `www.jazz91lounge.art` → `CNAME` → `cname.vercel-dns.com`
3. Add those in your registrar's DNS panel. SSL certificates are issued automatically once DNS propagates (usually minutes, sometimes up to ~24h).

**Backend — API subdomain:**
1. Railway project → your backend service → Settings → Domains → add `api.jazz91lounge.art`.
2. Railway shows you a `CNAME` target — add `api.jazz91lounge.art` → `CNAME` → `<that-target>.up.railway.app` in your registrar's DNS panel.
3. SSL is automatic here too.

**Then update env vars to match the real domain** (see table below) and redeploy both services — `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `FRONTEND_URL`, and `NEXT_PUBLIC_API_URL` all currently default to `localhost`.

---

## Environment variables

### Backend (Railway/Render/etc.)

| Variable | Production value | Notes |
|---|---|---|
| `DJANGO_SECRET_KEY` | a long random string | generate with `python -c "import secrets; print(secrets.token_urlsafe(50))"` |
| `DEBUG` | `False` | |
| `ALLOWED_HOSTS` | `api.jazz91lounge.art` | comma-separated if multiple |
| `CORS_ALLOWED_ORIGINS` | `https://jazz91lounge.art,https://www.jazz91lounge.art` | must be the frontend's real origin(s) |
| `FRONTEND_URL` | `https://jazz91lounge.art` | used in Jazzmin's "View site" link and email templates |
| `DATABASE_URL` | auto-set by Railway/Render Postgres plugin | `postgres://user:pass@host:port/db` |
| `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` | live Stripe keys | from the Stripe dashboard — leave blank only if you want checkout to stay in dev auto-complete mode |
| `RESEND_API_KEY` | your Resend key | leave blank to skip real emails (logged instead) |
| `DEFAULT_FROM_EMAIL` | `Jazz91 <info@jazz91lounge.art>` | requires verifying `jazz91lounge.art` as a sending domain in Resend first, or emails will fail to send from it |
| `CONTACT_EMAIL` | `info@jazz91lounge.art` | where the contact form notifies |

### Frontend (Vercel)

| Variable | Production value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.jazz91lounge.art` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | your Stripe publishable key |

---

## Alternative platforms

Vercel is close to a default choice for the frontend regardless of backend host — skip straight to the backend row that fits you.

| Option | Good for | Trade-off |
|---|---|---|
| **Railway** (recommended) | Simplest Postgres + persistent volume + custom domain, minimal config | Usage-based pricing can creep with traffic |
| **Render** | Nearly identical to Railway — managed Postgres, persistent disks, free tier exists | Free tier services sleep after inactivity (slow first request) |
| **Fly.io** | Docker-native, can run close to users globally, generous free allowance | More manual config (fly.toml, volumes, Postgres cluster setup) |
| **DigitalOcean App Platform** | Managed Postgres + app hosting in one dashboard, predictable flat pricing | Slightly more setup than Railway/Render |
| **Self-hosted Kubernetes** (already scaffolded in `deployment/`) | Full control, you already have working ArgoCD manifests for this app | You're now responsible for cluster ops, upgrades, TLS renewal, backups — real overhead for a single monthly event site |

The `deployment/` folder already has a working local `kind` + ArgoCD setup (see `deployment/README.md`) — it's built for local development/testing of the Kubernetes path, not a production cluster, but the manifests under `deployment/apps/` are a real starting point if you later want to self-host on a managed Kubernetes service (DigitalOcean Kubernetes, GKE, EKS) instead of Vercel/Railway. That's considerably more operational work and only worth it if you specifically want that control — not something to reach for on day one.

---

## Post-deploy checklist

- [ ] `https://api.jazz91lounge.art/api/events/` returns `[]` or your real events (not a 500 error)
- [ ] `https://jazz91lounge.art` loads and successfully fetches events (check browser console for CORS errors — means `CORS_ALLOWED_ORIGINS` is wrong)
- [ ] Create a real superuser: `python manage.py createsuperuser` (via Railway/Render's shell/console feature)
- [ ] Log into `/admin/`, confirm image uploads work and persist after a redeploy (this is the media storage check — see above)
- [ ] Register the Stripe webhook endpoint (`https://api.jazz91lounge.art/api/stripe/webhook/`) in the Stripe dashboard, copy the signing secret into `STRIPE_WEBHOOK_SECRET`
- [ ] Verify `jazz91lounge.art` as a sending domain in Resend (Resend dashboard → Domains) so `DEFAULT_FROM_EMAIL`/`CONTACT_EMAIL` actually deliver
- [ ] Run a real checkout end-to-end with a Stripe test card, confirm the QR ticket email arrives
- [ ] Set `DEBUG=False` and double check it took effect (visit a broken URL — you should see a plain 404, not Django's debug traceback page)
