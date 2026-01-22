import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Sparkles,
  Loader2,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "@/components/ui/toast";

type Product = {
  id: number;
  name: string;
  category: string | null;
};

type DailyForecast = {
  date: string;
  predicted_quantity: number;
};

type ForecastData = {
  product_id: number;
  product_name: string;
  category: string | null;
  forecast: {
    daily_forecast: DailyForecast[];
    restock_quantity: number;
    restock_date: string | null;
    risk_level: string;
    reasoning: string;
  };
  data_points_analyzed: number;
  average_daily_sales: number;
  model_used: string;
};

export default function DemandForecast() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [daysAhead, setDaysAhead] = useState<number>(7);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await api.get("/api/v1/products/");
        setProducts(response.data);
        if (response.data.length > 0) {
          setSelectedProductId(response.data[0].id);
        }
      } catch (err: any) {
        setError("Failed to load products");
        toast({
          title: "Error",
          description: "Failed to load products",
          type: "error",
        });
      } finally {
        setFetchingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  async function generateForecast() {
    if (!selectedProductId) {
      toast({
        title: "Select Product",
        description: "Please select a product first",
        type: "warning",
      });
      return;
    }

    setLoading(true);
    setError("");
    setForecastData(null);

    try {
      const response = await api.get(
        `/api/v1/ai/demand-forecast/${selectedProductId}?days_ahead=${daysAhead}`
      );
      setForecastData(response.data);
      toast({
        title: "Forecast Generated",
        description: `AI forecast generated for ${response.data.product_name}`,
        type: "success",
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail?.error ||
        err.response?.data?.detail ||
        "Failed to generate forecast";
      setError(errorMessage);
      toast({
        title: "Forecast Failed",
        description: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  function getRiskColor(riskLevel: string) {
    switch (riskLevel.toLowerCase()) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Prepare chart data
  const chartData =
    forecastData?.forecast.daily_forecast.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      predicted: item.predicted_quantity,
    })) || [];

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
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered Forecasting
              </Badge>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Demand Forecast Generator
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Use AI to predict future demand and optimize inventory management for your products.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          {/* CONTROLS */}
          <div className="bg-card border border-border/60 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Product Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Product
                </label>
                {fetchingProducts ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading products...
                  </div>
                ) : (
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Select a product...</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} {product.category && `(${product.category})`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Days Ahead Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Days Ahead
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={daysAhead}
                  onChange={(e) => setDaysAhead(Math.max(1, Math.min(30, Number(e.target.value))))}
                  className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Generate Button */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground opacity-0">
                  Action
                </label>
                <Button
                  variant="hero"
                  size="lg"
                  onClick={generateForecast}
                  disabled={loading || !selectedProductId || fetchingProducts}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Forecast
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* ERROR STATE */}
          {error && (
            <div className="mb-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-destructive">Forecast Error</p>
                  <p className="text-sm text-destructive/80 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* FORECAST RESULTS */}
          {forecastData && (
            <div className="space-y-6">
              {/* SUMMARY CARDS */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-card border border-border/60 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Restock Quantity</span>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {forecastData.forecast.restock_quantity}
                  </p>
                </div>

                <div className="bg-card border border-border/60 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Restock Date</span>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {formatDate(forecastData.forecast.restock_date)}
                  </p>
                </div>

                <div className="bg-card border border-border/60 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Risk Level</span>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Badge className={getRiskColor(forecastData.forecast.risk_level)}>
                    {forecastData.forecast.risk_level.toUpperCase()}
                  </Badge>
                </div>

                <div className="bg-card border border-border/60 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Avg Daily Sales</span>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {forecastData.average_daily_sales}
                  </p>
                </div>
              </div>

              {/* CHART */}
              {chartData.length > 0 && (
                <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Daily Demand Forecast
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Predicted demand for the next {daysAhead} days
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {forecastData.data_points_analyzed} data points
                    </Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: "12px" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        name="Predicted Demand"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* REASONING */}
              <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-bold text-foreground mb-2">
                      AI Reasoning
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {forecastData.forecast.reasoning}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/60 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Model: {forecastData.model_used}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {forecastData.data_points_analyzed} historical data points analyzed
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {!forecastData && !loading && !error && (
            <div className="bg-card border border-border/60 rounded-2xl p-12 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                Generate Your First Forecast
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Select a product and number of days, then click "Generate Forecast" to get AI-powered demand predictions.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
