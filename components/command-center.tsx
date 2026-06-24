"use client";

import * as React from "react";
import { Menu, Plus, RefreshCw, Search, Send } from "lucide-react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { MetricGrid } from "@/components/metric-grid";
import { LicensingTable } from "@/components/licensing-table";
import { CommandBoard } from "@/components/command-board";
import { SourceReceipts } from "@/components/source-receipts";
import { CommandAudit } from "@/components/command-audit";
import { SettingsImessage } from "@/components/settings-imessage";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type {
  AppState,
  CommandResult,
  LicensingStep,
  StatusSnapshot,
} from "@/lib/types";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(payload?.error ?? `${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function CommandCenter({ initialState }: { initialState: AppState }) {
  const [state, setState] = React.useState(initialState);
  const [command, setCommand] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [mobileNav, setMobileNav] = React.useState(false);

  async function submitCommand(event?: React.FormEvent) {
    event?.preventDefault();
    const text = command.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      const result = await api<CommandResult>("/api/command", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      setState(result.state);
      setCommand("");
      toast.success("Hermes", { description: result.response });
    } catch (error) {
      toast.error("Hermes failed", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setBusy(false);
    }
  }

  async function runJob(kind: "proton-dfs" | "reagan-uhc") {
    if (busy) return;
    setBusy(true);
    try {
      const result = await api<CommandResult>(`/api/jobs/${kind}`, {
        method: "POST",
      });
      setState(result.state);
      toast.success("Source updated", { description: result.response });
    } catch (error) {
      toast.error("Job failed", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setBusy(false);
    }
  }

  function onMetricAction(metric: StatusSnapshot) {
    setCommand(
      metric.title.includes("UHC")
        ? "check Reagan UHC status"
        : "show licensing status",
    );
  }

  function onViewSource(step: LicensingStep) {
    setCommand(`sources for ${step.step}`);
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto flex max-w-[100rem] lg:gap-6 lg:p-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 rounded-xl border bg-background p-4 lg:block">
          <AppSidebar />
        </aside>

        <main className="min-w-0 flex-1 space-y-6 p-4 lg:p-0">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Sheet open={mobileNav} onOpenChange={setMobileNav}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Open navigation"
                  >
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <div className="mt-6 h-full">
                    <AppSidebar onNavigate={() => setMobileNav(false)} />
                  </div>
                </SheetContent>
              </Sheet>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  Command Center
                </h1>
                <p className="text-sm text-muted-foreground">
                  LLC, licensing, banking, and carrier readiness.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <form
                onSubmit={submitCommand}
                className="relative flex-1 lg:w-72"
              >
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={command}
                  onChange={(event) => setCommand(event.target.value)}
                  placeholder="Ask Hermes"
                  aria-label="Ask Hermes"
                  className="pl-9"
                />
              </form>
              <Button
                size="icon"
                onClick={() => submitCommand()}
                disabled={busy}
                aria-label="Send Hermes command"
              >
                <Send />
              </Button>
              <Button
                variant="outline"
                onClick={() => runJob("proton-dfs")}
                disabled={busy}
                className="hidden sm:inline-flex"
              >
                <RefreshCw />
                Add Source
              </Button>
              <Button
                onClick={() => setCommand("create card for ")}
                className="hidden sm:inline-flex"
              >
                <Plus />
                New Card
              </Button>
              <ThemeToggle />
            </div>
          </header>

          <MetricGrid metrics={state.metrics} onAction={onMetricAction} />

          <CommandBoard cards={state.cards} />

          <LicensingTable
            steps={state.licensingSteps}
            onViewSource={onViewSource}
            onViewAll={() => setCommand("show licensing status")}
          />

          <SourceReceipts
            receipts={state.receipts}
            onCheckReagan={() => runJob("reagan-uhc")}
            busy={busy}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <CommandAudit events={state.messageEvents} />
            <SettingsImessage />
          </div>
        </main>
      </div>
    </div>
  );
}
