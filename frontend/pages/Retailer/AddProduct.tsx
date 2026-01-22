import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { ArrowLeft, Package, Tag, DollarSign, Box, Calendar, MapPin, ArrowRight } from "lucide-react";

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    base_price: "",
    quantity: "",
    manufacture_date: "",
    expiry_date: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // First, create the product
      const productRes = await api.post("/api/v1/products/", {
        name: formData.name,
        category: formData.category || null,
      });

      const productId = productRes.data.id;

      // Then, create the product batch
      const batchRes = await api.post("/api/v1/product-batches/", {
        product_id: productId,
        manufacture_date: formData.manufacture_date,
        expiry_date: formData.expiry_date,
        base_price: parseFloat(formData.base_price),
        quantity: parseInt(formData.quantity),
      });

      toast({
        title: "✅ Product Created!",
        description: `${formData.name} has been added to the marketplace`,
        type: "success",
        duration: 5000,
      });

      // Navigate back to retailer dashboard
      navigate("/retailer/products");
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Failed to create product. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

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
            <Link to="/retailer/products" className="hover:text-foreground transition-colors">
              Products
            </Link>
            <Link to="/retailer/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/retailer/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
      </nav>

      {/* HEADER */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-warning/5" />
        <div className="container relative mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge variant="sustainability" className="mb-3 animate-fade-in">
                <Package className="h-3 w-3 mr-1" />
                Add New Product
              </Badge>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Publish Product to Marketplace
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Create a new product listing that customers can discover and purchase.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* FORM */}
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border/60 rounded-2xl p-6 md:p-8 shadow-lg">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Product Name */}
              <label className="space-y-2 text-sm font-medium text-foreground">
                Product Name *
                <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <input
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="e.g., Fresh Organic Tomatoes"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </label>

              {/* Category */}
              <label className="space-y-2 text-sm font-medium text-foreground">
                Category
                <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <input
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="e.g., Vegetables, Fruits, Dairy"
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </label>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Base Price */}
                <label className="space-y-2 text-sm font-medium text-foreground">
                  Base Price (₱) *
                  <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <input
                      className="w-full bg-transparent text-sm outline-none"
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.base_price}
                      onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    />
                  </div>
                </label>

                {/* Quantity */}
                <label className="space-y-2 text-sm font-medium text-foreground">
                  Quantity *
                  <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
                    <Box className="h-4 w-4 text-muted-foreground" />
                    <input
                      className="w-full bg-transparent text-sm outline-none"
                      placeholder="0"
                      type="number"
                      min="1"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                  </div>
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Manufacture Date */}
                <label className="space-y-2 text-sm font-medium text-foreground">
                  Manufacture Date *
                  <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <input
                      className="w-full bg-transparent text-sm outline-none"
                      type="date"
                      required
                      value={formData.manufacture_date}
                      onChange={(e) => setFormData({ ...formData, manufacture_date: e.target.value })}
                    />
                  </div>
                </label>

                {/* Expiry Date */}
                <label className="space-y-2 text-sm font-medium text-foreground">
                  Expiry Date *
                  <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <input
                      className="w-full bg-transparent text-sm outline-none"
                      type="date"
                      required
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    />
                  </div>
                </label>
              </div>

              {/* Location (Optional) */}
              <label className="space-y-2 text-sm font-medium text-foreground">
                Location (Optional)
                <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <input
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="e.g., Store Aisle 3, Warehouse Section B"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </label>

              <div className="flex items-center gap-4 pt-4">
                <Button
                  variant="hero"
                  size="lg"
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Creating..." : "Publish Product"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  type="button"
                  onClick={() => navigate("/retailer/products")}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
