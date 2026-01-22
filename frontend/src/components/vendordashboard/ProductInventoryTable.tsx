import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

function getDiscountedPrice(basePrice: number, daysToExpiry: number) {
  if (daysToExpiry >= 30) return basePrice;
  if (daysToExpiry >= 15) return basePrice * 0.90;
  if (daysToExpiry >= 8) return basePrice * 0.80;
  if (daysToExpiry >= 4) return basePrice * 0.70;
  if (daysToExpiry >= 1) return basePrice * 0.50;
  return basePrice * 0.30;
}

function getExpiryStatus(daysUntilExpiry: number) {
  if (daysUntilExpiry < 0) return { color: "text-red-700", bg: "bg-red-100", label: "Expired" };
  if (daysUntilExpiry <= 3) return { color: "text-red-600", bg: "bg-red-50", label: "Critical" };
  if (daysUntilExpiry <= 7) return { color: "text-orange-600", bg: "bg-orange-50", label: "Urgent" };
  if (daysUntilExpiry <= 14) return { color: "text-yellow-600", bg: "bg-yellow-50", label: "Soon" };
  return { color: "text-green-600", bg: "bg-green-50", label: "Good" };
}

function getDiscountBadge(basePrice: number, discountedPrice: number) {
  const discount = Math.round((1 - discountedPrice / basePrice) * 100);
  if (discount === 0) return null;
  return (
    <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded">
      -{discount}%
    </span>
  );
}

export function ProductInventoryTable() {
  const [products, setProducts] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [inventories, setInventories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError("");
      try {
        const [prodRes, batchRes, invRes, orderRes] = await Promise.all([
          api.get(`/api/v1/products/`),
          api.get(`/api/v1/product-batches/`),
          api.get(`/api/v1/inventories/`),
          api.get(`/api/v1/orders/`),
        ]);
        setProducts(prodRes.data);
        setBatches(batchRes.data);
        setInventories(invRes.data);
        setOrders(orderRes.data);
      } catch (err) {
        setError("Failed to load inventory data");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  function getProductBatches(productId: number) {
    return batches.filter((b) => b.product_id === productId);
  }

  function getLatestInventory(productId: number) {
    const invs = inventories.filter((i) => i.product_id === productId);
    if (invs.length === 0) return null;
    return invs.reduce((a, b) => (a.date > b.date ? a : b));
  }

  function toggleExpand(productId: number) {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  }

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading inventory...</div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="mr-2" size={20} />
          {error}
        </div>
      )}
      {!loading && !error && products.map((product) => {
        const isExpanded = expandedProducts.has(product.id);
        const productBatches = getProductBatches(product.id);
        const latestInv = getLatestInventory(product.id);
        const totalQty = latestInv ? latestInv.quantity : 0;
        const sumBatchQty = productBatches.reduce((sum, b) => sum + b.quantity, 0);
        const totalSold = orders
          .flatMap(order => order.items)
          .filter(item => item.product_id === product.id)
          .reduce((sum, item) => sum + item.quantity, 0);
        let currentPrice = null;
        const batchDetails = productBatches.map(batch => {
          const today = new Date();
          const expiry = new Date(batch.expiry_date);
          const daysToExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
          const discountedPrice = getDiscountedPrice(batch.base_price, daysToExpiry);
          if (currentPrice === null || discountedPrice < currentPrice) {
            currentPrice = discountedPrice;
          }
          return {
            ...batch,
            daysToExpiry,
            discountedPrice
          };
        });
        batchDetails.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
        const hasExpiringSoon = batchDetails.some(b => b.daysToExpiry <= 7);
        return (
          <div key={product.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                  <div className="col-span-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category || "Uncategorized"}</p>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Current Price</div>
                    <div className="font-semibold text-gray-900">
                      {currentPrice !== null ? `₱${currentPrice.toFixed(2)}` : "N/A"}
                      {currentPrice !== null && batchDetails.length > 0 && getDiscountBadge(batchDetails[0].base_price, currentPrice)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Total Inventory</div>
                    <div className="font-semibold text-gray-900">{totalQty} units</div>
                    <div className="text-xs text-gray-500">Inventory snapshot (includes all batches minus sales)</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Sum of Batch Quantities</div>
                    <div className="font-semibold text-gray-900">{sumBatchQty} units</div>
                    <div className="text-xs text-gray-500">Current sum of all batch quantities</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Sold/Depleted</div>
                    <div className="font-semibold text-gray-900">{totalSold} units</div>
                    <div className="text-xs text-gray-500">Total units sold (from orders)</div>
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
                  onClick={() => toggleExpand(product.id)}
                  className="ml-4"
                >
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </Button>
              </div>
            </div>
            {isExpanded && (
              <div className="border-t border-gray-200 bg-gray-50">
                <div className="p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Batch Details</h4>
                  {batchDetails.length === 0 ? (
                    <div className="text-gray-500 text-sm">No batches available</div>
                  ) : (
                    <div className="space-y-2">
                      {batchDetails.map((batch) => {
                        const status = getExpiryStatus(batch.daysToExpiry);
                        return (
                          <div key={batch.id} className={`p-3 rounded-lg border ${status.bg} border-gray-200`}>
                            <div className="grid grid-cols-6 gap-4 items-center">
                              <div>
                                <div className="text-xs text-gray-600">Batch ID</div>
                                <div className="font-mono font-semibold text-sm">#{batch.id}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-600">Manufactured</div>
                                <div className="text-sm">{new Date(batch.manufacture_date).toLocaleDateString()}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-600">Expires</div>
                                <div className="text-sm font-semibold">{new Date(batch.expiry_date).toLocaleDateString()}</div>
                                <div className={`text-xs ${status.color} font-semibold`}>
                                  {batch.daysToExpiry < 0 
                                    ? `${Math.abs(batch.daysToExpiry)} days ago`
                                    : `${batch.daysToExpiry} days left`
                                  }
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-600">Base Price</div>
                                <div className="text-sm text-gray-500 line-through">₱{batch.base_price.toFixed(2)}</div>
                                <div className="text-sm font-semibold text-gray-900">
                                  ₱{batch.discountedPrice.toFixed(2)}
                                  {getDiscountBadge(batch.base_price, batch.discountedPrice)}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-600">Quantity</div>
                                <div className="text-sm font-semibold">{batch.quantity} units</div>
                              </div>
                              <div>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${status.bg} ${status.color} border border-current`}>
                                  {status.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
