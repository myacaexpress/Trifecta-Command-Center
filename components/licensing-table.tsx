import { AlertTriangle, Check, ChevronRight, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import { statusTone, toneText } from "@/lib/tone";
import type { LicensingStep, Status } from "@/lib/types";

function StepDot({ status }: { status: Status }) {
  if (status === "Complete") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-tone-green/15 text-tone-green">
        <Check className="h-3 w-3" />
      </span>
    );
  }
  if (status === "Blocked") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-tone-red/15 text-tone-red">
        <AlertTriangle className="h-3 w-3" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "ml-1 h-2.5 w-2.5 rounded-full",
        `bg-current ${toneText[statusTone(status)]}`,
      )}
    />
  );
}

export function LicensingTable({
  steps,
  onViewSource,
  onViewAll,
}: {
  steps: LicensingStep[];
  onViewSource: (step: LicensingStep) => void;
  onViewAll: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Licensing Status</CardTitle>
        <CardDescription>
          Current formation path to Florida agency NPN, then archived as
          operating history.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Step</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {steps.map((step) => (
              <TableRow key={step.id}>
                <TableCell>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5">
                      <StepDot status={step.status} />
                    </span>
                    <div>
                      <p className="font-medium">{step.step}</p>
                      <p className="text-xs text-muted-foreground">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={step.status} />
                </TableCell>
                <TableCell>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {step.owner}
                  </span>
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => onViewSource(step)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    {step.source}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button variant="link" className="px-0" onClick={onViewAll}>
          View full licensing checklist
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
