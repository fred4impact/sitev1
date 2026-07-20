"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { publicNavLinks } from "@/lib/nav-links";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";

const mid = Math.ceil(publicNavLinks.length / 2);
const leftLinks = publicNavLinks.slice(0, mid);
const rightLinks = publicNavLinks.slice(mid);

function AuthStatus() {
  const { user, loading, logout } = useAuth();

  if (loading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">
          Hi, <span className="text-foreground">{user.username}</span>
        </span>
        <button
          onClick={logout}
          className="text-muted-foreground transition-colors hover:text-primary"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/login" className="text-muted-foreground transition-colors hover:text-primary">
        Log in
      </Link>
      <Link href="/register" className="text-primary transition-colors hover:opacity-80">
        Sign up
      </Link>
    </div>
  );
}

export function SiteNav() {
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    api
      .get<SiteSettings>("/api/site-settings/")
      .then((data) => setLogoUrl(data.logo_url))
      .catch(() => {});
  }, []);

  return (
    <header className="border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl justify-end px-6 pt-2 text-xs">
        <AuthStatus />
      </div>
      <div className="mx-auto grid max-w-6xl grid-cols-3 items-center px-6 pb-4">
        <nav className="hidden justify-self-start gap-6 md:flex">
          {leftLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="col-start-2 flex items-center justify-self-center leading-none"
        >
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Jazz91"
              width={200}
              height={70}
              unoptimized
              className="h-9 w-auto"
            />
          ) : (
            <span className="font-heading text-2xl tracking-[0.15em] text-primary">Jazz91</span>
          )}
        </Link>

        <nav className="hidden justify-self-end gap-6 md:flex">
          {rightLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
