"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCameraScanner } from "@/components/qr-camera-scanner";

type CheckInResult = {
  detail: string;
  ticket: {
    event_title: string;
    attendee_email: string;
    status: string;
    checked_in_at: string | null;
  };
};

export default function ScannerPage() {
  const { user, loading } = useAuth();
  const [token, setToken] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function checkIn(qrToken: string) {
    setSubmitting(true);
    setResult(null);
    try {
      const res = await api.post<CheckInResult>(`/api/tickets/${qrToken.trim()}/check-in/`);
      setResult({ ok: true, message: `${res.detail} (${res.ticket.attendee_email})` });
      setToken("");
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as { detail?: string } | null;
        setResult({ ok: false, message: body?.detail ?? "Check-in failed." });
      } else {
        setResult({ ok: false, message: "Check-in failed." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleManualSubmit(e: FormEvent) {
    e.preventDefault();
    checkIn(token);
  }

  if (loading) return null;

  if (!user || !["host", "admin"].includes(user.role)) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-3xl">Door Staff Only</h1>
        <p className="mt-4 text-muted-foreground">
          You need a Host or Administrator account to use the scanner.
        </p>
        <Link href="/login" className="mt-6 inline-block text-primary hover:underline">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-24">
      <p className="text-sm uppercase tracking-[0.3em] text-primary">Door</p>
      <h1 className="mt-2 text-3xl">Ticket Scanner</h1>
      <p className="mt-4 text-muted-foreground">
        Point the camera at a guest&apos;s ticket QR code to check them in.
      </p>

      <div className="mt-8">
        <QrCameraScanner onScan={checkIn} active={!submitting} />
      </div>

      {result && (
        <p className={`mt-6 text-sm ${result.ok ? "text-primary" : "text-destructive"}`}>
          {result.message}
        </p>
      )}

      <details className="mt-10 text-sm text-muted-foreground">
        <summary className="cursor-pointer text-primary">
          Camera not working? Enter the code manually
        </summary>
        <form onSubmit={handleManualSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">QR token</Label>
            <Input
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="e.g. d1b77731-faa3-441d-880f-6896a23ab586"
              required
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Checking in…" : "Check in"}
          </Button>
        </form>
      </details>

      <Link href="/admin/door" className="mt-10 inline-block text-sm text-primary hover:underline">
        Switch to guest list →
      </Link>
    </div>
  );
}
