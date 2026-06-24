import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { MessageEvent } from "@/lib/types";

export function CommandAudit({ events }: { events: MessageEvent[] }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Command Audit</CardTitle>
        <CardDescription>
          Web and iMessage commands are recorded locally.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {events.length ? (
          <div className="max-h-[22rem] space-y-3 overflow-y-auto pr-1">
            {events.slice(0, 12).map((event, index) => (
              <div key={event.id}>
                {index > 0 && <Separator className="mb-3" />}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="uppercase">
                    {event.channel}
                  </Badge>
                  <p className="truncate text-sm font-medium">{event.text}</p>
                </div>
                {event.response && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {event.response}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            No command events yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
