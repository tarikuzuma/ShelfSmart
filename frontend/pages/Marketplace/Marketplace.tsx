import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";
import { ChevronDown, Leaf, Search, ShoppingBag, Trash2 } from "lucide-react";

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
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

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
          <Button variant="hero" size="sm">
            Sign In
          </Button>
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
                {filteredProducts.map((product) => (
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
                      <p className="mt-2 text-sm text-muted-foreground">
                        AI freshness status available at checkout.
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <Button variant="outline">Details</Button>
                        <Button onClick={() => addToCart(product)}>
                          <ShoppingBag className="h-4 w-4" />
                          Add
                        </Button>
                      </div>
                    </div>
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
