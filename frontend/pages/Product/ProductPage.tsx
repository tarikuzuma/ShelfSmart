import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
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

  const selectedBatch = batches.find(b => b.id === selectedBatchId);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">Back</Button>
        {loading ? (
          <div className="rounded-2xl border border-border/60 bg-card p-6 text-muted-foreground">Loading product...</div>
        ) : error ? (
          <div className="mb-6 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning">{error}</div>
        ) : (
          <div className="max-w-xl mx-auto rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">{product.name}</h1>
            <p className="text-muted-foreground mb-4">Category: {product.category}</p>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Select Batch:</label>
              <div className="flex gap-2 flex-wrap">
                {batches.map(batch => (
                  <button
                    key={batch.id}
                    className={`rounded-xl border px-3 py-2 text-sm ${selectedBatchId === batch.id ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setSelectedBatchId(batch.id)}
                  >
                    Batch #{batch.id} ({new Date(batch.expiry_date).toLocaleDateString()})
                  </button>
                ))}
              </div>
            </div>
            {selectedBatch && (
              <div className="mb-6">
                <div className="mb-2 text-sm text-muted-foreground">Expiration Date: <span className="font-semibold text-foreground">{new Date(selectedBatch.expiry_date).toLocaleDateString()}</span></div>
                <div className="mb-2 text-sm text-muted-foreground">Quantity: <span className="font-semibold text-foreground">{selectedBatch.quantity}</span></div>
                <div className="mb-2 text-sm text-muted-foreground">Price: <span className="font-semibold text-foreground">₱{selectedBatch.base_price.toFixed(2)}</span></div>
              </div>
            )}
            <Button variant="hero" size="lg" disabled={!selectedBatch}>Order This Batch</Button>
          </div>
        )}
      </div>
    </div>
  );
}
