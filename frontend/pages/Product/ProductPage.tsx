import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import PriceHistoryGraph from "../../components/PriceHistoryGraph";

type Product = {
  id: number;
  name: string;
  category: string;
};

type ProductBatch = {
  id: number;
  product_id: number;
  manufacture_date: string;
  expiry_date: string;
  base_price: number;
  quantity: number;
};

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const prodRes = await api.get(`/api/v1/products/${id}/`);
        const batchRes = await api.get(`/api/v1/product-batches/?product_id=${id}`);
        setProduct(prodRes.data);
        setBatches(batchRes.data);
        if (batchRes.data.length > 0) {
          setSelectedBatchId(batchRes.data[0].id);
        }
      } catch (err) {
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const selectedBatch = batches.find(b => b.id === selectedBatchId) ?? null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">Back</Button>
        {loading ? (
          <div className="rounded-2xl border border-border/60 bg-card p-6 text-muted-foreground">Loading product...</div>
        ) : error ? (
          <div className="mb-6 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning">{error}</div>
        ) : (
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-center">
            <div className="w-full md:w-1/2 max-w-xl rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
              <div className="relative h-40 bg-muted/40 flex items-center justify-center mb-6">
                <div className="absolute left-3 top-3 h-3 w-3 rounded-full bg-destructive" />
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Leaf className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">{product ? product.name : ""}</h1>
              <p className="text-muted-foreground mb-4">Category: {product ? product.category : ""}</p>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Select Batch:</label>
                <select
                  className="w-full rounded-xl border px-3 py-2 text-sm bg-background text-foreground border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={selectedBatchId ?? ''}
                  onChange={e => setSelectedBatchId(Number(e.target.value))}
                  disabled={batches.length === 0}
                >
                  <option value="" disabled>Select a batch</option>
                  {batches
                    .slice()
                    .sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime())
                    .map(batch => (
                      <option key={batch.id} value={batch.id}>
                        Batch #{batch.id} (Expires: {new Date(batch.expiry_date).toLocaleDateString()})
                      </option>
                    ))}
                </select>
              </div>
              {selectedBatch && (
                <div className="mb-6">
                  <div className="mb-2 text-sm text-muted-foreground">Expiration Date: <span className="font-semibold text-foreground">{new Date(selectedBatch.expiry_date).toLocaleDateString()}</span></div>
                  <div className="mb-2 text-sm text-muted-foreground">Quantity: <span className="font-semibold text-foreground">{selectedBatch.quantity}</span></div>
                  <div className="mb-2 text-sm text-muted-foreground">Price: <span className="font-semibold text-foreground">₱{selectedBatch.base_price.toFixed(2)}</span></div>
                </div>
              )}
              <Button variant="hero" size="lg" disabled={!selectedBatch}>Order From This Batch</Button>
            </div>
            {/* Price history graph as a visually separated card beside the product card on desktop, below on mobile */}
            {selectedBatch && (
              <div className="w-full md:w-1/2 flex-shrink-0">
                <PriceHistoryGraph batchId={selectedBatch.id} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
