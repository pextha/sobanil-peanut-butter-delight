import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Product {
  _id: string; // MongoDB uses _id
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  weight?: string;
  rating?: number; // Add rating support
}

export function FeaturedProducts() {
  // Fetch Top 4 Rated Products from Backend
  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ['topProducts'],
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/products/top');
      return data;
    },
  });

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-primary font-medium">Customer Favorites</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 text-foreground">
            Top Rated Products
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Explore our highest-rated peanut butter varieties, loved by customers for their taste and quality.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts?.map((product, index) => (
              <div
                key={product._id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Map MongoDB _id to id for ProductCard */}
                <ProductCard
                  product={{
                    id: product._id,
                    name: product.name,
                    price: product.price,
                    image: product.imageUrl,
                    category: product.category,
                    weight: product.weight,
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg">
            <Link to="/shop">
              View All Products
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}