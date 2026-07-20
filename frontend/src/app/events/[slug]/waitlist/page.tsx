"use client";

import { use, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { formatApiError } from "@/lib/format-api-error";

export default function WaitlistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post(`/api/events/${slug}/waitlist/`, { name, email });
      setSubmitted(true);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">You&apos;re on the list</p>
        <h1 className="mt-2 text-3xl">We&apos;ll email you</h1>
        <p className="mt-4 text-muted-foreground">
          If a spot opens up for this session, we&apos;ll let you know first.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-24">
      <p className="text-sm uppercase tracking-[0.3em] text-primary">Sold out</p>
      <h1 className="mt-2 text-3xl">Join the Waitlist</h1>
      <p className="mt-4 text-muted-foreground">
        Leave your details and we&apos;ll reach out if a spot frees up.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
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

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Joining…" : "Join waitlist"}
        </Button>
      </form>
    </div>
  );
}
