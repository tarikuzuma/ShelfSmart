import { Link } from "react-router-dom";
import { AuthenticationNavbar } from "@/components/AuthenticationNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";

export default function Login() {
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
								<ShieldCheck className="h-3 w-3 mr-1" />
								Unified access for all roles
							</Badge>
							<h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
								Welcome back to
								<span className="text-gradient-primary"> ShelfSmart</span>.
							</h1>
							<p className="text-muted-foreground text-lg max-w-xl">
								Log in with your email and password. After signing in, we’ll direct you to the
								right experience based on your role.
							</p>

							<div className="grid sm:grid-cols-2 gap-4">
								{["Retailer dashboard access", "Consumer marketplace", "Real-time inventory insights", "Savings & sustainability tracking"].map(
									(item) => (
										<div key={item} className="flex items-center gap-2 text-sm text-foreground">
											<ArrowRight className="h-4 w-4 text-primary" />
											{item}
										</div>
									)
								)}
							</div>

							<div className="flex items-center gap-4 pt-2">
								<Button variant="heroOutline" size="lg" asChild>
									<Link to="/signup">
										Create an account
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
									<h2 className="font-display text-2xl font-bold text-foreground">Sign in</h2>
									<p className="text-sm text-muted-foreground">Use the same login for all roles.</p>
								</div>
							</div>

							<form className="space-y-4">
								<label className="space-y-2 text-sm font-medium text-foreground">
									Email address
									<div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
										<Mail className="h-4 w-4 text-muted-foreground" />
										<input
											className="w-full bg-transparent text-sm outline-none"
											placeholder="you@company.com"
											type="email"
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
										/>
									</div>
								</label>

								<div className="flex items-center justify-between text-sm text-muted-foreground">
									<label className="inline-flex items-center gap-2">
										<input type="checkbox" className="mt-0.5" />
										Remember me
									</label>
									<Link to="#" className="text-foreground underline">
										Forgot password?
									</Link>
								</div>

								<Button variant="hero" size="lg" className="w-full">
									Sign in
									<ArrowRight className="h-4 w-4" />
								</Button>
							</form>

							<p className="text-sm text-muted-foreground mt-5 text-center">
								New to ShelfSmart? <Link to="/signup" className="text-foreground underline">Create an account</Link>.
							</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
