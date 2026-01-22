import { Badge } from "@/components/ui/badge";

interface ProductHighlight {
  name: string;
  category: string;
  image: string;
  price: string;
  original: string;
  expires: string;
  discount: string;
  urgency: string;
}

interface ProductHighlightsProps {
  products: ProductHighlight[];
}

export function ProductHighlights({ products }: ProductHighlightsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {products.map((product) => (
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
  );
}
