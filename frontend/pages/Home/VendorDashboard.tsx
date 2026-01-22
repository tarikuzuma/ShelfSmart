import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	BarChart3,
	Bell,
	CheckCircle,
	Clock,
	Leaf,
	Package,
	RefreshCw,
	Route,
	ShoppingBag,
	Store,
	TrendingUp,
	TriangleAlert,
} from "lucide-react";

type SalesPoint = { label: string; value: number };

const salesData: SalesPoint[] = [
	{ label: "Mon", value: 120 },
	{ label: "Tue", value: 180 },
	{ label: "Wed", value: 150 },
	{ label: "Thu", value: 220 },
	{ label: "Fri", value: 280 },
	{ label: "Sat", value: 260 },
	{ label: "Sun", value: 320 },
];

const inventoryByCategory = [
	{ label: "Produce", value: 420 },
	{ label: "Meat", value: 180 },
	{ label: "Dairy", value: 260 },
	{ label: "Bakery", value: 140 },
	{ label: "Ready-to-eat", value: 120 },
	{ label: "Snacks", value: 200 },
];

const productHighlights = [
	{
		name: "Organic Bananas",
		category: "Produce",
		image:
			"https://images.unsplash.com/photo-1574226516831-e1dff420e38e?auto=format&fit=crop&w=800&q=80",
		price: "₱40",
		original: "₱80",
		expires: "24 hours",
		discount: "50%",
		urgency: "urgent",
	},
	{
		name: "Sourdough Bread",
		category: "Bakery",
		image:
			"https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=80",
		price: "₱75",
		original: "₱150",
		expires: "2 days",
		discount: "45%",
		urgency: "near",
	},
	{
		name: "Ground Beef",
		category: "Meat",
		image:
			"https://images.unsplash.com/photo-1603048297172-c92544798d6a?auto=format&fit=crop&w=800&q=80",
		price: "₱200",
		original: "₱350",
		expires: "3 days",
		discount: "38%",
		urgency: "near",
	},
	{
		name: "Fresh Milk",
		category: "Dairy",
		image:
			"https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80",
		price: "₱85",
		original: "₱120",
		expires: "18 hours",
		discount: "30%",
		urgency: "urgent",
	},
];

const alerts = [
	{
		name: "Strawberry Pack 250g",
		action: "Promote 25% off",
		status: "High priority",
		time: "Expires in 10 hours",
	},
	{
		name: "Chicken Breast 1kg",
		action: "Auto-discount 20%",
		status: "Medium priority",
		time: "Expires in 1 day",
	},
	{
		name: "Greek Yogurt 500ml",
		action: "Bundle with granola",
		status: "Opportunity",
		time: "Expires in 2 days",
	},
];

function buildLinePath(data: SalesPoint[]) {
	const values = data.map((point) => point.value);
	const max = Math.max(...values);
	const min = Math.min(...values);
	const range = max - min || 1;
	const step = 100 / (data.length - 1);
	const points = data.map((point, index) => {
		const x = index * step;
		const y = 44 - ((point.value - min) / range) * 32;
		return `${x.toFixed(2)},${y.toFixed(2)}`;
	});
	const line = `M ${points.join(" L ")}`;
	const area = `${line} L 100 44 L 0 44 Z`;
	return { line, area };
}

