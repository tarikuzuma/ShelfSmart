import { Badge } from "@/components/ui/badge";

interface SoldVsSpoilageProps {
  sold: number;
  spoilage: number;
}

export function SoldVsSpoilage({ sold, spoilage }: SoldVsSpoilageProps) {
  const soldPercent = Math.round((sold / (sold + spoilage)) * 100);
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 hover-lift">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Spoilage Control</p>
          <h3 className="font-display text-lg font-semibold">Sold vs Spoilage</h3>
        </div>
        <Badge variant="secondary">Weekly</Badge>
      </div>
      <div className="mt-6 flex items-center justify-center">
        <div
          className="h-40 w-40 rounded-full"
          style={{
            background: `conic-gradient(var(--color-primary) 0 ${soldPercent}%, var(--color-warning) ${soldPercent}% 100%)`,
          }}
        />
      </div>
      <div className="mt-6 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Sold items</span>
          <span className="font-semibold text-foreground">{sold} ({soldPercent}%)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Spoilage</span>
          <span className="font-semibold text-foreground">{spoilage} ({100 - soldPercent}%)</span>
        </div>
      </div>
    </div>
  );
}
