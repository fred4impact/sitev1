import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineupItem } from "@/components/lineup-item";
import { PhotoSlider } from "@/components/photo-slider";
import { serverFetch } from "@/lib/server-api";
import { getYouTubeEmbedUrl } from "@/lib/utils";
import type { EventDetail } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await serverFetch<EventDetail>(`/api/events/${slug}/`);

  if (!event) notFound();

  const embedUrl = getYouTubeEmbedUrl(event.video_url);

  return (
    <div>
      <div className="relative aspect-[21/9] w-full overflow-hidden sm:aspect-[3/1]">
        {event.cover_image_url ? (
          <Image
            src={event.cover_image_url}
            alt={event.title}
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center"
          />
        ) : (
          <div className="jazz-gradient absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      <div className="mx-auto max-w-3xl px-6 pt-4 pb-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-primary">
          {formatDate(event.start_at)}
        </p>
        <h1 className="mt-2 text-5xl text-white uppercase leading-[0.95] sm:text-6xl">
          {event.title}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {event.venue.name}
          {event.venue.city ? `, ${event.venue.city}` : ""}
          {event.venue.address ? ` — ${event.venue.address}` : ""}
        </p>

        {event.is_past ? (
          <div className="mt-6">
            <Badge variant="outline" className="border-border/60 text-muted-foreground">
              Past session
            </Badge>
          </div>
        ) : (
          <>
            <div className="mt-6 flex items-center justify-center gap-3">
              {event.is_sold_out && (
                <Badge variant="outline" className="border-red-500/50 text-red-400">
                  Sold out
                </Badge>
              )}
              <span className="text-muted-foreground">
                {event.min_price === null
                  ? "Free"
                  : `Tickets from ${event.currency} ${event.min_price}`}
              </span>
            </div>

            {event.is_sold_out ? (
              <Button
                render={<Link href={`/events/${event.slug}/waitlist`} />}
                className="mt-8 rounded-none px-8 font-semibold tracking-[0.15em] uppercase"
                size="lg"
              >
                Join the waitlist
              </Button>
            ) : (
              <Button
                render={<Link href={`/events/${event.slug}/checkout`} />}
                className="mt-8 rounded-none px-8 font-semibold tracking-[0.15em] uppercase"
                size="lg"
              >
                Book tickets
              </Button>
            )}
          </>
        )}

        {event.description && (
          <p className="mt-10 whitespace-pre-line text-left text-muted-foreground">
            {event.description}
          </p>
        )}

        {event.photos.length > 0 && (
          <div className="mt-16 text-left">
            <p className="text-center text-sm uppercase tracking-[0.3em] text-primary">
              Gallery
            </p>
            <h2 className="mt-2 mb-6 text-center text-2xl">
              {event.is_past ? "From the night" : "Sneak peek"}
            </h2>
            <PhotoSlider photos={event.photos} />
          </div>
        )}

        {embedUrl && (
          <div className="mt-16 text-left">
            <p className="text-center text-sm uppercase tracking-[0.3em] text-primary">
              {event.is_past ? "Recap" : "Promo"}
            </p>
            <h2 className="mt-2 mb-6 text-center text-2xl">
              {event.is_past ? "Watch the session" : "Watch the trailer"}
            </h2>
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                src={embedUrl}
                title={`${event.title} video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        )}

        {event.lineup.length > 0 && (
          <div className="mt-16 text-left">
            <p className="text-center text-sm uppercase tracking-[0.3em] text-primary">
              Lineup
            </p>
            <h2 className="mt-2 text-center text-2xl">Who&apos;s playing</h2>
            <div className="mt-8 border-t border-border/60">
              {event.lineup.map((entry) => (
                <LineupItem key={entry.artist.id} entry={entry} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
