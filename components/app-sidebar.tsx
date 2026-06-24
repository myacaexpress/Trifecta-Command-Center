import {
  Archive,
  Banknote,
  Building2,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Command Center", icon: LayoutDashboard, active: true },
  { label: "LLC Setup", icon: Building2 },
  { label: "Licensing", icon: ShieldCheck },
  { label: "Banking", icon: Banknote },
  { label: "Carrier Readiness", icon: Users },
  { label: "Sources", icon: FileText },
  { label: "Settings", icon: Settings },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Archive className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Trifecta Command Center</p>
          <p className="text-xs text-muted-foreground">Hermes assistant online</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1" aria-label="Main navigation">
        {navItems.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-lg border bg-muted/40 p-3">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <div className="leading-tight">
            <p className="text-sm font-medium">Trifecta Benefits LLC</p>
            <p className="text-xs text-muted-foreground">Florida agency setup</p>
          </div>
        </div>
      </div>
    </div>
  );
}
