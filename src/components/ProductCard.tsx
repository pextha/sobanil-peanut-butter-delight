import { ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/products';
import { useCart } from '@/lib/cart';
import { Link } from 'react-router-dom';

import productClassicCreamy from '@/assets/product-classic-creamy.jpg';
import productCrunchy from '@/assets/product-crunchy.jpg';
import productOrganic from '@/assets/product-organic.jpg';
import productHoneyRoasted from '@/assets/product-honey-roasted.jpg';

const imageMap: Record<string, string> = {
  '/product-classic-creamy.jpg': productClassicCreamy,
  '/product-crunchy.jpg': productCrunchy,
  '/product-organic.jpg': productOrganic,
  '/product-honey-roasted.jpg': productHoneyRoasted
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const categoryColors = {
    creamy: 'bg-secondary text-secondary-foreground',
    crunchy: 'bg-accent text-accent-foreground',
    organic: 'bg-primary text-primary-foreground',
    flavored: 'bg-honey text-foreground'
  };

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-card">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={imageMap[product.image] || product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <Badge className={`absolute top-3 left-3 ${categoryColors[product.category]}`}>
          {product.category}
        </Badge>
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-2">
          <Button
            size="sm"
            className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
            onClick={() => addItem(product)}
            disabled={!product.inStock}
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
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-muted-foreground text-sm">{product.weight}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-primary">${product.price.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
