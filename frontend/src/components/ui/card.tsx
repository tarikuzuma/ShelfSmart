import * as React from "react";

export function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border border-border/60 bg-card shadow-sm ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = "" }) {
  return <div className={`px-6 py-4 border-b border-border/60 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
  return <h4 className={`font-semibold text-lg text-foreground ${className}`}>{children}</h4>;
}

export function CardContent({ children, className = "" }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardDescription({ children, className = "" }) {
  return <p className={`text-muted-foreground text-sm ${className}`}>{children}</p>;
}
