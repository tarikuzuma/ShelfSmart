import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

export function ProductSummaryRow({
  product,
  currentPrice,
  batchDetails,
  totalQty,
  sumBatchQty,
  totalSold,
  hasExpiringSoon,
  isExpanded,
  onToggleExpand,
  getDiscountBadge
}) {
  return (
    <div className="p-4 hover:bg-background transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 grid grid-cols-5 gap-4 items-center">
          <div className="col-span-2">
            <h3 className="font-semibold text-foreground text-lg">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.category || "Uncategorized"}</p>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Current Price</div>
            <div className="font-semibold text-foreground">
              {currentPrice !== null ? `₱${currentPrice.toFixed(2)}` : "N/A"}
              {currentPrice !== null && batchDetails.length > 0 &&
                getDiscountBadge(batchDetails[0].base_price, currentPrice)
              }
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total Inventory</div>
            <div className="font-semibold text-foreground">{totalQty} units</div>
            <div className="text-xs text-muted-foreground">Inventory snapshot (includes all batches minus sales)</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Sum of Batch Quantities</div>
            <div className="font-semibold text-foreground">{sumBatchQty} units</div>
            <div className="text-xs text-muted-foreground">Current sum of all batch quantities</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Sold/Depleted</div>
            <div className="font-semibold text-foreground">{totalSold} units</div>
            <div className="text-xs text-muted-foreground">Total units sold (from orders)</div>
          </div>
          <div className="flex items-center gap-2">
            {hasExpiringSoon && (
              <span className="flex items-center text-orange-600 text-sm">
                <AlertCircle size={16} className="mr-1" />
                Expiring soon
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpand}
          className="ml-4"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </Button>
      </div>
    </div>
  );
}
