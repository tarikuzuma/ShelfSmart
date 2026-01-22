import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthenticationNavbar } from "@/components/AuthenticationNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	ArrowRight,
	Building2,
	CheckCircle,
	ClipboardList,
	Leaf,
	Lock,
	Mail,
	MapPin,
	Phone,
	User,
} from "lucide-react";
import axios from "axios";

export default function Signup() {
	const [role, setRole] = useState<"CONSUMER" | "RETAILER">("CONSUMER");
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		phone: "",
		email: "",
		password: "",
		city: "",
		preferredStore: "",
		supermarket: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const name = `${formData.firstName} ${formData.lastName}`.trim();
			const response = await axios.post("http://localhost:8000/api/v1/auth/signup", {
				name,
				email: formData.email,
				password: formData.password,
				role: role,
			});

			// Redirect based on role
			if (role === "RETAILER") {
				navigate("/retailer/dashboard");
			} else {
				navigate("/marketplace");
			}
		} catch (err: any) {
			setError(err.response?.data?.detail || "Signup failed. Please check your details.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background">
			<AuthenticationNavbar />

			<section className="relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-warning/5" />
				<div className="absolute top-16 left-6 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
				<div className="absolute bottom-10 right-8 w-80 h-80 bg-warning/10 rounded-full blur-3xl" />

				<div className="container relative mx-auto px-4 py-12 md:py-20">
					<div className="grid lg:grid-cols-2 gap-10 items-center">
						<div className="space-y-6">
							<Badge variant="sustainability" className="animate-fade-in">
								<Leaf className="h-3 w-3 mr-1" />
								Get started in minutes
							</Badge>
							<h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
								Build a smarter,
								<span className="text-gradient-primary"> waste-free</span> future.
							</h1>
							<p className="text-muted-foreground text-lg max-w-xl">
								Create your ShelfSmart account to unlock AI-driven insights, automate pricing,
								and connect with sustainability-first consumers.
							</p>

							<div className="grid sm:grid-cols-2 gap-4">
								{[
									"AI spoilage forecasting",
									"Dynamic markdowns",
									"Real-time inventory alerts",
									"Sustainability reporting",
								].map((item) => (
									<div key={item} className="flex items-center gap-2 text-sm text-foreground">
										<CheckCircle className="h-4 w-4 text-primary" />
										{item}
									</div>
								))}
							</div>

							<div className="flex items-center gap-4 pt-2">
								<Button variant="heroOutline" size="lg" asChild>
									<Link to="/marketplace">
										Explore Marketplace
										<ArrowRight className="h-4 w-4" />
									</Link>
								</Button>
								<Button variant="ghost" size="lg" asChild>
									<Link to="/">Back to Home</Link>
								</Button>
							</div>
						</div>

						<div className="bg-card border border-border/60 rounded-3xl p-6 md:p-8 shadow-lg">
							<div className="flex items-center justify-between mb-6">
								<div>
									<h2 className="font-display text-2xl font-bold text-foreground">Create your account</h2>
									<p className="text-sm text-muted-foreground">Start optimizing your perishable workflow today.</p>
								</div>
								<div className="hidden sm:flex w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center">
									<Building2 className="h-6 w-6 text-primary" />
								</div>
							</div>

							<div className="grid sm:grid-cols-2 gap-3 mb-6">
								<button
									onClick={() => setRole("CONSUMER")}
									className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
										role === "CONSUMER"
											? "border-primary bg-primary/10"
											: "border-border/60 hover:border-primary/50"
									}`}
									type="button"
								>
									<div>
										<p className="font-semibold text-foreground">Customer</p>
										<p className="text-xs text-muted-foreground">Shop near-expiry deals</p>
									</div>
									<Badge variant={role === "CONSUMER" ? "sustainability" : "secondary"}>Standard</Badge>
								</button>
								<button
									onClick={() => setRole("RETAILER")}
									className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
										role === "RETAILER"
											? "border-primary bg-primary/10"
											: "border-border/60 hover:border-primary/50"
									}`}
									type="button"
								>
									<div>
										<p className="font-semibold text-foreground">Retailer</p>
										<p className="text-xs text-muted-foreground">Manage store inventory</p>
									</div>
									<Badge variant={role === "RETAILER" ? "sustainability" : "secondary"}>Pro</Badge>
								</button>
							</div>

							{error && (
								<div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
									{error}
								</div>
							)}

							<form className="space-y-4" onSubmit={handleSubmit}>
								<div className="grid md:grid-cols-2 gap-4">
									<label className="space-y-2 text-sm font-medium text-foreground">
										First name
										<div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
											<User className="h-4 w-4 text-muted-foreground" />
											<input
												className="w-full bg-transparent text-sm outline-none"
												placeholder="Ariana"
												type="text"
												required
												value={formData.firstName}
												onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
											/>
										</div>
									</label>
									<label className="space-y-2 text-sm font-medium text-foreground">
										Last name
										<div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
											<User className="h-4 w-4 text-muted-foreground" />
											<input
												className="w-full bg-transparent text-sm outline-none"
												placeholder="Lopez"
												type="text"
												required
												value={formData.lastName}
												onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
											/>
										</div>
									</label>
								</div>

								<label className="space-y-2 text-sm font-medium text-foreground">
									Phone number
									<div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<input
											className="w-full bg-transparent text-sm outline-none"
											placeholder="+63 900 000 0000"
											type="tel"
											value={formData.phone}
											onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
										/>
									</div>
								</label>

								<label className="space-y-2 text-sm font-medium text-foreground">
									Work email
									<div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
										<Mail className="h-4 w-4 text-muted-foreground" />
										<input
											className="w-full bg-transparent text-sm outline-none"
											placeholder="you@company.com"
											type="email"
											required
											value={formData.email}
											onChange={(e) => setFormData({ ...formData, email: e.target.value })}
										/>
									</div>
								</label>

								<label className="space-y-2 text-sm font-medium text-foreground">
									Password
									<div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
										<Lock className="h-4 w-4 text-muted-foreground" />
										<input
											className="w-full bg-transparent text-sm outline-none"
											placeholder="Create a secure password"
											type="password"
											required
											value={formData.password}
											onChange={(e) => setFormData({ ...formData, password: e.target.value })}
										/>
									</div>
								</label>

								{role === "CONSUMER" ? (
									<div className="grid md:grid-cols-2 gap-4">
										<label className="space-y-2 text-sm font-medium text-foreground">
											City / Area
											<div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
												<MapPin className="h-4 w-4 text-muted-foreground" />
												<input
													className="w-full bg-transparent text-sm outline-none"
													placeholder="Metro Manila"
													type="text"
													value={formData.city}
													onChange={(e) => setFormData({ ...formData, city: e.target.value })}
												/>
											</div>
										</label>
										<label className="space-y-2 text-sm font-medium text-foreground">
											Preferred store
											<div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
												<ClipboardList className="h-4 w-4 text-muted-foreground" />
												<input
													className="w-full bg-transparent text-sm outline-none"
													placeholder="Green Grocer"
													type="text"
													value={formData.preferredStore}
													onChange={(e) => setFormData({ ...formData, preferredStore: e.target.value })}
												/>
											</div>
										</label>
									</div>
								) : (
									<label className="space-y-2 text-sm font-medium text-foreground">
										Select your supermarket
										<div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
											<Building2 className="h-4 w-4 text-muted-foreground" />
											<select 
												className="w-full bg-transparent text-sm outline-none"
												value={formData.supermarket}
												onChange={(e) => setFormData({ ...formData, supermarket: e.target.value })}
											>
												<option value="">Select supermarket</option>
												<option>FreshPath Central</option>
												<option>Harvest Market Downtown</option>
												<option>Urban Grocer South</option>
												<option>Evergreen Hypermart</option>
											</select>
										</div>
									</label>
								)}

								<div className="flex items-start gap-2 text-sm text-muted-foreground">
									<input type="checkbox" className="mt-1" required />
									<span>
										I agree to the <Link to="#" className="text-foreground underline">Terms</Link> and
										<Link to="#" className="text-foreground underline ml-1">Privacy Policy</Link>.
									</span>
								</div>

								<Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
									{loading ? "Creating account..." : role === "RETAILER" ? "Continue to dashboard" : "Create account"}
									<ArrowRight className="h-4 w-4" />
								</Button>
							</form>

							<p className="text-sm text-muted-foreground mt-5 text-center">
								Already have an account? <Link to="/login" className="text-foreground underline">Sign in</Link>.
							</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}

