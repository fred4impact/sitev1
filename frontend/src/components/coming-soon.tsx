import { Badge } from "@/components/ui/badge";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-32 text-center">
      <Badge variant="outline" className="border-primary/40 text-primary">
        Coming soon
      </Badge>
      <h1 className="text-4xl">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
