import Image from "next/image";
import type { EventSummary, Ticket } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TicketStub({ ticket, event }: { ticket: Ticket; event: EventSummary }) {
  return (
    <div className="overflow-hidden rounded-xl border border-primary/30 bg-card">
      <div className="space-y-1 px-5 pt-5 pb-4 text-center">
        <p className="font-heading text-lg text-white uppercase">{event.title}</p>
        <p className="text-xs text-muted-foreground">
          {formatDate(event.start_at)} &middot; {event.venue.name}
        </p>
        {ticket.ticket_type_name && (
          <p className="text-sm text-primary">{ticket.ticket_type_name}</p>
        )}
      </div>

      <div className="relative border-t border-dashed border-border">
        <span className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full bg-background" />
        <span className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full bg-background" />
      </div>

      <div className="flex flex-col items-center gap-2 px-5 pt-4 pb-5">
        <Image
          src={ticket.qr_url}
          alt="Ticket QR code"
          width={150}
          height={150}
          unoptimized
          className="rounded-md bg-white p-2"
        />
        <p className="text-xs text-muted-foreground">
          Ticket #{ticket.qr_token.slice(0, 8)} &middot; scan at the door
        </p>
      </div>
    </div>
  );
}
