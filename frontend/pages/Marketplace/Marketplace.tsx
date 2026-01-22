import { useEffect, useMemo, useState, useRef } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, Leaf, Search, ShoppingBag, Trash2, Bell, BellOff } from "lucide-react";
import { 
  getCurrentUserId, 
  getUserSubscriptions
} from "@/lib/subscriptions";
import { toast } from "@/components/ui/toast";
import { RetailerSubscriptionModal } from "@/components/RetailerSubscriptionModal";

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

type Retailer = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type CartItem = {
  product_id: number;
  product_name: string;
  category: string;
  quantity: number;
  price: number;
};

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [subscribedRetailerIds, setSubscribedRetailerIds] = useState<number[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const previousPricesRef = useRef<Map<number, { price: number; retailerId: number }>>(new Map()); // product_id -> { price, retailerId }
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Load retailers
    async function loadRetailers() {
      try {
        const res = await api.get("/api/v1/retailers/");
        setRetailers(res.data);
      } catch (err) {
        console.error("Failed to load retailers:", err);
      }
    }
    loadRetailers();
  }, []);

  useEffect(() => {
    // Check if user is logged in by checking for token in localStorage
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
      
      if (token) {
        const userId = getCurrentUserId();
        if (userId) {
          const subs = getUserSubscriptions(userId);
          setSubscribedRetailerIds(subs);
        }
      } else {
        setSubscribedRetailerIds([]);
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
        
        // Detect price changes for subscribed users (after we have both products and batches)
        if (isLoggedIn && subscribedRetailerIds.length > 0 && newProducts.length > 0 && newBatches.length > 0) {
          detectPriceChanges(newProducts, newBatches);
        }
        
        // Update previous prices with retailer mapping
        // For MVP: assign batches to retailers using a simple hash (batch_id % num_retailers)
        const productIds = new Set<number>(newBatches.map((b: ProductBatch) => b.product_id));
        productIds.forEach((productId: number) => {
          const productBatches = newBatches.filter((b: ProductBatch) => b.product_id === productId);
          if (productBatches.length > 0 && retailers.length > 0) {
            // Find the batch with lowest price and assign it to a retailer
            const lowestBatch = productBatches.reduce((min, b) => b.base_price < min.base_price ? b : min);
            const retailerId = retailers[lowestBatch.id % retailers.length]?.id || retailers[0]?.id;
            previousPricesRef.current.set(productId, {
              price: lowestBatch.base_price,
              retailerId: retailerId
            });
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
  }, [isLoggedIn, subscribedRetailerIds.length]);
  
  function detectPriceChanges(productsList: Product[], newBatches: ProductBatch[]) {
    if (subscribedRetailerIds.length === 0 || retailers.length === 0) return;
    
    const processedProducts = new Set<number>();
    
    newBatches.forEach((batch: ProductBatch) => {
      if (processedProducts.has(batch.product_id)) return;
      processedProducts.add(batch.product_id);
      
      const productBatches = newBatches.filter((b: ProductBatch) => b.product_id === batch.product_id);
      if (productBatches.length === 0) return;
      
      // Find lowest price batch and determine which retailer it belongs to
      const lowestBatch = productBatches.reduce((min, b) => b.base_price < min.base_price ? b : min);
      const retailerId = retailers[lowestBatch.id % retailers.length]?.id || retailers[0]?.id;
      
      // Only notify if user is subscribed to this retailer
      if (!subscribedRetailerIds.includes(retailerId)) return;
      
      const currentPrice = lowestBatch.base_price;
      const previousData = previousPricesRef.current.get(batch.product_id);
      
      const product = productsList.find(p => p.id === batch.product_id);
      if (!product) return;
      
      const retailer = retailers.find(r => r.id === retailerId);
      const retailerName = retailer?.name || "Retailer";
      
      // Check for price changes (both increases and decreases)
      if (previousData && previousData.price !== currentPrice) {
        const priceChange = currentPrice - previousData.price;
        const changePercent = Math.abs((priceChange / previousData.price) * 100).toFixed(1);
        
        if (Math.abs(priceChange) > 0.1) { // Significant price change (>10 cents)
          if (priceChange < 0) {
            // Price dropped
            toast({
              title: "💰 Price Drop Alert!",
              description: `${retailerName} reduced ${product.name} by ${changePercent}% (₱${Math.abs(priceChange).toFixed(2)} off)`,
              type: "success",
              duration: 8000,
            });
          } else {
            // Price increased
            toast({
              title: "📈 Price Increase",
              description: `${retailerName} increased ${product.name} by ${changePercent}% (₱${priceChange.toFixed(2)} more)`,
              type: "info",
              duration: 8000,
            });
          }
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
          description: `${retailerName} has ${product.name} expiring in ${daysToExpiry} day(s) - Great discount available!`,
          type: "warning",
          duration: 8000,
        });
      }
    });
  }
  
  function handleSubscriptionChange() {
    const userId = getCurrentUserId();
    if (userId) {
      const subs = getUserSubscriptions(userId);
      setSubscribedRetailerIds(subs);
    }
  }

  function addToCart(product: Product) {
    if (!isLoggedIn) {
      // Redirect to login if not logged in
      navigate("/login");
      return;
    }
    
    // Find the lowest price batch for this product
    const productBatches = batches.filter(b => b.product_id === product.id);
    if (productBatches.length === 0) {
      toast({
        title: "Error",
        description: "No batches available for this product",
        type: "error",
      });
      return;
    }
    
    const lowestBatch = productBatches.reduce((min, b) => b.base_price < min.base_price ? b : min);
    const price = lowestBatch.base_price;
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.product_id === product.id);
    if (existingItem) {
      // Increase quantity
      setCart((prev) =>
        prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // Add new item
      setCart((prev) => [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          category: product.category,
          quantity: 1,
          price: price,
        },
      ]);
    }
    
    toast({
      title: "Added to cart",
      description: `${product.name} added to cart`,
      type: "success",
      duration: 2000,
    });
  }

  function handleSignOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setCart([]);
    navigate("/login");
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  }
  
  function updateCartQuantity(productId: number, newQuantity: number) {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  }
  
  async function handleCheckout() {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to cart before checkout",
        type: "warning",
      });
      return;
    }
    
    setCheckingOut(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      const orderData = {
        date: today,
        total_price: totalPrice,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
      };
      
      const response = await api.post("/api/v1/orders/", orderData);
      
      toast({
        title: "✅ Order Placed!",
        description: `Order #${response.data.id} placed successfully. Total: ₱${totalPrice.toFixed(2)}`,
        type: "success",
        duration: 5000,
      });
      
      // Clear cart
      setCart([]);
      
      // Refresh products and batches to show updated inventory
      const prodRes = await api.get("/api/v1/products/");
      const batchRes = await api.get("/api/v1/product-batches/");
      setProducts(prodRes.data);
      setBatches(batchRes.data);
      
    } catch (err: any) {
      toast({
        title: "Checkout Failed",
        description: err.response?.data?.detail || "Failed to place order. Please try again.",
        type: "error",
      });
    } finally {
      setCheckingOut(false);
    }
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
                variant={subscribedRetailerIds.length > 0 ? "outline" : "ghost"}
                size="sm"
                onClick={() => setShowSubscriptionModal(true)}
                title="Manage retailer subscriptions"
              >
                <Bell className="h-4 w-4 mr-1" />
                {subscribedRetailerIds.length > 0 
                  ? `Subscribed (${subscribedRetailerIds.length})` 
                  : "Subscribe"}
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
                  <Badge variant="secondary">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                  </Badge>
                </div>
                {cart.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Your cart is empty. Add products to see them here.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.product_id}
                        className="rounded-xl border border-border/60 bg-background px-3 py-2"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                            <p className="text-xs text-primary mt-1">₱{item.price.toFixed(2)} each</p>
                          </div>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6"
                            onClick={() => removeFromCart(item.product_id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                          <span className="text-xs text-muted-foreground">Quantity</span>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6"
                              onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                            >
                              <span className="text-xs">-</span>
                            </Button>
                            <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6"
                              onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                            >
                              <span className="text-xs">+</span>
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 text-right">
                          <span className="text-xs text-muted-foreground">Subtotal: </span>
                          <span className="text-sm font-semibold text-foreground">
                            ₱{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {cart.length > 0 && (
                  <>
                    <div className="mt-6 space-y-2 pt-4 border-t border-border/60">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total items</span>
                        <span className="font-semibold text-foreground">
                          {cart.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-base">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="font-bold text-primary text-lg">
                          ₱{cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <Button 
                      className="mt-4 w-full" 
                      variant="hero"
                      onClick={handleCheckout}
                      disabled={checkingOut || !isLoggedIn}
                    >
                      {checkingOut ? "Processing..." : "Checkout"}
                    </Button>
                  </>
                )}
              </div>
            </aside>
          </div>
        )}
      </main>
      
      <RetailerSubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscriptionChange={handleSubscriptionChange}
      />
    </div>
  );
}
