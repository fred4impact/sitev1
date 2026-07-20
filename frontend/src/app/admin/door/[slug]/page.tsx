"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, ApiError } from "@/lib/api";
import type { Attendee } from "@/lib/types";

const ALL_TYPES = "all";

export default function DoorListPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { user, loading } = useAuth();
  const [attendees, setAttendees] = useState<Attendee[] | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(ALL_TYPES);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [rowMessage, setRowMessage] = useState<Record<string, string>>({});

  const canView = !!user && ["host", "admin"].includes(user.role);

  useEffect(() => {
    if (!canView) return;
    api.get<Attendee[]>(`/api/events/${slug}/attendees/`).then(setAttendees);
  }, [canView, slug]);

  const ticketTypeNames = useMemo(
    () => Array.from(new Set((attendees ?? []).map((a) => a.ticket_type_name))),
    [attendees]
  );

  const filtered = (attendees ?? []).filter((a) => {
    if (typeFilter !== ALL_TYPES && a.ticket_type_name !== typeFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.attendee_name.toLowerCase().includes(q) ||
      a.attendee_email.toLowerCase().includes(q) ||
      a.order_email.toLowerCase().includes(q)
    );
  });

  async function checkIn(qrToken: string) {
    setCheckingIn(qrToken);
    setRowMessage((prev) => ({ ...prev, [qrToken]: "" }));
    try {
      await api.post(`/api/tickets/${qrToken}/check-in/`);
      setAttendees(
        (prev) =>
          prev?.map((a) =>
            a.qr_token === qrToken
              ? { ...a, status: "used", checked_in_at: new Date().toISOString() }
              : a
          ) ?? null
      );
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as { detail?: string } | null;
        setRowMessage((prev) => ({ ...prev, [qrToken]: body?.detail ?? "Check-in failed." }));
      } else {
        setRowMessage((prev) => ({ ...prev, [qrToken]: "Check-in failed." }));
      }
    } finally {
      setCheckingIn(null);
    }
  }

  if (loading) return null;

  if (!canView) {
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
    <div className="mx-auto max-w-4xl px-6 py-24">
      <p className="text-sm uppercase tracking-[0.3em] text-primary">Door</p>
      <h1 className="mt-2 text-3xl">Guest List</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {attendees ? `${attendees.length} ticket(s) issued` : "Loading…"}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value ?? ALL_TYPES)}>
          <SelectTrigger>
            <SelectValue placeholder="All ticket types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TYPES}>All ticket types</SelectItem>
            {ticketTypeNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ticket</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((attendee) => (
              <TableRow key={attendee.qr_token}>
                <TableCell>{attendee.attendee_name || "—"}</TableCell>
                <TableCell>{attendee.attendee_email || attendee.order_email}</TableCell>
                <TableCell>{attendee.ticket_type_name}</TableCell>
                <TableCell>
                  {attendee.status === "used" ? (
                    <span className="text-primary">Checked in</span>
                  ) : attendee.status === "cancelled" ? (
                    <span className="text-destructive">Cancelled</span>
                  ) : (
                    <span className="text-muted-foreground">Valid</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {attendee.status === "valid" ? (
                    <Button
                      size="sm"
                      disabled={checkingIn === attendee.qr_token}
                      onClick={() => checkIn(attendee.qr_token)}
                    >
                      Check in
                    </Button>
                  ) : null}
                  {rowMessage[attendee.qr_token] && (
                    <p className="mt-1 text-xs text-destructive">
                      {rowMessage[attendee.qr_token]}
                    </p>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {attendees !== null && filtered.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">No matching attendees.</p>
        )}
      </div>

      <Link href="/admin/scanner" className="mt-10 inline-block text-sm text-primary hover:underline">
        Switch to QR scanner →
      </Link>
    </div>
  );
}
