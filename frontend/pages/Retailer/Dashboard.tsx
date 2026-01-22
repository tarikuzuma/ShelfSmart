import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, AlertCircle, Store, ShoppingBag, Package, Clock, TriangleAlert, TrendingUp, CheckCircle, Leaf, BarChart3, Route } from "lucide-react";
import { ProductSummaryRow } from "../../components/ProductSummaryRow";

function getDiscountedPrice(basePrice, daysToExpiry) {
  if (daysToExpiry >= 30) return basePrice;
  if (daysToExpiry >= 15) return basePrice * 0.90;
  if (daysToExpiry >= 8) return basePrice * 0.80;
  if (daysToExpiry >= 4) return basePrice * 0.70;
  if (daysToExpiry >= 1) return basePrice * 0.50;
  return basePrice * 0.30;
}

function getExpiryStatus(daysUntilExpiry) {
  if (daysUntilExpiry < 0) return { color: "text-red-700", bg: "bg-red-100", label: "Expired" };
  if (daysUntilExpiry <= 3) return { color: "text-red-600", bg: "bg-red-50", label: "Critical" };
  if (daysUntilExpiry <= 7) return { color: "text-orange-600", bg: "bg-orange-50", label: "Urgent" };
  if (daysUntilExpiry <= 14) return { color: "text-yellow-600", bg: "bg-yellow-50", label: "Soon" };
  return { color: "text-green-600", bg: "bg-green-50", label: "Good" };
}

function getDiscountBadge(basePrice, discountedPrice) {
  const discount = Math.round((1 - discountedPrice / basePrice) * 100);
  if (discount === 0) return null;
  return (
    <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded">
      -{discount}%
    </span>
  );
}

