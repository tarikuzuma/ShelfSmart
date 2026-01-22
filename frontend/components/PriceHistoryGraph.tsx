import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function PriceHistoryGraph({ batchId }) {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPrices() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/api/v1/product-prices/?product_batch_id=${batchId}`);
        setPrices(res.data);
      } catch (err) {
        setError("Failed to load price history.");
      } finally {
        setLoading(false);
      }
    }
    if (batchId) fetchPrices();
  }, [batchId]);

  if (!batchId) return null;
  if (loading) return <div className="text-muted-foreground">Loading price history...</div>;
  if (error) return <div className="text-warning">{error}</div>;
  if (prices.length === 0) return <div className="text-muted-foreground">No price history available.</div>;

  // Prepare data for graph
  const data = prices.map(p => ({
    date: new Date(p.date).toLocaleDateString(),
    price: p.discounted_price
  }));

  // Simple SVG line graph
  const width = 320;
  const height = 120;
  const margin = 30;
  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const priceRange = maxPrice - minPrice || 1;
  const points = data.map((d, i) => {
    const x = margin + (i * (width - 2 * margin)) / (data.length - 1 || 1);
    const y = height - margin - ((d.price - minPrice) * (height - 2 * margin)) / priceRange;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="mt-6">
      <h4 className="font-semibold mb-2 text-foreground">Price History</h4>
      <svg width={width} height={height} className="w-full">
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          points={points}
        />
        {/* Axes */}
        <line x1={margin} y1={height-margin} x2={width-margin} y2={height-margin} stroke="#888" />
        <line x1={margin} y1={margin} x2={margin} y2={height-margin} stroke="#888" />
        {/* Price labels */}
        <text x={margin} y={margin-8} fontSize="12" fill="#888">₱{maxPrice.toFixed(2)}</text>
        <text x={margin} y={height-margin+16} fontSize="12" fill="#888">₱{minPrice.toFixed(2)}</text>
        {/* Date labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={margin + (i * (width - 2 * margin)) / (data.length - 1 || 1)}
            y={height - margin + 16}
            fontSize="10"
            fill="#888"
            textAnchor="middle"
          >
            {d.date}
          </text>
        ))}
      </svg>
    </div>
  );
}
