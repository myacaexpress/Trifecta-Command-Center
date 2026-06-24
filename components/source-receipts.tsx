import { RefreshCw } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { toneDot } from "@/lib/tone";
import type { SourceReceipt } from "@/lib/types";

export function SourceReceipts({
  receipts,
  onCheckReagan,
  busy,
}: {
  receipts: SourceReceipt[];
  onCheckReagan: () => void;
  busy?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Source Receipts</CardTitle>
            <CardDescription>
              Hermes uses these receipts when answering founders.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onCheckReagan}
            disabled={busy}
          >
            <RefreshCw className="h-4 w-4" />
            Check Reagan
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Current read</TableHead>
              <TableHead>Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((receipt) => (
              <TableRow key={receipt.id}>
                <TableCell className="font-medium">{receipt.source}</TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {receipt.date}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {receipt.area}
                </TableCell>
                <TableCell className="min-w-[18rem] text-muted-foreground">
                  {receipt.read}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        toneDot[receipt.tone],
                      )}
                    />
                    {receipt.confidence}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
