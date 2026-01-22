import { Leaf } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
        <Leaf className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="font-display font-bold text-lg text-foreground">
        ShelfSmart
      </span>
    </div>
  );
}
