import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/checkout-form";
import { serverFetch } from "@/lib/server-api";
import type { EventDetail } from "@/lib/types";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await serverFetch<EventDetail>(`/api/events/${slug}/`);

  if (!event) notFound();

  return (
    <div className="mx-auto max-w-xl px-6 py-24">
      <p className="text-sm uppercase tracking-[0.3em] text-primary">Checkout</p>
      <h1 className="mt-2 text-3xl">{event.title}</h1>
      <p className="mt-2 text-muted-foreground">
        {event.venue.name}
        {event.venue.city ? `, ${event.venue.city}` : ""}
      </p>

      <div className="mt-10">
        <CheckoutForm event={event} />
      </div>
    </div>
  );
}
