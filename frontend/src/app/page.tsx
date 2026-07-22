import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SponsorsSection } from "@/components/sponsors-section";
import { serverFetch } from "@/lib/server-api";
import type { EventSummary, SiteSettings } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default async function Home() {
  const upcoming = await serverFetch<EventSummary[]>("/api/events/?when=upcoming");
  const nextEvent = upcoming?.[0] ?? null;
  const siteSettings = await serverFetch<SiteSettings>("/api/site-settings/");

  return (
    <div>
      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden">
        {nextEvent?.cover_image_url ? (
          <>
            <Image
              src={nextEvent.cover_image_url}
              alt=""
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
          </>
        ) : (
          <div className="jazz-gradient absolute inset-0" />
        )}

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-primary">
            Every Last Sunday of the Month
          </p>
          <h1 className="text-6xl leading-[0.95] text-white uppercase sm:text-7xl md:text-8xl">
            Afrocentric Jazz, Fusion &amp; Soulful Vibes.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Jazz91 was born out of a shared love for Afrocentric jazz, fusion,
            and soulful expression — a space to connect, unwind, and be
            inspired.
          </p>

          {nextEvent && (
            <Link
              href={`/events/${nextEvent.slug}`}
              className="group mt-2 inline-flex items-center gap-4 rounded-2xl border border-primary/40 bg-background/70 px-7 py-4 shadow-[0_0_40px_-10px] shadow-primary/30 backdrop-blur transition-all hover:border-primary hover:bg-background/90 hover:shadow-primary/50"
            >
              <span className="relative flex size-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-red-500" />
              </span>
              <span className="text-left">
                <span className="block text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                  Next Session
                </span>
                <span className="block font-heading text-2xl text-foreground sm:text-3xl">
                  {formatDate(nextEvent.start_at)}
                </span>
              </span>
              <span className="ml-2 text-primary transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <Button
              render={<Link href="/events" />}
              size="lg"
              className="rounded-none px-8 font-semibold tracking-[0.15em] uppercase"
            >
              Book your ticket
            </Button>
            <Button
              render={<Link href="/about" />}
              size="lg"
              variant="outline"
              className="rounded-none px-8 font-semibold tracking-[0.15em] uppercase"
            >
              Meet the band
            </Button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce text-primary/70">
          ↓
        </div>
      </section>

      <section className="border-t border-border/60 bg-card/40 py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-primary">
            Our Story
          </p>
          <h2 className="text-4xl uppercase sm:text-5xl">Where the rhythm leads</h2>
          <p className="mt-2 text-muted-foreground">
            We are a group of friends and music enthusiasts passionate about
            creating vibrant, community-driven experiences through live
            music.
          </p>
          <p className="text-muted-foreground">
            Every last Sunday of the month, we gather to celebrate music that
            uplifts the spirit and strengthens the community — one note, one
            story, and one moment at a time.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 text-center">
          <h2 className="text-4xl uppercase sm:text-5xl">No fixed walls, no boundaries.</h2>
          <p className="text-muted-foreground">
            Just sound, light, and the people who make it come alive.
          </p>
        </div>
      </section>

      <SponsorsSection sponsors={siteSettings?.sponsors ?? []} />
    </div>
  );
}
