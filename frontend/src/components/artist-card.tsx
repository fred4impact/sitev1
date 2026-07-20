"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Artist } from "@/lib/types";

function splitBio(bio: string) {
  if (!bio) return { summary: "", rest: "" };
  const match = bio.match(/^([\s\S]*?[.!?])\s+([\s\S]*)$/);
  if (!match) return { summary: bio, rest: "" };
  return { summary: match[1], rest: match[2] };
}

export function ArtistCard({ artist }: { artist: Artist }) {
  const { summary, rest } = splitBio(artist.bio);
  const expandable = Boolean(rest || artist.instagram_handle);

  return (
    <Card className="overflow-hidden border-border/60 pt-0">
      <div className="relative aspect-[4/5] w-full">
        {artist.photo_url ? (
          <Image
            src={artist.photo_url}
            alt={artist.name}
            fill
            unoptimized
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover object-center"
          />
        ) : (
          <div className="jazz-gradient flex h-full w-full items-center justify-center">
            <span className="font-heading text-5xl text-white">{artist.name.charAt(0)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <CardHeader>
        <CardTitle className="text-xl uppercase">{artist.name}</CardTitle>
        {artist.role && <p className="text-sm text-primary">{artist.role}</p>}
      </CardHeader>

      <CardContent>
        {summary && <p className="text-sm text-muted-foreground">{summary}</p>}

        {expandable ? (
          <Collapsible>
            <CollapsibleTrigger className="group mt-2 flex items-center gap-1.5 text-sm text-primary">
              <Plus className="size-3.5 transition-transform duration-200 group-data-[panel-open]:rotate-45" />
              Read more
            </CollapsibleTrigger>
            <CollapsibleContent className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-[starting-style]:h-0 data-[ending-style]:h-0">
              <div className="space-y-2 pt-2">
                {rest && <p className="text-sm text-muted-foreground">{rest}</p>}
                {artist.instagram_handle && (
                  <a
                    href={`https://instagram.com/${artist.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-primary transition-colors hover:opacity-80"
                  >
                    @{artist.instagram_handle}
                  </a>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : null}
      </CardContent>
    </Card>
  );
}
