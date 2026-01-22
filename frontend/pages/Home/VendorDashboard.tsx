import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { BarChart3, Bell, CheckCircle, Clock, Leaf, Package, RefreshCw, Route, ShoppingBag, Store, TrendingUp, TriangleAlert } from "lucide-react";

import { SoldVsSpoilage } from "@/components/vendordashboard/SoldVsSpoilage";
import { InventoryByCategory } from "@/components/vendordashboard/InventoryByCategory";
import { AlertsList } from "@/components/vendordashboard/AlertsList";
import { SalesPerformanceChart } from "@/components/vendordashboard/SalesPerformanceChart";
import { ProductInventoryTable } from "@/components/vendordashboard/ProductInventoryTable";
import { useEffect, useState } from "react";
import api from "@/lib/api";



export default function VendorDashboard() {
	const [products, setProducts] = useState<any[]>([]);
	const [batches, setBatches] = useState<any[]>([]);
	const [inventories, setInventories] = useState<any[]>([]);
	const [orders, setOrders] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		async function fetchAll() {
			setLoading(true);
			setError("");
			try {
				const [prodRes, batchRes, invRes, orderRes] = await Promise.all([
					api.get(`/api/v1/products/`),
					api.get(`/api/v1/product-batches/`),
					api.get(`/api/v1/inventories/`),
					api.get(`/api/v1/orders/`),
				]);
				setProducts(prodRes.data);
				setBatches(batchRes.data);
				setInventories(invRes.data);
				setOrders(orderRes.data);
			} catch (err) {
				setError("Failed to load dashboard data");
			} finally {
				setLoading(false);
			}
		}
		fetchAll();
	}, []);

	// Inventory by category
	const inventoryByCategory = (() => {
		const catMap: Record<string, number> = {};
		products.forEach((p) => {
			const invs = inventories.filter((i) => i.product_id === p.id);
			const latest = invs.reduce((a, b) => (a && a.date > b.date ? a : b), null);
			if (latest) {
				catMap[p.category || "Uncategorized"] = (catMap[p.category || "Uncategorized"] || 0) + latest.quantity;
			}
		});
		return Object.entries(catMap).map(([label, value]) => ({ label, value }));
	})();

	// Sold and spoilage (estimate: sold from orders, spoilage from expired batches)
	const sold = orders.reduce((sum: number, order: any) => sum + order.items.reduce((s: number, i: any) => s + i.quantity, 0), 0);
	const now = new Date();
	const spoilage = batches.filter(b => new Date(b.expiry_date) < now).reduce((sum, b) => sum + b.quantity, 0);

	// Sales data (last 7 days revenue)
	const salesByDay: Record<string, number> = {};
	orders.forEach(order => {
		const d = new Date(order.date);
		const label = d.toLocaleDateString(undefined, { weekday: 'short' });
		salesByDay[label] = (salesByDay[label] || 0) + order.total_price;
	});
	const weekDays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
	const todayIdx = new Date().getDay();
	const last7 = Array.from({length: 7}, (_, i) => (todayIdx - 6 + i + 7) % 7);
	const salesData = last7.map(idx => {
		const label = weekDays[idx];
		return { label, value: salesByDay[label] || 0 };
	});

	// Alerts (expiring soon)
	const alerts = batches
		.filter(b => {
			const days = (new Date(b.expiry_date).getTime() - now.getTime()) / (1000*60*60*24);
			return days >= 0 && days <= 3;
		})
		.map(b => {
			const product = products.find(p => p.id === b.product_id);
			return {
				name: product ? product.name : `Batch #${b.id}`,
				action: `Expires in ${Math.ceil((new Date(b.expiry_date).getTime() - now.getTime())/(1000*60*60*24))} days`,
				status: "High priority",
				time: `Expires on ${new Date(b.expiry_date).toLocaleDateString()}`,
			};
		});



	if (loading) {
		return <div className="flex items-center justify-center h-screen text-lg text-muted-foreground">Loading dashboard...</div>;
	}
	if (error) {
		return <div className="flex items-center justify-center h-screen text-lg text-red-600">{error}</div>;
	}

	return (
		<div className="min-h-screen bg-background">
			<nav className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
				<div className="container mx-auto flex h-16 items-center justify-between px-4">
					<Logo />
					<div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
						<Link to="/marketplace" className="hover:text-foreground transition-colors">
							Marketplace
						</Link>
						<Link to="/dashboard" className="hover:text-foreground transition-colors">
							Vendor Dashboard
						</Link>
						<Link to="#insights" className="hover:text-foreground transition-colors">
							Insights
						</Link>
					</div>
					<div className="flex items-center gap-3">
						<Button variant="ghost" size="sm">
							<Bell className="h-4 w-4" />
							Alerts
						</Button>
						<Button variant="hero" size="sm">
							<RefreshCw className="h-4 w-4" />
							Sync Data
						</Button>
					</div>
				</div>
			</nav>

			<header className="relative overflow-hidden">
				<div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-warning/5" />
				<div className="container relative mx-auto px-4 py-10 md:py-14">
					<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
						<div>
							<Badge variant="sustainability" className="mb-3 animate-fade-in">
								<Leaf className="h-3 w-3 mr-1" />
								AI Operations Control Center
							</Badge>
							<h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
								FreshPath Market Vendor Dashboard
							</h1>
							<p className="mt-2 max-w-2xl text-muted-foreground">
								Monitor real-time perishable performance, dynamic pricing, and sustainability outcomes
								in one unified retail command center.
							</p>
						</div>
						<div className="flex flex-wrap gap-3">
							<Button variant="hero" size="lg">
								<TrendingUp className="h-4 w-4" />
								View Weekly Report
							</Button>
							<Link to="/retailer/products">
								<Button variant="heroOutline" size="lg">
									<ShoppingBag className="h-4 w-4" />
									View Products List
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 pb-16">
				<section className="grid gap-6 lg:grid-cols-[1.2fr_1fr] -mt-8">
					<div className="grid gap-6">
						{/* Metrics and AI Pricing Alerts */}
						{/* TODO: Replace with API-driven metrics */}
						<div className="grid gap-4 md:grid-cols-3">
							<div className="rounded-2xl border border-border/60 bg-card p-5 hover-lift animate-fade-in-up">
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
										<Store className="h-5 w-5 text-primary" />
									</div>
									<div>
										<p className="text-xs text-muted-foreground">Retailer</p>
										<p className="font-display font-semibold text-foreground">FreshPath Supermarket</p>
									</div>
								</div>
								<div className="mt-4 text-sm text-muted-foreground">
									<div>Taguig City, Metro Manila</div>
									<div>Type: Premium Grocery Chain</div>
								</div>
							</div>
							<div className="rounded-2xl border border-border/60 bg-card p-5 hover-lift animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
										<TriangleAlert className="h-5 w-5 text-warning" />
									</div>
									<div>
										<p className="text-xs text-muted-foreground">Urgent Alerts</p>
										<p className="font-display text-2xl font-bold text-foreground">12</p>
									</div>
								</div>
								<p className="mt-3 text-sm text-muted-foreground">
									4 items require immediate markdowns today.
								</p>
							</div>
							<div className="rounded-2xl border border-border/60 bg-card p-5 hover-lift animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
										<CheckCircle className="h-5 w-5 text-primary" />
									</div>
									<div>
										<p className="text-xs text-muted-foreground">AI Compliance</p>
										<p className="font-display text-2xl font-bold text-foreground">96%</p>
									</div>
								</div>
								<p className="mt-3 text-sm text-muted-foreground">
									Discount automation is active and stable.
								</p>
							</div>
						</div>

						{/* Metrics Cards (static for now) */}
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{/* Real metrics from API */}
							<div className="rounded-2xl border border-border/60 bg-card p-4 hover-lift animate-fade-in-up">
								<div className="flex items-center justify-between">
									<p className="text-xs text-muted-foreground">Total Items</p>
									<div className="h-9 w-9 rounded-xl flex items-center justify-center bg-primary/10">
										<Package className="h-4 w-4 text-primary" />
									</div>
								</div>
								<p className="mt-2 font-display text-2xl font-bold text-foreground">{products.length}</p>
								<p className="text-xs text-muted-foreground">Updated now</p>
							</div>
							<div className="rounded-2xl border border-border/60 bg-card p-4 hover-lift animate-fade-in-up">
								<div className="flex items-center justify-between">
									<p className="text-xs text-muted-foreground">Near-Expiry</p>
									<div className="h-9 w-9 rounded-xl flex items-center justify-center bg-warning/10">
										<Clock className="h-4 w-4 text-warning" />
									</div>
								</div>
								<p className="mt-2 font-display text-2xl font-bold text-foreground">{batches.filter(b => {
									const days = (new Date(b.expiry_date).getTime() - now.getTime()) / (1000*60*60*24);
									return days >= 0 && days <= 7;
								}).length}</p>
								<p className="text-xs text-muted-foreground">Next 7 days</p>
							</div>
							<div className="rounded-2xl border border-border/60 bg-card p-4 hover-lift animate-fade-in-up">
								<div className="flex items-center justify-between">
									<p className="text-xs text-muted-foreground">Urgent</p>
									<div className="h-9 w-9 rounded-xl flex items-center justify-center bg-destructive/10">
										<TriangleAlert className="h-4 w-4 text-destructive" />
									</div>
								</div>
								<p className="mt-2 font-display text-2xl font-bold text-foreground">{batches.filter(b => {
									const days = (new Date(b.expiry_date).getTime() - now.getTime()) / (1000*60*60*24);
									return days >= 0 && days <= 3;
								}).length}</p>
								<p className="text-xs text-muted-foreground">Next 3 days</p>
							</div>
							<div className="rounded-2xl border border-border/60 bg-card p-4 hover-lift animate-fade-in-up">
								<div className="flex items-center justify-between">
									<p className="text-xs text-muted-foreground">Sold Today</p>
									<div className="h-9 w-9 rounded-xl flex items-center justify-center bg-primary/10">
										<ShoppingBag className="h-4 w-4 text-primary" />
									</div>
								</div>
								<p className="mt-2 font-display text-2xl font-bold text-foreground">{orders.filter(o => {
									const d = new Date(o.date);
									const today = new Date();
									return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
								}).reduce((sum: number, o: any) => sum + o.items.reduce((s: number, i: any) => s + i.quantity, 0), 0)}</p>
								<p className="text-xs text-muted-foreground">Today</p>
							</div>
						</div>
					</div>

					{/* AI Pricing Alerts (modular component) */}
					<div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm hover-lift">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs text-muted-foreground">AI Pricing Signals</p>
								<h3 className="font-display text-lg font-semibold">Dynamic Discount Queue</h3>
							</div>
							<Badge variant="secondary">12 Active</Badge>
						</div>
						<AlertsList alerts={alerts} />
						<Button variant="hero" className="mt-6 w-full">
							Approve AI Suggestions
						</Button>
					</div>
				</section>

				<section id="insights" className="mt-12 grid gap-6 lg:grid-cols-3">
					<div className="lg:col-span-2">
						<SalesPerformanceChart data={salesData} />
					</div>
					<div>
						<SoldVsSpoilage sold={sold} spoilage={spoilage} />
					</div>
				</section>

				<section className="mt-8 grid gap-6 lg:grid-cols-2">
					  <InventoryByCategory data={inventoryByCategory} />
					<div className="rounded-3xl border border-border/60 bg-card p-6 hover-lift">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs text-muted-foreground">Forecast Alerts</p>
								<h3 className="font-display text-lg font-semibold">Inventory Risk Radar</h3>
							</div>
							<Badge variant="secondary">Next 14 Days</Badge>
						</div>
						<div className="mt-6 space-y-4">
							{[
								{ label: "Leafy greens", note: "Shortage likely in 3 days", level: "warning" },
								{ label: "Prepared meals", note: "Overstock risk in 4 days", level: "primary" },
								{ label: "Dairy", note: "Stable supply, demand rising", level: "primary" },
							].map((item) => (
								<div key={item.label} className="rounded-2xl border border-border/60 bg-background p-4">
									<div className="flex items-center justify-between">
										<p className="font-semibold text-foreground text-sm">{item.label}</p>
										<Badge variant={item.level === "warning" ? "destructive" : "secondary"}>
											{item.level === "warning" ? "Risk" : "Stable"}
										</Badge>
									</div>
									<p className="mt-2 text-xs text-muted-foreground">{item.note}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="mt-10">
					<div className="flex items-center justify-between mb-4">
						<div>
							<p className="text-xs text-muted-foreground">Live Catalog</p>
							<h3 className="font-display text-xl font-semibold">What You’re Selling</h3>
						</div>
						<Button variant="heroOutline" size="sm">
							<Package className="h-4 w-4" />
							Manage Inventory
						</Button>
					</div>
					{/* Replace static highlights with real inventory table */}
					<ProductInventoryTable />
				</section>

				<section className="mt-12 grid gap-6 lg:grid-cols-3">
					<div className="rounded-3xl border border-border/60 bg-card p-6 hover-lift">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
								<Leaf className="h-5 w-5 text-primary" />
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Sustainability Impact</p>
								<p className="font-display text-2xl font-bold text-foreground">2,180 kg</p>
							</div>
						</div>
						<p className="mt-3 text-sm text-muted-foreground">
							Food waste saved this month, equivalent to 3,200 meals.
						</p>
					</div>

					<div className="rounded-3xl border border-border/60 bg-card p-6 hover-lift">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
								<Route className="h-5 w-5 text-warning" />
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Logistics Insight</p>
								<p className="font-display text-2xl font-bold text-foreground">14 min</p>
							</div>
						</div>
						<p className="mt-3 text-sm text-muted-foreground">
							Shortest delivery route suggests North Hub → Market A → Market B.
						</p>
					</div>

					<div className="rounded-3xl border border-border/60 bg-card p-6 hover-lift">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
								<BarChart3 className="h-5 w-5 text-primary" />
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Pending Deliveries</p>
								<p className="font-display text-2xl font-bold text-foreground">8</p>
							</div>
						</div>
						<p className="mt-3 text-sm text-muted-foreground">
							3 inbound shipments have AI-guided freshness priority.
						</p>
					</div>
				</section>
			</main>
		</div>
	);
}
