import { Banknote, ChevronRight, Flag, ShieldCheck, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toneBgSoft, toneText } from "@/lib/tone";
import type { StatusSnapshot } from "@/lib/types";

const icons = { shield: ShieldCheck, users: Users, bank: Banknote, flag: Flag };

function iconFor(key: string) {
  return icons[key as keyof typeof icons] ?? ShieldCheck;
}

export function MetricGrid({
  metrics,
  onAction,
}: {
  metrics: StatusSnapshot[];
  onAction: (metric: StatusSnapshot) => void;
}) {
  return (
    <section
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Status summary"
    >
      {metrics.map((metric) => {
        const Icon = iconFor(metric.iconKey);
        return (
          <Card key={metric.id} className="p-5">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  toneBgSoft[metric.tone],
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {metric.title}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-lg font-semibold",
                    toneText[metric.tone],
                  )}
                >
                  {metric.status}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {metric.detail}
                </p>
                <button
                  type="button"
                  onClick={() => onAction(metric)}
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  {metric.action}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </section>
  );
}
