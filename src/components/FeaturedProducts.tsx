import { products } from '@/lib/products';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FeaturedProducts() {
  const featuredProducts = products.filter(p => p.featured);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-primary font-medium">Our Bestsellers</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 text-foreground">
            Featured Products
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Explore our most loved peanut butter varieties, crafted with premium ingredients
            for an unforgettable taste experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

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
