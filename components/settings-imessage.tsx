import { MessageSquareText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * The iMessage bridge requires local macOS Messages access and cannot run in
 * the hosted web app. It is rendered here as a disabled preview of the planned
 * Phase-2 local companion.
 */
export function SettingsImessage() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4" />
              iMessage Bridge
            </CardTitle>
            <CardDescription>
              Founders text Hermes in the group chat and get the same answers as
              the board.
            </CardDescription>
          </div>
          <Badge variant="outline" className="shrink-0 border-tone-amber/40 text-tone-amber">
            Phase 2
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Chat GUID
          </label>
          <Input placeholder="iMessage group chat GUID" disabled />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Allowed sender handles
          </label>
          <Input placeholder="+15555555555, email@example.com" disabled />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" disabled>
            Recent Chats
          </Button>
          <Button variant="secondary" size="sm" disabled>
            Poll Once
          </Button>
          <Button size="sm" disabled>
            Save
          </Button>
        </div>
        <p className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          Requires a Mac-local companion with Full Disk Access to read the
          Messages database. Replies stay off by default. Coming in a later
          phase — this hosted dashboard is the shared, always-on surface.
        </p>
      </CardContent>
    </Card>
  );
}
