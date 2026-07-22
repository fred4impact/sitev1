"""
Django settings for config project.
"""

from datetime import timedelta
from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DEBUG=(bool, False),
)
environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("DJANGO_SECRET_KEY", default="django-insecure-dev-only-change-me")

DEBUG = env.bool("DEBUG", default=True)

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])

# Railway (and most PaaS) terminate HTTPS at the edge and proxy to the app
# over plain HTTP, signalling the original scheme via X-Forwarded-Proto.
# Without this, request.is_secure() is always False, which breaks CSRF's
# origin check for the admin (and secure cookies generally).
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")


# Application definition

INSTALLED_APPS = [
    "jazzmin",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "cloudinary_storage",
    "django.contrib.staticfiles",
    "cloudinary",
    # third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    # songroom apps
    "users",
    "events",
    "venues",
    "artists",
    "tickets",
    "orders",
    "contact",
    "branding",
    "songs",
    "stories",
    "memberships",
    "comments",
    "notifications",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# Database
# Defaults to sqlite for local dev; set DATABASE_URL for Postgres.

DATABASES = {
    "default": env.db("DATABASE_URL", default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}")
}


AUTH_USER_MODEL = "users.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


STATIC_URL = "static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

# Railway's filesystem is ephemeral, so uploaded media doesn't survive a
# redeploy unless it's stored off-instance. Cloudinary is optional in local
# dev (falls back to the filesystem above) but should always be set in
# production.
CLOUDINARY_CLOUD_NAME = env("CLOUDINARY_CLOUD_NAME", default="")
CLOUDINARY_API_KEY = env("CLOUDINARY_API_KEY", default="")
CLOUDINARY_API_SECRET = env("CLOUDINARY_API_SECRET", default="")

if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
    CLOUDINARY_STORAGE = {
        "CLOUD_NAME": CLOUDINARY_CLOUD_NAME,
        "API_KEY": CLOUDINARY_API_KEY,
        "API_SECRET": CLOUDINARY_API_SECRET,
    }
    STORAGES["default"] = {"BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage"}

# Jazzmin's base.html references the bare "vendor/bootswatch" directory (not
# a real file) for its client-side theme-switcher JS. That can never have a
# collectstatic manifest entry, so strict manifest lookups crash with
# "Missing staticfiles manifest entry" on every admin page load. Relax to
# non-strict so WhiteNoise falls back to a plain URL for that one reference;
# real static files still get hashed, cache-busted URLs as normal.
WHITENOISE_MANIFEST_STRICT = False

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}


REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
}

CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS", default=["http://localhost:3000"]
)

CSRF_TRUSTED_ORIGINS = env.list(
    "CSRF_TRUSTED_ORIGINS", default=[]
)

FRONTEND_URL = env("FRONTEND_URL", default="http://localhost:3000")

# Stripe: if STRIPE_SECRET_KEY is unset, orders auto-complete without payment
# so the rest of the checkout/ticketing flow can be built and tested before
# real keys are available. Set both to switch on live payments.
STRIPE_SECRET_KEY = env("STRIPE_SECRET_KEY", default="")
STRIPE_PUBLISHABLE_KEY = env("STRIPE_PUBLISHABLE_KEY", default="")
STRIPE_WEBHOOK_SECRET = env("STRIPE_WEBHOOK_SECRET", default="")

# Resend: if RESEND_API_KEY is unset, confirmation emails are skipped (logged
# instead) so the order flow stays testable without real keys.
RESEND_API_KEY = env("RESEND_API_KEY", default="")
DEFAULT_FROM_EMAIL = env(
    "DEFAULT_FROM_EMAIL", default="Jazz91 <onboarding@resend.dev>"
)
CONTACT_EMAIL = env("CONTACT_EMAIL", default="info@jazz91lounge.art")

JAZZMIN_SETTINGS = {
    "site_title": "Jazz91 Admin",
    "site_header": "Jazz91",
    "site_brand": "Jazz91",
    "welcome_sign": "Welcome to the Jazz91 admin",
    "copyright": "Jazz91",
    "search_model": ["events.Event", "venues.Venue", "orders.Order"],
    "topmenu_links": [
        {"name": "View site", "url": FRONTEND_URL, "new_window": True},
    ],
    "order_with_respect_to": [
        "events",
        "artists",
        "venues",
        "tickets",
        "orders",
        "contact",
        "branding",
        "users",
        "songs",
        "stories",
        "memberships",
        "comments",
        "notifications",
        "auth",
    ],
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.Group": "fas fa-users",
        "users.User": "fas fa-user",
        "venues.Venue": "fas fa-map-marker-alt",
        "events.Event": "fas fa-calendar-alt",
        "events.TicketType": "fas fa-tags",
        "events.Waitlist": "fas fa-hourglass-half",
        "artists.Artist": "fas fa-music",
        "tickets.Ticket": "fas fa-ticket-alt",
        "orders.Order": "fas fa-receipt",
        "contact.ContactMessage": "fas fa-envelope",
        "branding.SiteSettings": "fas fa-image",
    },
    "hide_models": [],
}

JAZZMIN_UI_TWEAKS = {
    "theme": "lux",
    "default_theme_mode": "light",
    "navbar": "navbar-dark",
    "sidebar": "sidebar-dark-primary",
    "brand_colour": "navbar-dark",
    "accent": "accent-warning",
    "no_navbar_border": True,
}