export default function VendorDashboard() {
	const { line, area } = buildLinePath(salesData);
	const sold = 820;
	const spoilage = 120;
	const soldPercent = Math.round((sold / (sold + spoilage)) * 100);

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
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-warning/5" />
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
							<Button variant="heroOutline" size="lg">
								<ShoppingBag className="h-4 w-4" />
								Launch Promotions
							</Button>
						</div>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 pb-16">
				<section className="grid gap-6 lg:grid-cols-[1.2fr_1fr] -mt-8">
					<div className="grid gap-6">
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

						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{[
								{ label: "Total Items", value: "1,240", icon: Package, tone: "primary" },
								{ label: "Near-Expiry", value: "180", icon: Clock, tone: "warning" },
								{ label: "Urgent", value: "42", icon: TriangleAlert, tone: "destructive" },
								{ label: "Sold Today", value: "680", icon: ShoppingBag, tone: "primary" },
							].map((metric, index) => (
								<div
									key={metric.label}
									className="rounded-2xl border border-border/60 bg-card p-4 hover-lift animate-fade-in-up"
									style={{ animationDelay: `${0.1 + index * 0.05}s` }}
								>
									<div className="flex items-center justify-between">
										<p className="text-xs text-muted-foreground">{metric.label}</p>
										<div
											className={`h-9 w-9 rounded-xl flex items-center justify-center ${
												metric.tone === "warning"
													? "bg-warning/10"
													: metric.tone === "destructive"
													? "bg-destructive/10"
													: "bg-primary/10"
											}`}
										>
											<metric.icon
												className={`h-4 w-4 ${
													metric.tone === "warning"
														? "text-warning"
														: metric.tone === "destructive"
														? "text-destructive"
														: "text-primary"
												}`}
											/>
										</div>
									</div>
									<p className="mt-2 font-display text-2xl font-bold text-foreground">{metric.value}</p>
									<p className="text-xs text-muted-foreground">Updated 5 mins ago</p>
								</div>
							))}
						</div>
					</div>

					<div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm hover-lift">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs text-muted-foreground">AI Pricing Signals</p>
								<h3 className="font-display text-lg font-semibold">Dynamic Discount Queue</h3>
							</div>
							<Badge variant="secondary">12 Active</Badge>
						</div>
						<div className="mt-5 space-y-4">
							{alerts.map((alert) => (
								<div key={alert.name} className="rounded-2xl border border-border/60 bg-background p-4">
									<div className="flex items-start justify-between gap-4">
										<div>
											<p className="font-semibold text-foreground text-sm">{alert.name}</p>
											<p className="text-xs text-muted-foreground">{alert.action}</p>
										</div>
										<Badge variant="outline" className="text-xs">
											{alert.status}
										</Badge>
									</div>
									<div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
										<Clock className="h-3 w-3" />
										{alert.time}
									</div>
								</div>
							))}
						</div>
						<Button variant="hero" className="mt-6 w-full">
							Approve AI Suggestions
						</Button>
					</div>
				</section>

				<section id="insights" className="mt-12 grid gap-6 lg:grid-cols-3">
					<div className="rounded-3xl border border-border/60 bg-card p-6 hover-lift lg:col-span-2">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs text-muted-foreground">Sales Performance</p>
								<h3 className="font-display text-lg font-semibold">Daily Revenue Trend</h3>
							</div>
							<Badge variant="secondary">Last 7 Days</Badge>
						</div>
						<div className="mt-6 rounded-2xl bg-muted/40 p-4">
							<svg viewBox="0 0 100 48" className="h-40 w-full">
								<defs>
									<linearGradient id="salesGradient" x1="0" x2="0" y1="0" y2="1">
										<stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
										<stop offset="100%" stopColor="currentColor" stopOpacity="0" />
									</linearGradient>
								</defs>
								<path d={area} fill="url(#salesGradient)" className="text-primary" />
								<path d={line} fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
								{salesData.map((point, index) => {
									const x = (100 / (salesData.length - 1)) * index;
									const values = salesData.map((item) => item.value);
									const max = Math.max(...values);
									const min = Math.min(...values);
									const range = max - min || 1;
									const y = 44 - ((point.value - min) / range) * 32;
									return (
										<circle key={point.label} cx={x} cy={y} r={2.2} className="fill-primary" />
									);
								})}
							</svg>
							<div className="mt-4 flex justify-between text-xs text-muted-foreground">
								{salesData.map((point) => (
									<span key={point.label}>{point.label}</span>
								))}
							</div>
						</div>
					</div>

					<div className="rounded-3xl border border-border/60 bg-card p-6 hover-lift">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs text-muted-foreground">Spoilage Control</p>
								<h3 className="font-display text-lg font-semibold">Sold vs Spoilage</h3>
							</div>
							<Badge variant="secondary">Weekly</Badge>
						</div>
						<div className="mt-6 flex items-center justify-center">
							<div
								className="h-40 w-40 rounded-full"
								style={{
									background: `conic-gradient(var(--color-primary) 0 ${soldPercent}%, var(--color-warning) ${soldPercent}% 100%)`,
								}}
							/>
						</div>
						<div className="mt-6 space-y-2 text-sm">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Sold items</span>
								<span className="font-semibold text-foreground">{sold} ({soldPercent}%)</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Spoilage</span>
								<span className="font-semibold text-foreground">{spoilage} ({100 - soldPercent}%)</span>
							</div>
						</div>
					</div>
				</section>

				<section className="mt-8 grid gap-6 lg:grid-cols-2">
					<div className="rounded-3xl border border-border/60 bg-card p-6 hover-lift">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs text-muted-foreground">Inventory Depth</p>
								<h3 className="font-display text-lg font-semibold">Items by Category</h3>
							</div>
							<Badge variant="secondary">Live</Badge>
						</div>
						<div className="mt-6 space-y-3">
							{inventoryByCategory.map((item) => {
								const max = Math.max(...inventoryByCategory.map((entry) => entry.value));
								const width = (item.value / max) * 100;
								return (
									<div key={item.label} className="space-y-2">
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">{item.label}</span>
											<span className="font-semibold text-foreground">{item.value}</span>
										</div>
										<div className="h-2 rounded-full bg-muted">
											<div
												className="h-2 rounded-full bg-primary transition-all"
												style={{ width: `${width}%` }}
											/>
										</div>
									</div>
								);
							})}
						</div>
					</div>

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
					<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
						{productHighlights.map((product) => (
							<div key={product.name} className="rounded-2xl border border-border/60 bg-card overflow-hidden hover-lift">
								<div className="relative h-40">
									<img src={product.image} alt={product.name} className="h-full w-full object-cover" />
									<Badge className="absolute top-3 right-3" variant="secondary">
										{product.discount} OFF
									</Badge>
								</div>
								<div className="p-4">
									<p className="text-xs text-muted-foreground">{product.category}</p>
									<h4 className="font-display font-semibold text-foreground">{product.name}</h4>
									<div className="mt-2 flex items-center gap-2">
										<span className="font-semibold text-primary">{product.price}</span>
										<span className="text-xs text-muted-foreground line-through">{product.original}</span>
									</div>
									<div className="mt-3 flex items-center justify-between text-xs">
										<span className="text-muted-foreground">Expires in {product.expires}</span>
										<Badge variant={product.urgency === "urgent" ? "destructive" : "secondary"}>
											{product.urgency === "urgent" ? "Urgent" : "Near Expiry"}
										</Badge>
									</div>
								</div>
							</div>
						))}
					</div>
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
