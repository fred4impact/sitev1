import { Button } from "@/components/ui/button";
import type { TicketType } from "@/lib/types";

function formatPrice(ticketType: TicketType) {
  if (ticketType.is_free) return "Free";
  return `${ticketType.currency} ${Number(ticketType.price).toFixed(2)}`;
}

export type TierAccent = "yellow" | "lime" | "white";

const accentDot: Record<TierAccent, string> = {
  yellow: "bg-yellow-400",
  lime: "bg-lime-400",
  white: "bg-white",
};

const accentBorder: Record<TierAccent, string> = {
  yellow: "border-l-yellow-400",
  lime: "border-l-lime-400",
  white: "border-l-white",
};

export function TicketTypeStepper({
  ticketType,
  quantity,
  onChange,
  disabled,
  maxQuantity,
  accent,
}: {
  ticketType: TicketType;
  quantity: number;
  onChange: (quantity: number) => void;
  disabled: boolean;
  maxQuantity: number;
  accent: TierAccent;
}) {
  const unavailable = ticketType.is_sold_out || !ticketType.is_on_sale;

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-lg border border-l-4 border-border/60 bg-card px-4 py-3 ${accentBorder[accent]}`}
    >
      <div>
        <p className="flex items-center gap-2 font-medium">
          <span className={`size-2 shrink-0 rounded-full ${accentDot[accent]}`} />
          {ticketType.name}
        </p>
        {ticketType.description && (
          <p className="text-sm text-muted-foreground">{ticketType.description}</p>
        )}
        <p className="mt-1 text-sm text-primary">{formatPrice(ticketType)}</p>
        {unavailable && (
          <p className="mt-1 text-xs text-red-400">
            {ticketType.is_sold_out ? "Sold out" : "Not currently on sale"}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={disabled || unavailable || quantity <= 0}
          onClick={() => onChange(Math.max(0, quantity - 1))}
        >
          −
        </Button>
        <span className="w-6 text-center tabular-nums">{quantity}</span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={disabled || unavailable || quantity >= maxQuantity}
          onClick={() => onChange(Math.min(maxQuantity, quantity + 1))}
        >
          +
        </Button>
      </div>
    </div>
  );
}
