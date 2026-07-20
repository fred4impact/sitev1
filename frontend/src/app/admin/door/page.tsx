"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import type { EventSummary } from "@/lib/types";

export default function DoorListIndexPage() {
  const { user, loading } = useAuth();
  const [events, setEvents] = useState<EventSummary[] | null>(null);

  useEffect(() => {
    if (!user || !["host", "admin"].includes(user.role)) return;
    api.get<EventSummary[]>("/api/events/?when=upcoming").then(setEvents);
  }, [user]);

  if (loading) return null;

  if (!user || !["host", "admin"].includes(user.role)) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-3xl">Door Staff Only</h1>
        <p className="mt-4 text-muted-foreground">
          You need a Host or Administrator account to view the door list.
        </p>
        <Link href="/login" className="mt-6 inline-block text-primary hover:underline">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <p className="text-sm uppercase tracking-[0.3em] text-primary">Door</p>
      <h1 className="mt-2 text-3xl">Guest List</h1>
      <p className="mt-4 text-muted-foreground">
        Pick an upcoming session to view its attendee list and check guests
        in.
      </p>

      <div className="mt-10 space-y-3">
        {events === null ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : events.length === 0 ? (
          <p className="text-muted-foreground">No upcoming sessions.</p>
        ) : (
          events.map((event) => (
            <Link
              key={event.id}
              href={`/admin/door/${event.slug}`}
              className="block rounded-lg border border-border/60 px-4 py-3 transition-colors hover:border-primary/40"
            >
              <p className="font-medium">{event.title}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(event.start_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </Link>
          ))
        )}
      </div>

      <Link href="/admin/scanner" className="mt-10 inline-block text-sm text-primary hover:underline">
        Switch to QR scanner →
      </Link>
    </div>
  );
}
