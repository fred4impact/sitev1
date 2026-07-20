"use client";

import { useEffect, useRef, useState } from "react";

const ELEMENT_ID = "qr-camera-reader";

export function QrCameraScanner({
  onScan,
  active,
}: {
  onScan: (token: string) => void;
  active: boolean;
}) {
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const lastScanRef = useRef<{ token: string; at: number } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    let cancelled = false;

    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (cancelled) return;
      const scanner = new Html5Qrcode(ELEMENT_ID, { verbose: false });
      scannerRef.current = scanner;

      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            const now = Date.now();
            const last = lastScanRef.current;
            // Suppress re-firing on the same code while it's still in frame.
            if (last && last.token === decodedText && now - last.at < 3000) return;
            lastScanRef.current = { token: decodedText, at: now };
            onScan(decodedText);
          },
          () => {
            // Per-frame "no QR code found" — expected constantly, ignore.
          }
        )
        .then(() => setStarting(false))
        .catch((err: Error) => {
          setStarting(false);
          setCameraError(
            "Couldn't access the camera — check permissions, or use manual entry below."
          );
          console.error(err);
        });
    });

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-card">
      <div
        id={ELEMENT_ID}
        className={`w-full [&_video]:!w-full [&_video]:object-cover ${active ? "" : "opacity-40"}`}
      />
      {starting && (
        <p className="p-4 text-center text-sm text-muted-foreground">Starting camera…</p>
      )}
      {cameraError && (
        <p className="p-4 text-center text-sm text-destructive">{cameraError}</p>
      )}
    </div>
  );
}
