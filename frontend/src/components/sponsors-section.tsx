import Image from "next/image";
import type { Sponsor } from "@/lib/types";

export function SponsorsSection({ sponsors }: { sponsors: Sponsor[] }) {
  if (sponsors.length === 0) return null;

  return (
    <section className="border-t border-border/60 py-16">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-primary">
          Our Sponsors
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10">
          {sponsors.map((sponsor) => {
            const logo = (
              <Image
                src={sponsor.logo_url}
                alt={sponsor.name}
                width={160}
                height={60}
                unoptimized
                className="h-10 w-auto opacity-90 transition-opacity hover:opacity-100"
              />
            );
            return sponsor.website_url ? (
              <a
                key={sponsor.id}
                href={sponsor.website_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {logo}
              </a>
            ) : (
              <span key={sponsor.id}>{logo}</span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
