import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, ShoppingBag, Trash2 } from "lucide-react";

type Product = {
  id: number;
  name: string;
  category: string;
};

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/api/v1/products/");
        setProducts(res.data);
      } catch (err) {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  function addToCart(product: Product) {
    setCart((prev) => [...prev, product]);
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((p) => p.id !== productId));
  }

  const categories = useMemo(() => {
    const set = new Set(products.map((product) => product.category));
    return Array.from(set).sort();
  }, [products]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge variant="sustainability" className="mb-2">
                <Leaf className="h-3 w-3 mr-1" />
                FreshPath Marketplace
              </Badge>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Shop Fresh Deals
              </h1>
              <p className="text-muted-foreground max-w-xl">
                Discover curated perishable essentials from nearby retailers. Built for clarity and speed.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3">
              <ShoppingBag className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Cart items</p>
                <p className="font-display text-xl font-semibold text-foreground">{cart.length}</p>
              </div>
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
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <section>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover-lift"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                        <h2 className="font-display text-lg font-semibold text-foreground">
                          {product.name}
                        </h2>
                      </div>
                      <Badge variant="sustainability">Fresh</Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Local stock updated hourly. Best-by window optimized by AI.
                    </p>
                    <Button className="mt-4 w-full" onClick={() => addToCart(product)}>
                      Add to Cart
                    </Button>
                  </div>
                ))}
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
