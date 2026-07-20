import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { TicketStub } from "@/components/ticket-stub";
import { serverFetch } from "@/lib/server-api";
import type { Order } from "@/lib/types";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const order = await serverFetch<Order>(`/api/orders/${publicId}/`);

  if (!order) notFound();

  const isPaid = order.status === "paid";

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <p className="text-sm uppercase tracking-[0.3em] text-primary">
        {isPaid ? "Booking confirmed" : "Booking pending"}
      </p>
      <h1 className="mt-2 text-4xl">{order.event.title}</h1>
      <p className="mt-2 text-muted-foreground">
        {order.event.venue.name}
        {order.event.venue.city ? `, ${order.event.venue.city}` : ""}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Badge
          variant="outline"
          className={
            isPaid
              ? "border-primary/40 text-primary"
              : "border-muted-foreground/40 text-muted-foreground"
          }
        >
          {order.status}
        </Badge>
        <span className="text-muted-foreground">
          Confirmation sent to {order.email}
        </span>
      </div>

      {order.items.length > 0 && (
        <div className="mt-8 space-y-1 border-t border-border/60 pt-6">
          {order.items.map((item) => (
            <div
              key={item.ticket_type}
              className="flex items-center justify-between text-sm text-muted-foreground"
            >
              <span>
                {item.quantity}× {item.ticket_type_name}
              </span>
              <span>
                {Number(item.subtotal) === 0
                  ? "Free"
                  : `${order.currency} ${item.subtotal}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {isPaid ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {order.tickets.map((ticket) => (
            <TicketStub key={ticket.qr_token} ticket={ticket} event={order.event} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-muted-foreground">
          We&apos;re still confirming your payment. Refresh this page in a
          moment, or check your email for an update.
        </p>
      )}
    </div>
  );
}
