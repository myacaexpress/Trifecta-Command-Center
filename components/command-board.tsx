"use client";

import * as React from "react";
import { CalendarClock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import { priorityTone, toneBgSoft } from "@/lib/tone";
import type { Card as TCard, Lane } from "@/lib/types";

const lanes: Lane[] = ["Needs Attention", "Ready", "Waiting", "Done"];

export function CommandBoard({ cards }: { cards: TCard[] }) {
  const areas = React.useMemo(
    () => ["All Areas", ...Array.from(new Set(cards.map((c) => c.area)))],
    [cards],
  );
  const [area, setArea] = React.useState("All Areas");
  const visible =
    area === "All Areas" ? cards : cards.filter((c) => c.area === area);
  const grouped = lanes.map((lane) => ({
    lane,
    cards: visible.filter((c) => c.lane === lane),
  }));

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Command Board</CardTitle>
            <CardDescription>
              Cards move through the board; completed licensing becomes history,
              not clutter.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {visible.length} items
          </Badge>
        </div>
        <Tabs value={area} onValueChange={setArea}>
          <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
            {areas.map((a) => (
              <TabsTrigger
                key={a}
                value={a}
                className="rounded-full border bg-background data-[state=active]:border-primary"
              >
                {a}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {grouped.map(({ lane, cards: laneCards }) => (
            <div key={lane} className="rounded-lg border bg-muted/30 p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">{lane}</p>
                <Badge variant="secondary">{laneCards.length}</Badge>
              </div>
              <div className="space-y-3">
                {laneCards.length ? (
                  laneCards.map((card) => <TaskCard key={card.id} card={card} />)
                ) : (
                  <p className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
                    No cards
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TaskCard({ card }: { card: TCard }) {
  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Badge
          variant="outline"
          className={cn("border-transparent", toneBgSoft[priorityTone(card.priority)])}
        >
          {card.priority}
        </Badge>
        <span className="text-xs text-muted-foreground">{card.area}</span>
      </div>
      <p className="text-sm font-medium">{card.title}</p>
      <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
        {card.body}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <StatusBadge status={card.status} />
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
          {card.owner}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <CalendarClock className="h-3 w-3" />
        {card.due}
      </div>
    </div>
  );
}