export default function RetailerDashboard() {
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedProducts, setExpandedProducts] = useState(new Set());
  const now = new Date();

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
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Metrics
  const totalItems = products.length;
  const nearExpiry = batches.filter(b => {
    const days = (new Date(b.expiry_date).getTime() - now.getTime()) / (1000*60*60*24);
    return days >= 0 && days <= 7;
  }).length;
  const urgent = batches.filter(b => {
    const days = (new Date(b.expiry_date).getTime() - now.getTime()) / (1000*60*60*24);
    return days >= 0 && days <= 3;
  }).length;
  const soldToday = orders.filter(o => {
    const d = new Date(o.date);
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

  function getProductBatches(productId) {
    return batches.filter((b) => b.product_id === productId);
  }

  function getLatestInventory(productId) {
    const invs = inventories.filter((i) => i.product_id === productId);
    if (invs.length === 0) return null;
    return invs.reduce((a, b) => (a.date > b.date ? a : b));
  }

  function toggleExpand(productId) {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link to="/marketplace" className="hover:text-foreground transition-colors">
              Marketplace
            </Link>
            <Link to="retailer/dashboard" className="hover:text-foreground transition-colors">
              Retailer Dashboard
            </Link>
            <Link to="#insights" className="hover:text-foreground transition-colors">
              Insights
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <AlertCircle className="h-4 w-4" />
              Alerts
            </Button>
            <Button variant="hero" size="sm">
              <Package className="h-4 w-4" />
              Sync Data
            </Button>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-warning/5" />
        <div className="container relative mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge variant="sustainability" className="mb-3 animate-fade-in">
                <Store className="h-3 w-3 mr-1" />
                Retailer Operations Center
              </Badge>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                FreshPath Product List
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Track inventory, batch expiry, and sales in one unified command center for retailers.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="hero" size="lg" asChild>
                <Link to="/retailer/add-product">
                  <Package className="h-4 w-4 mr-2" />
                  Add Product
                </Link>
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <Link to="/retailer/demand-forecast">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  AI Forecast
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-16">
        {/* METRICS CARDS */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 -mt-8 mb-8">
          <div className="rounded-2xl border border-border/60 bg-card p-4 hover-lift animate-fade-in-up">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Total Items</p>
              <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-primary/10">
                <Package className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{totalItems}</p>
            <p className="text-xs text-muted-foreground">Updated now</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-4 hover-lift animate-fade-in-up">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Near-Expiry</p>
              <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-warning/10">
                <Clock className="h-4 w-4 text-warning" />
              </div>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{nearExpiry}</p>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-4 hover-lift animate-fade-in-up">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Urgent</p>
              <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-destructive/10">
                <TriangleAlert className="h-4 w-4 text-destructive" />
              </div>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{urgent}</p>
            <p className="text-xs text-muted-foreground">Next 3 days</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-4 hover-lift animate-fade-in-up">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Sold Today</p>
              <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-primary/10">
                <ShoppingBag className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{soldToday}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
        </section>

        {/* PRODUCT & BATCH TABLE */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Live Catalog</p>
              <h3 className="font-display text-xl font-semibold">What You’re Selling</h3>
            </div>
            {/* <Button variant="heroOutline" size="sm">
              <Package className="h-4 w-4" />
              Manage Inventory
            </Button> */}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading products...</div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
              <AlertCircle className="mr-2" size={20} />
              {error}
            </div>
          )}
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No products found. Add some products to get started.
            </div>
          )}
          {!loading && !error && (
            <div className="space-y-4">
              {products.map((product) => {
                const isExpanded = expandedProducts.has(product.id);
                const productBatches = getProductBatches(product.id);
                const latestInv = getLatestInventory(product.id);

                const totalQty = latestInv ? latestInv.quantity : 0;
                // Sum of all current batch quantities
                const sumBatchQty = productBatches.reduce((sum, b) => sum + b.quantity, 0);
                // Calculate total sold units for this product
                const totalSold = orders
                  .flatMap(order => order.items)
                  .filter(item => item.product_id === product.id)
                  .reduce((sum, item) => sum + item.quantity, 0);

                // Calculate current price (lowest discounted price)
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
                // Sort batches by expiry date
                batchDetails.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
                const hasExpiringSoon = batchDetails.some(b => b.daysToExpiry <= 7);

                return (
                  <div key={product.id} className="bg-card border border-border/60 rounded-lg shadow-sm overflow-hidden">
                    <ProductSummaryRow
                      product={product}
                      currentPrice={currentPrice}
                      batchDetails={batchDetails}
                      totalQty={totalQty}
                      sumBatchQty={sumBatchQty}
                      totalSold={totalSold}
                      hasExpiringSoon={hasExpiringSoon}
                      isExpanded={isExpanded}
                      onToggleExpand={() => toggleExpand(product.id)}
                      getDiscountBadge={getDiscountBadge}
                    />
                    {/* Expanded Batch Details */}
                    {isExpanded && (
                      <div className="border-t border-border/60 bg-background">
                        <div className="p-4">
                          <h4 className="font-semibold text-foreground mb-3">Batch Details</h4>
                          {batchDetails.length === 0 ? (
                            <div className="text-muted-foreground text-sm">No batches available</div>
                          ) : (
                            <div className="space-y-2">
                              {batchDetails.map((batch) => {
                                const status = getExpiryStatus(batch.daysToExpiry);
                                return (
                                  <div key={batch.id} className={`p-3 rounded-lg border ${status.bg} border-border/60`}>
                                    <div className="grid grid-cols-6 gap-4 items-center">
                                      <div>
                                        <div className="text-xs text-muted-foreground">Batch ID</div>
                                        <div className="font-mono font-semibold text-sm">#{batch.id}</div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-muted-foreground">Manufactured</div>
                                        <div className="text-sm">{new Date(batch.manufacture_date).toLocaleDateString()}</div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-muted-foreground">Expires</div>
                                        <div className="text-sm font-semibold">{new Date(batch.expiry_date).toLocaleDateString()}</div>
                                        <div className={`text-xs ${status.color} font-semibold`}>
                                          {batch.daysToExpiry < 0 
                                            ? `${Math.abs(batch.daysToExpiry)} days ago`
                                            : `${batch.daysToExpiry} days left`
                                          }
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-muted-foreground">Base Price</div>
                                        <div className="text-sm text-muted-foreground line-through">₱{batch.base_price.toFixed(2)}</div>
                                        <div className="text-sm font-semibold text-foreground">
                                          ₱{batch.discountedPrice.toFixed(2)}
                                          {getDiscountBadge(batch.base_price, batch.discountedPrice)}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-muted-foreground">Quantity</div>
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
          )}
        </section>

        {/* INSIGHTS/EXTRA CARDS (static for now) */}
        <section className="mt-12 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-border/60 bg-card p-6 hover-lift">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sustainability Impact</p>
                <p className="font-display text-2xl font-bold text-foreground">1,200 kg</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Food waste saved this month, equivalent to 1,800 meals.
            </p>
          </div>
          <div className="rounded-3xl border border-border/60 bg-card p-6 hover-lift">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Route className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Logistics Insight</p>
                <p className="font-display text-2xl font-bold text-foreground">9 min</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Fastest delivery route: Market A → Market B → Market C.
            </p>
          </div>
          <div className="rounded-3xl border border-border/60 bg-card p-6 hover-lift">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Deliveries</p>
                <p className="font-display text-2xl font-bold text-foreground">5</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              2 inbound shipments have AI-guided freshness priority.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}