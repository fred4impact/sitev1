"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";

export function SiteFooter() {
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    api
      .get<SiteSettings>("/api/site-settings/")
      .then((data) => setLogoUrl(data.logo_url))
      .catch(() => {});
  }, []);

  return (
    <footer className="border-t border-border/60 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 text-center text-sm text-muted-foreground">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt="Jazz91"
            width={200}
            height={70}
            unoptimized
            className="h-8 w-auto opacity-90"
          />
        ) : (
          <span className="font-heading text-xl tracking-wide text-primary">Jazz91</span>
        )}
        <p>Every Last Sunday of the Month</p>
        <p>
          <a href="mailto:info@jazz91lounge.art" className="transition-colors hover:text-primary">
            info@jazz91lounge.art
          </a>
        </p>
        <p>&copy; {new Date().getFullYear()} Jazz91. All rights reserved.</p>
      </div>
    </footer>
  );
}
