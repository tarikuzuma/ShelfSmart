import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthenticationNavbar } from "@/components/AuthenticationNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	ArrowRight,
	Leaf,
	Lock,
	Mail,
} from "lucide-react";
import axios from "axios";

export default function Login() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await axios.post("http://localhost:8000/api/v1/auth/login", {
				email: formData.email,
				password: formData.password,
			});

			// Store user data in localStorage to indicate login
			if (response.data) {
				localStorage.setItem("token", "authenticated"); // Simple flag for now
				localStorage.setItem("user", JSON.stringify(response.data));
			}

			// Redirect based on role
			if (response.data.role === "RETAILER") {
				navigate("/retailer/dashboard");
			} else {
				navigate("/marketplace");
			}
		} catch (err: any) {
			setError(err.response?.data?.detail || "Invalid email or password.");
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
					<div className="max-w-md mx-auto">
						<div className="bg-card border border-border/60 rounded-3xl p-6 md:p-8 shadow-lg">
							<div className="text-center mb-6">
								<Badge variant="sustainability" className="mb-4">
									<Leaf className="h-3 w-3 mr-1" />
									Welcome back
								</Badge>
								<h2 className="font-display text-2xl font-bold text-foreground">Sign in to your account</h2>
								<p className="text-sm text-muted-foreground mt-2">Access your ShelfSmart dashboard</p>
							</div>

							{error && (
								<div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
									{error}
								</div>
							)}

							<form className="space-y-4" onSubmit={handleSubmit}>
								<label className="space-y-2 text-sm font-medium text-foreground">
									Email
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
											placeholder="Enter your password"
											type="password"
											required
											value={formData.password}
											onChange={(e) => setFormData({ ...formData, password: e.target.value })}
										/>
									</div>
								</label>

								<div className="flex items-center justify-between text-sm">
									<label className="flex items-center gap-2 text-muted-foreground">
										<input type="checkbox" />
										Remember me
									</label>
									<Link to="#" className="text-foreground underline hover:text-primary">
										Forgot password?
									</Link>
								</div>

								<Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
									{loading ? "Signing in..." : "Sign in"}
									<ArrowRight className="h-4 w-4" />
								</Button>
							</form>

							<p className="text-sm text-muted-foreground mt-5 text-center">
								Don't have an account? <Link to="/signup" className="text-foreground underline">Sign up</Link>.
							</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}

