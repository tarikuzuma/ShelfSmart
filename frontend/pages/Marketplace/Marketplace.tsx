import { useEffect, useMemo, useState, useRef } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, Leaf, Search, ShoppingBag, Trash2, Bell, BellOff } from "lucide-react";
import { 
  getCurrentUserId, 
  isSubscribedToRetailer, 
  subscribeToRetailer, 
  unsubscribeFromRetailer 
} from "@/lib/subscriptions";
import { toast } from "@/components/ui/toast";

type Product = {
  id: number;
  name: string;
  category: string;
};

type ProductBatch = {
  id: number;
  product_id: number;
  base_price: number;
  expiry_date: string;
  quantity: number;
};

// Default retailer ID (since schema doesn't have retailer_id, using 1 as default)
const DEFAULT_RETAILER_ID = 1;

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const previousPricesRef = useRef<Map<number, number>>(new Map()); // product_id -> previous lowest price
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in by checking for token in localStorage
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
      
      if (token) {
        const userId = getCurrentUserId();
        if (userId) {
          const subscribed = isSubscribedToRetailer(userId, DEFAULT_RETAILER_ID);
          setIsSubscribed(subscribed);
        }
      }
    };
    
    checkLoginStatus();
    
    // Also check when window gains focus (in case user logged in another tab)
    window.addEventListener("focus", checkLoginStatus);
    return () => window.removeEventListener("focus", checkLoginStatus);
  }, [location.pathname]); // Re-check when route changes

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError("");
      try {
        const prodRes = await api.get("/api/v1/products/");
        const newProducts = prodRes.data;
        const batchRes = await api.get("/api/v1/product-batches/");
        const newBatches = batchRes.data;
        
        // Detect price drops for subscribed users (after we have both products and batches)
        if (isLoggedIn && isSubscribed && newProducts.length > 0 && newBatches.length > 0) {
          detectPriceDrops(newProducts, newBatches);
        }
        
        // Update previous prices
        const productIds = new Set<number>(newBatches.map((b: ProductBatch) => b.product_id));
        productIds.forEach((productId: number) => {
          const productBatches = newBatches.filter((b: ProductBatch) => b.product_id === productId);
          if (productBatches.length > 0) {
            const lowestPrice = Math.min(...productBatches.map((b: ProductBatch) => b.base_price));
            previousPricesRef.current.set(productId, lowestPrice);
          }
        });
        
        setProducts(newProducts);
        setBatches(newBatches);
      } catch (err) {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
    
    // Poll for price updates every 30 seconds
    const interval = setInterval(fetchProducts, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, isSubscribed]);
  
  function detectPriceDrops(productsList: Product[], newBatches: ProductBatch[]) {
    const userId = getCurrentUserId();
    if (!userId || !isSubscribed) return;
    
    const processedProducts = new Set<number>();
    
    newBatches.forEach((batch: ProductBatch) => {
      if (processedProducts.has(batch.product_id)) return;
      processedProducts.add(batch.product_id);
      
      const productBatches = newBatches.filter((b: ProductBatch) => b.product_id === batch.product_id);
      if (productBatches.length === 0) return;
      
      const currentLowestPrice = Math.min(...productBatches.map((b: ProductBatch) => b.base_price));
      const previousPrice = previousPricesRef.current.get(batch.product_id);
      
      const product = productsList.find(p => p.id === batch.product_id);
      if (!product) return;
      
      // Check for price drops
      if (previousPrice && currentLowestPrice < previousPrice) {
        const priceDrop = previousPrice - currentLowestPrice;
        const dropPercent = ((priceDrop / previousPrice) * 100).toFixed(1);
        
        if (priceDrop > 0.1) { // Significant price drop (>10 cents)
          toast({
            title: "💰 Price Drop Alert!",
            description: `${product.name} dropped by ${dropPercent}% (₱${priceDrop.toFixed(2)} off)`,
            type: "success",
            duration: 8000,
          });
        }
      }
      
      // Check for near-expiry discounts (only show once per product)
      const batchWithExpiry = productBatches.find((b: ProductBatch) => {
        const expiryDate = new Date(b.expiry_date);
        const today = new Date();
        const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysToExpiry <= 3 && daysToExpiry >= 0;
      });
      
      if (batchWithExpiry) {
        const expiryDate = new Date(batchWithExpiry.expiry_date);
        const today = new Date();
        const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        toast({
          title: "⏰ Near Expiry Deal!",
          description: `${product.name} expires in ${daysToExpiry} day(s) - Great discount available!`,
          type: "warning",
          duration: 8000,
        });
      }
    });
  }
  
  function handleSubscribe() {
    const userId = getCurrentUserId();
    if (!userId) {
      navigate("/login");
      return;
    }
    
    subscribeToRetailer(userId, DEFAULT_RETAILER_ID);
    setIsSubscribed(true);
    toast({
      title: "🔔 Subscribed!",
      description: "You'll receive alerts for price drops and near-expiry deals",
      type: "success",
    });
  }
  
  function handleUnsubscribe() {
    const userId = getCurrentUserId();
    if (!userId) return;
    
    unsubscribeFromRetailer(userId, DEFAULT_RETAILER_ID);
    setIsSubscribed(false);
    toast({
      title: "Unsubscribed",
      description: "You won't receive price alerts anymore",
      type: "info",
    });
  }

  function addToCart(product: Product) {
    if (!isLoggedIn) {
      // Redirect to login if not logged in
      navigate("/login");
      return;
    }
    setCart((prev) => [...prev, product]);
  }

  function handleSignOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login");
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((p) => p.id !== productId));
  }

  const categories = useMemo(() => {
    const set = new Set(products.map((product) => product.category));
    return ["All Categories", ...Array.from(set).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory =
        selectedCategory === "All Categories" || product.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }, [products, query, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link to="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <span className="text-primary font-semibold">Marketplace</span>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <Button
                variant={isSubscribed ? "outline" : "ghost"}
                size="sm"
                onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
                title={isSubscribed ? "Unsubscribe from price alerts" : "Subscribe to price alerts"}
              >
                {isSubscribed ? (
                  <>
                    <BellOff className="h-4 w-4 mr-1" />
                    Unsubscribe
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-1" />
                    Subscribe
                  </>
                )}
              </Button>
            )}
            {isLoggedIn ? (
              <Button variant="hero" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            ) : (
              <Button variant="hero" size="sm" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      <header className="border-b border-border/60 bg-muted/30">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Marketplace
              </h1>
              <p className="mt-2 text-muted-foreground max-w-xl">
                Discover fresh food at a fraction of the cost.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2 shadow-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
              <button
                type="button"
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-2 text-sm shadow-sm"
                onClick={() => {
                  const currentIndex = categories.indexOf(selectedCategory);
                  const nextIndex = (currentIndex + 1) % categories.length;
                  setSelectedCategory(categories[nextIndex]);
                }}
              >
                <span>{selectedCategory}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        {loading && (
          <div className="rounded-2xl border border-border/60 bg-card p-6 text-muted-foreground">
            Loading marketplace inventory...
          </div>
        )}
        {!loading && error && (
          <div className="mb-6 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
            {error}
          </div>
        )}

        {!loading && (
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <section>
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      selectedCategory === category
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => {
                  // Find all batches for this product
                  const productBatches = batches.filter(b => b.product_id === product.id);
                  // Find lowest price batch
                  const lowestBatch = productBatches.length > 0 
                    ? productBatches.reduce((min, b) => b.base_price < min.base_price ? b : min)
                    : null;
                  return (
                    <div
                      key={product.id}
                      className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm hover-lift"
                    >
                      <div className="relative h-40 bg-muted/40 flex items-center justify-center">
                        <div className="absolute left-3 top-3 h-3 w-3 rounded-full bg-destructive" />
                        <Badge className="absolute right-3 top-3" variant="secondary">
                          Fresh
                        </Badge>
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Leaf className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {product.category}
                        </p>
                        <h2 className="font-display text-lg font-semibold text-foreground">
                          {product.name}
                        </h2>
                        {lowestBatch && (
                          <p className="mt-2 text-sm text-primary">
                            <span
                              className="underline cursor-pointer"
                              onClick={() => navigate(`/product/${product.id}`)}
                            >
                              ₱{lowestBatch.base_price.toFixed(2)}
                            </span>
                            {productBatches.length > 1 && (
                              <span className="ml-2 text-xs text-muted-foreground">({productBatches.length} batches)</span>
                            )}
                          </p>
                        )}
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <Button variant="outline" onClick={() => navigate(`/product/${product.id}`)}>Details</Button>
                          <Button 
                            onClick={() => addToCart(product)}
                            disabled={!isLoggedIn}
                            title={!isLoggedIn ? "Please sign in to add items to cart" : ""}
                          >
                            <ShoppingBag className="h-4 w-4" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <aside className="lg:sticky lg:top-24 h-fit">
              <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">Cart</h2>
                  <Badge variant="secondary">{cart.length} items</Badge>
                </div>
                {cart.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Your cart is empty. Add products to see them here.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-6 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total items</span>
                  <span className="font-semibold text-foreground">{cart.length}</span>
                </div>
                <Button className="mt-4 w-full" disabled>
                  Checkout (Demo Only)
                </Button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
