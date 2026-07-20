"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TicketTypeStepper, type TierAccent } from "@/components/ticket-type-stepper";
import { api, ApiError } from "@/lib/api";
import { formatApiError } from "@/lib/format-api-error";
import { getStripe } from "@/lib/stripe";
import type { CreateOrderResponse, EventDetail } from "@/lib/types";

function PaymentStep({
  clientSecret,
  publicId,
}: {
  clientSecret: string;
  publicId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
      return;
    }

    try {
      await api.post(`/api/orders/${publicId}/confirm/`);
      router.push(`/orders/${publicId}/confirmation`);
    } catch (err) {
      setError(formatApiError(err));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={!stripe || submitting} className="w-full" size="lg">
        {submitting ? "Processing…" : "Pay now"}
      </Button>
    </form>
  );
}

export function CheckoutForm({ event }: { event: EventDetail }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderResponse, setOrderResponse] = useState<CreateOrderResponse | null>(null);

  const stripePromise = useMemo(() => getStripe(), []);

  const ticketTypesById = useMemo(
    () => new Map(event.ticket_types.map((tt) => [tt.id, tt])),
    [event.ticket_types]
  );

  const selectedItems = Object.entries(quantities)
    .map(([id, quantity]) => ({ ticketType: ticketTypesById.get(Number(id)), quantity }))
    .filter((item) => item.quantity > 0 && item.ticketType);

  const hasGuestListSelected = selectedItems.some((item) => item.ticketType!.is_guest_list);
  const hasOtherSelected = selectedItems.some((item) => !item.ticketType!.is_guest_list);
  const total = selectedItems.reduce(
    (sum, item) => sum + Number(item.ticketType!.price) * item.quantity,
    0
  );

  function setQuantity(ticketType: EventDetail["ticket_types"][number], quantity: number) {
    setQuantities((prev) => {
      const next = { ...prev, [ticketType.id]: quantity };
      if (quantity === 0) return next;

      // Guest list can't be combined with other ticket types — selecting one
      // clears the other, mirroring the backend's validation rule.
      if (ticketType.is_guest_list) {
        for (const tt of event.ticket_types) {
          if (tt.id !== ticketType.id) next[tt.id] = 0;
        }
      } else {
        for (const tt of event.ticket_types) {
          if (tt.is_guest_list) next[tt.id] = 0;
        }
      }
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.post<CreateOrderResponse>("/api/orders/", {
        event: event.slug,
        email,
        items: selectedItems.map((item) => ({
          ticket_type: item.ticketType!.id,
          quantity: item.quantity,
        })),
      });
      if (!res.stripe_configured) {
        router.push(`/orders/${res.order.public_id}/confirmation`);
        return;
      }
      setOrderResponse(res);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("That sold out while you were booking.");
      } else {
        setError(formatApiError(err));
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (orderResponse?.client_secret) {
    if (!stripePromise) {
      return (
        <p className="text-sm text-destructive">
          Stripe is not configured on this deployment yet — payments can&apos;t
          be collected right now.
        </p>
      );
    }
    return (
      <Elements stripe={stripePromise} options={{ clientSecret: orderResponse.client_secret }}>
        <PaymentStep
          clientSecret={orderResponse.client_secret}
          publicId={orderResponse.order.public_id}
        />
      </Elements>
    );
  }

  if (event.is_sold_out) {
    return (
      <p className="text-muted-foreground">
        This session is sold out. Join the waitlist from the event page and
        we&apos;ll email you if a spot opens up.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        {event.ticket_types.map((ticketType, index) => {
          const currentQuantity = quantities[ticketType.id] ?? 0;
          const blockedByMixingRule =
            (ticketType.is_guest_list && hasOtherSelected) ||
            (!ticketType.is_guest_list && hasGuestListSelected);
          const maxQuantity = blockedByMixingRule
            ? currentQuantity
            : Math.min(10, ticketType.spots_remaining ?? 10);
          const accent: TierAccent = ticketType.is_guest_list
            ? "white"
            : index % 2 === 0
              ? "yellow"
              : "lime";
          return (
            <TicketTypeStepper
              key={ticketType.id}
              ticketType={ticketType}
              quantity={quantities[ticketType.id] ?? 0}
              onChange={(q) => setQuantity(ticketType, q)}
              disabled={submitting}
              maxQuantity={maxQuantity}
              accent={accent}
            />
          );
        })}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between border-t border-border/60 pt-4 text-sm">
        <span className="text-muted-foreground">
          {selectedItems.reduce((n, item) => n + item.quantity, 0)} ticket
          {selectedItems.reduce((n, item) => n + item.quantity, 0) === 1 ? "" : "s"}
        </span>
        <span className="font-medium">
          {total === 0 ? "Free" : `${event.currency} ${total.toFixed(2)}`}
        </span>
      </div>

      <Button
        type="submit"
        disabled={submitting || selectedItems.length === 0 || !email}
        className="w-full"
        size="lg"
      >
        {submitting
          ? "Booking…"
          : total === 0
            ? "Reserve your spot"
            : `Book now — ${event.currency} ${total.toFixed(2)}`}
      </Button>
    </form>
  );
}
