import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError("");
      try {
        // Use the correct customer marketplace API endpoint
        const res = await api.get("/api/v1/customer/marketplace/products");
        setProducts(res.data);
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  function addToCart(product) {
    setCart((prev) => [...prev, product]);
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((p) => p.id !== productId));
  }

  function getTotal() {
    return cart.reduce((sum, p) => sum + (p.base_price || 0), 0);
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Marketplace</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4 flex flex-col">
              <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
              {/* Show latest price if available */}
              <div className="mb-1">
                ₱{product.prices && product.prices.length > 0 ? product.prices[product.prices.length - 1].price : "-"}
              </div>
              {/* Show total delivered quantity minus total sold quantity */}
              <div className="mb-1 text-sm text-muted-foreground">
                Qty: {
                  (product.deliveries?.reduce((sum, d) => sum + d.quantity, 0) || 0) -
                  (product.sales?.reduce((sum, s) => sum + s.quantity, 0) || 0)
                }
              </div>
              <div className="mb-1 text-sm text-muted-foreground">Expires: N/A</div>
              <Button className="mt-auto" onClick={() => addToCart(product)}>
                Add to Cart
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className="fixed right-8 top-24 w-80 bg-white border rounded-lg shadow-lg p-6 z-50">
        <h2 className="text-xl font-bold mb-4">Cart</h2>
        {cart.length === 0 ? (
          <div className="text-muted-foreground">Your cart is empty.</div>
        ) : (
          <div>
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between mb-2">
                <span>{item.name}</span>
                <span>
                  ₱{item.prices && item.prices.length > 0 ? item.prices[item.prices.length - 1].price : "-"}
                </span>
                <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.id)}>
                  Remove
                </Button>
              </div>
            ))}
            <div className="mt-4 font-semibold">
              Total: ₱{
                cart.reduce(
                  (sum, p) => sum + (p.prices && p.prices.length > 0 ? p.prices[p.prices.length - 1].price : 0),
                  0
                )
              }
            </div>
            <Button className="mt-4 w-full" disabled>
              Checkout (Demo Only)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
