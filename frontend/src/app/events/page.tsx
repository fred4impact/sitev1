import { EventsTabs } from "@/components/events-tabs";
import { serverFetch } from "@/lib/server-api";
import type { EventSummary } from "@/lib/types";

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([
    serverFetch<EventSummary[]>("/api/events/?when=upcoming"),
    serverFetch<EventSummary[]>("/api/events/?when=past"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-24 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-primary">Events</p>
      <h1 className="mt-2 text-4xl">Jazz91 Sessions</h1>
      <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
        Every last Sunday of the month — book your ticket or catch up on
        sessions gone by.
      </p>

      <EventsTabs upcoming={upcoming ?? []} past={past ?? []} />
    </div>
  );
}
