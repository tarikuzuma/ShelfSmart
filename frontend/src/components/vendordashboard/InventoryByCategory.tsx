import { Badge } from "@/components/ui/badge";

interface InventoryByCategoryProps {
  data: { label: string; value: number }[];
}

export function InventoryByCategory({ data }: InventoryByCategoryProps) {
  const max = Math.max(...data.map((entry) => entry.value));
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 hover-lift">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Inventory Depth</p>
          <h3 className="font-display text-lg font-semibold">Items by Category</h3>
        </div>
        <Badge variant="secondary">Live</Badge>
      </div>
      <div className="mt-6 space-y-3">
        {data.map((item) => {
          const width = (item.value / max) * 100;
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-semibold text-foreground">{item.value}</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
