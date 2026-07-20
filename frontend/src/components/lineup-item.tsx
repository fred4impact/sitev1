"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { LineupEntry } from "@/lib/types";

function ArtistAvatar({ name, photoUrl }: { name: string; photoUrl: string }) {
  if (photoUrl) {
    return (
      <div className="relative size-11 shrink-0 overflow-hidden rounded-full">
        <Image src={photoUrl} alt={name} fill unoptimized className="object-cover" />
      </div>
    );
  }
  return (
    <div className="jazz-gradient flex size-11 shrink-0 items-center justify-center rounded-full">
      <span className="font-heading text-sm text-white">{name.charAt(0)}</span>
    </div>
  );
}

export function LineupItem({ entry }: { entry: LineupEntry }) {
  const role = entry.role_override || entry.artist.role;
  const expandable = Boolean(entry.artist.bio || entry.artist.instagram_handle);

  if (!expandable) {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-border/60 py-5">
        <div className="flex items-center gap-4">
          <ArtistAvatar name={entry.artist.name} photoUrl={entry.artist.photo_url} />
          <span className="font-heading text-xl uppercase tracking-wide text-foreground sm:text-2xl">
            {entry.artist.name}
          </span>
        </div>
        {role && <span className="text-sm text-primary">{role}</span>}
      </div>
    );
  }

  return (
    <Collapsible className="border-b border-border/60">
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 py-5 text-left">
        <div className="flex items-center gap-4">
          <ArtistAvatar name={entry.artist.name} photoUrl={entry.artist.photo_url} />
          <span>
            <span className="block font-heading text-xl uppercase tracking-wide text-foreground transition-colors group-hover:text-primary sm:text-2xl">
              {entry.artist.name}
            </span>
            {role && <span className="mt-1 block text-sm text-primary">{role}</span>}
          </span>
        </div>
        <Plus className="size-5 shrink-0 text-primary transition-transform duration-200 group-data-[panel-open]:rotate-45" />
      </CollapsibleTrigger>
      <CollapsibleContent className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-[starting-style]:h-0 data-[ending-style]:h-0">
        <div className="max-w-2xl space-y-2 pb-5 pl-[3.75rem]">
          {entry.artist.bio && (
            <p className="text-sm text-muted-foreground">{entry.artist.bio}</p>
          )}
          {entry.artist.instagram_handle && (
            <a
              href={`https://instagram.com/${entry.artist.instagram_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-primary transition-colors hover:opacity-80"
            >
              @{entry.artist.instagram_handle}
            </a>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
