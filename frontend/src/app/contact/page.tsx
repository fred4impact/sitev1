"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { formatApiError } from "@/lib/format-api-error";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/api/contact/", { name, email, message });
      setSubmitted(true);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <p className="text-sm uppercase tracking-[0.3em] text-primary">Contact</p>
      <h1 className="mt-2 text-4xl">Get in Touch</h1>
      <p className="mt-4 text-muted-foreground">
        We&apos;d love to hear from you! Whether you&apos;re a music lover,
        artist, venue, or brand partner, Jazz91 is all about connection,
        collaboration, and community.
      </p>
      <p className="mt-4 text-muted-foreground">
        Email us directly at{" "}
        <a
          href="mailto:info@jazz91lounge.art"
          className="text-primary transition-colors hover:opacity-80"
        >
          info@jazz91lounge.art
        </a>
        .
      </p>

      {submitted ? (
        <p className="mt-10 text-primary">
          Thanks for reaching out — we&apos;ll get back to you soon.
        </p>
      ) : (
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
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
              className="w-full rounded-md border border-input bg-input/20 px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Sending…" : "Send message"}
          </Button>
        </form>
      )}
    </div>
  );
}
