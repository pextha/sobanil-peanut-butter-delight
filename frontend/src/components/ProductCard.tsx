import { ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useCart } from '@/lib/cart'; 

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
    weight?: string;
    inStock?: boolean;
    description?: string;
    flavor?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  // Safety checks
  const safeCategory = product.category || 'Standard';
  const safeFlavor = product.flavor || ''; // might be empty

  // Dynamic colors for Category
  const categoryColors: Record<string, string> = {
    'peanut butter': 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    'peanut cookies': 'bg-amber-100 text-amber-800 hover:bg-amber-200',
    'gift packs': 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    'standard': 'bg-slate-100 text-slate-800'
  };

  const badgeColor = categoryColors[safeCategory.toLowerCase()] || 'bg-slate-100 text-slate-800';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      weight: product.weight || '200g',
      category: safeCategory,
      description: product.description || '',
      inStock: product.inStock !== false
    });
    
    toast.success(`Added ${product.name} to cart`);
  };

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-card h-full flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        
        {/* --- LEFT SIDE: CATEGORY (Smaller) --- */}
        <Badge 
          className={`absolute top-2 left-2 shadow-sm text-[10px] px-2 h-5 flex items-center justify-center pointer-events-none ${badgeColor}`}
        >
          {safeCategory}
        </Badge>

        {/* --- RIGHT SIDE: FLAVOR (Smaller) --- */}
        {safeFlavor && (
          <Badge 
            variant="secondary"
            className="absolute top-2 right-2 shadow-sm bg-black/70 text-white hover:bg-black/80 backdrop-blur-sm text-[10px] px-2 h-5 flex items-center justify-center pointer-events-none"
          >
            {safeFlavor}
          </Badge>
        )}

        {/* Out of Stock Overlay */}
        {product.inStock === false && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
            <Badge variant="destructive" className="text-sm px-3 py-1">Out of Stock</Badge>
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-2 z-20">
          <Button
            size="sm"
            className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
            onClick={handleAddToCart}
            disabled={product.inStock === false}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75"
            asChild
          >
            <Link to={`/product/${product.id}`}>
              <Eye className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-muted-foreground text-sm">{product.weight || '200g'}</p>
          </div>
          <div className="text-right whitespace-nowrap">
            <p className="font-bold text-lg text-primary">
              LKR {product.price.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}