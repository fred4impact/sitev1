"use client";

import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function CoreValueCard({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <Card className="border-border/60 bg-background/60 py-0">
      <Collapsible>
        <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 px-4 py-4 text-left">
          <span className="font-heading text-base text-foreground">{name}</span>
          <Plus className="size-4 shrink-0 text-primary transition-transform duration-200 group-data-[panel-open]:rotate-45" />
        </CollapsibleTrigger>
        <CollapsibleContent className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-[starting-style]:h-0 data-[ending-style]:h-0">
          <p className="px-4 pb-4 text-sm text-muted-foreground">{description}</p>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
