import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { statusTone, toneBgSoft } from "@/lib/tone";

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", toneBgSoft[statusTone(status)], className)}
    >
      {status}
    </Badge>
  );
}
