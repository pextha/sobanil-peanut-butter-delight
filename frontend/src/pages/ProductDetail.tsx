import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart, Truck, Shield, Heart, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query'; // Import Query Hook
import api from '@/lib/api'; // Import API helper
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/lib/cart';
import { toast } from 'sonner';

// Define Interface matching your Database
interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  description: string;
  countInStock: number;
  weight: string;
  flavor: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  // 1. FETCH PRODUCT DYNAMICALLY
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get<Product>(`/products/${id}`);
      return data;
    },
    enabled: !!id, // Only run if ID is present
  });

  // 2. LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  // 3. ERROR / NOT FOUND STATE
  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Product not found</h1>
          <Button asChild className="mt-4">
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </div>
        <Footer />
        <CartDrawer />
      </div>
    );
  }

  // Helper to handle adding to cart with correct data structure
  const handleAddToCart = () => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      weight: product.weight || '200g',
      category: product.category,
      description: product.description,
      inStock: product.countInStock > 0
    }, quantity);
    
    toast.success(`Added ${quantity} x ${product.name} to cart`);
    setQuantity(1);
  };

  const isOutOfStock = product.countInStock === 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/shop">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-card rounded-2xl overflow-hidden shadow-lg relative group">
            <img
              src={product.imageUrl || '/placeholder.svg'}
              alt={product.name}
              className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                 <Badge variant="destructive" className="text-lg px-4 py-2">Out of Stock</Badge>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex gap-2 mb-2">
                <Badge variant="secondary">
                  {product.category}
                </Badge>
                {product.flavor && (
                  <Badge variant="outline">
                    {product.flavor}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {product.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-primary">
                LKR {product.price.toLocaleString()}
              </span>
              <span className="text-muted-foreground">/ {product.weight || '200g'}</span>
            </div>

            <p className="text-muted-foreground text-lg leading-relaxed">
              {product.description}
            </p>

            <Separator />

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-medium text-foreground">Quantity:</span>
              <div className="flex items-center gap-3 bg-muted rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={isOutOfStock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Stock Status Text */}
              {isOutOfStock ? (
                <span className="text-red-500 font-medium text-sm">Out of Stock</span>
              ) : (
                <span className="text-green-600 font-medium text-sm">{product.countInStock} Available</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Truck className="w-5 h-5 text-primary" />
                <span>Free shipping over LKR 5,000</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="w-5 h-5 text-primary" />
                <span>Freshness Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default ProductDetail;