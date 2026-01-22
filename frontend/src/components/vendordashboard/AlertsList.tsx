import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface Alert {
  name: string;
  action: string;
  status: string;
  time: string;
}

interface AlertsListProps {
  alerts: Alert[];
}

export function AlertsList({ alerts }: AlertsListProps) {
  return (
    <div className="mt-5 space-y-4">
      {alerts.map((alert) => (
        <div key={alert.name} className="rounded-2xl border border-border/60 bg-background p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground text-sm">{alert.name}</p>
              <p className="text-xs text-muted-foreground">{alert.action}</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {alert.status}
            </Badge>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {alert.time}
          </div>
        </div>
      ))}
    </div>
  );
}
