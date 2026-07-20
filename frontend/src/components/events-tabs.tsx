"use client";

import { EventCard } from "@/components/event-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EventSummary } from "@/lib/types";

function EventGrid({ events, emptyMessage }: { events: EventSummary[]; emptyMessage: string }) {
  if (events.length === 0) {
    return <p className="mt-12 text-muted-foreground">{emptyMessage}</p>;
  }
  return (
    <div className="mt-8 flex flex-wrap justify-center gap-6 text-left">
      {events.map((event) => (
        <div key={event.id} className="w-full sm:w-[26rem]">
          <EventCard event={event} />
        </div>
      ))}
    </div>
  );
}

export function EventsTabs({
  upcoming,
  past,
}: {
  upcoming: EventSummary[];
  past: EventSummary[];
}) {
  return (
    <Tabs defaultValue="upcoming" className="mt-12">
      <TabsList className="mx-auto">
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="past">Past</TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming">
        <EventGrid events={upcoming} emptyMessage="No sessions on sale yet — check back soon." />
      </TabsContent>
      <TabsContent value="past">
        <EventGrid events={past} emptyMessage="No past sessions yet." />
      </TabsContent>
    </Tabs>
  );
}
