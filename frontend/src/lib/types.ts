export type Sponsor = {
  id: number;
  name: string;
  logo_url: string;
  website_url: string;
};

export type SiteSettings = {
  logo_url: string;
  sponsors: Sponsor[];
};

export type Venue = {
  id: number;
  name: string;
  slug: string;
  address: string;
  city: string;
  capacity: number;
  description: string;
  image_url: string;
};

export type Artist = {
  id: number;
  name: string;
  slug: string;
  role: string;
  bio: string;
  photo_url: string;
  instagram_handle: string;
};

export type LineupEntry = {
  artist: Artist;
  role_override: string;
  is_featured: boolean;
  sort_order: number;
};

export type TicketType = {
  id: number;
  name: string;
  description: string;
  price: string;
  currency: string;
  capacity: number;
  is_guest_list: boolean;
  is_free: boolean;
  sales_start: string | null;
  sales_end: string | null;
  is_on_sale: boolean;
  spots_remaining: number | null;
  is_sold_out: boolean;
  sort_order: number;
};

export type EventSummary = {
  id: number;
  title: string;
  slug: string;
  venue: Venue;
  start_at: string;
  end_at: string | null;
  min_price: string | null;
  currency: string;
  cover_image_url: string;
  is_sold_out: boolean;
  is_past: boolean;
};

export type EventPhoto = {
  id: number;
  image_url: string;
  caption: string;
  sort_order: number;
};

export type EventDetail = EventSummary & {
  description: string;
  ticket_types: TicketType[];
  lineup: LineupEntry[];
  photos: EventPhoto[];
  video_url: string;
  tickets_sold: number;
};

export type Ticket = {
  qr_token: string;
  event_title: string;
  ticket_type_name: string;
  attendee_name: string;
  attendee_email: string;
  status: "valid" | "used" | "cancelled";
  checked_in_at: string | null;
  qr_url: string;
};

export type Attendee = {
  qr_token: string;
  attendee_name: string;
  attendee_email: string;
  order_email: string;
  ticket_type_name: string;
  status: "valid" | "used" | "cancelled";
  checked_in_at: string | null;
};

export type OrderItem = {
  ticket_type: number;
  ticket_type_name: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
};

export type Order = {
  public_id: string;
  event: EventSummary;
  email: string;
  items: OrderItem[];
  total_amount: string;
  currency: string;
  status: "pending" | "paid" | "cancelled" | "refunded";
  tickets: Ticket[];
  created_at: string;
};

export type CreateOrderRequest = {
  event: string;
  email: string;
  items: { ticket_type: number; quantity: number }[];
};

export type CreateOrderResponse = {
  order: Order;
  client_secret: string | null;
  stripe_configured: boolean;
};
