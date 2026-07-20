import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EventSummary } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function EventCard({ event }: { event: EventSummary }) {
  return (
    <Link href={`/events/${event.slug}`}>
      <Card className="h-full overflow-hidden border-border/60 pt-0 transition-colors hover:border-primary/40">
        <div className="relative aspect-video w-full">
          {event.cover_image_url ? (
            <Image
              src={event.cover_image_url}
              alt={event.title}
              fill
              unoptimized
              sizes="(min-width: 640px) 26rem, 100vw"
              className="object-cover object-center"
            />
          ) : (
            <div className="jazz-gradient absolute inset-0" />
          )}
        </div>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-xl">{event.title}</CardTitle>
            {event.is_sold_out && (
              <Badge variant="outline" className="border-red-500/50 text-red-400">
                Sold out
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {formatDate(event.start_at)} &middot; {event.venue.name}
            {event.venue.city ? `, ${event.venue.city}` : ""}
          </p>
          <p className="text-muted-foreground">
            {event.min_price === null
              ? "Free"
              : `From ${event.currency} ${event.min_price}`}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
