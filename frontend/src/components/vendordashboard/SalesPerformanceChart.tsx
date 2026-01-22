import { Badge } from "@/components/ui/badge";

interface SalesPoint {
  label: string;
  value: number;
}

interface SalesPerformanceChartProps {
  data: SalesPoint[];
}

function buildLinePath(data: SalesPoint[]) {
  const values = data.map((point) => point.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = 100 / (data.length - 1);
  const points = data.map((point, index) => {
    const x = index * step;
    const y = 44 - ((point.value - min) / range) * 32;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const line = `M ${points.join(" L ")}`;
  const area = `${line} L 100 44 L 0 44 Z`;
  return { line, area };
}

export function SalesPerformanceChart({ data }: SalesPerformanceChartProps) {
  const { line, area } = buildLinePath(data);
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 hover-lift">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Sales Performance</p>
          <h3 className="font-display text-lg font-semibold">Daily Revenue Trend</h3>
        </div>
        <Badge variant="secondary">Last 7 Days</Badge>
      </div>
      <div className="mt-6 rounded-2xl bg-muted/40 p-4">
        <svg viewBox="0 0 100 48" className="h-40 w-full">
          <defs>
            <linearGradient id="salesGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#salesGradient)" className="text-primary" />
          <path d={line} fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
          {data.map((point, index) => {
            const x = (100 / (data.length - 1)) * index;
            const values = data.map((item) => item.value);
            const max = Math.max(...values);
            const min = Math.min(...values);
            const range = max - min || 1;
            const y = 44 - ((point.value - min) / range) * 32;
            return (
              <circle key={point.label} cx={x} cy={y} r={2.2} className="fill-primary" />
            );
          })}
        </svg>
        <div className="mt-4 flex justify-between text-xs text-muted-foreground">
          {data.map((point) => (
            <span key={point.label}>{point.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
