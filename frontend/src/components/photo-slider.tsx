"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { EventPhoto } from "@/lib/types";

export function PhotoSlider({ photos }: { photos: EventPhoto[] }) {
  const [index, setIndex] = useState(0);

  if (photos.length === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIndex((i) => (i + 1) % photos.length);
  const current = photos[index];

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-card">
        <Image
          key={current.id}
          src={current.image_url}
          alt={current.caption || "Event photo"}
          fill
          unoptimized
          sizes="(min-width: 768px) 48rem, 100vw"
          className="object-cover object-center"
        />

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur transition-colors hover:bg-background/90"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur transition-colors hover:bg-background/90"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {current.caption && (
          <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent px-4 pt-8 pb-3 text-sm text-muted-foreground">
            {current.caption}
          </p>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to photo ${i + 1}`}
              className={`size-2 rounded-full transition-colors ${
                i === index ? "bg-primary" : "bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
