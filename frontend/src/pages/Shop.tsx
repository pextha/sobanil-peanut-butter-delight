import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query'; // Import Query Hook
import api from '@/lib/api'; // Import your API helper
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { ProductCard } from '@/components/ProductCard';
import { categories } from '@/lib/products'; // Keep categories for the sidebar
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

// Define what your Database Product looks like
interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  flavor: string;
  description: string;
  category: string;
  countInStock: number;
}

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. FETCH DATA: Get products from your Backend
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/products');
      return data;
    },
  });

  // 2. FILTER DATA: Filter the LIVE data from the backend
  const filteredProducts = useMemo(() => {
    // If data hasn't loaded yet, return empty array
    if (!products) return [];

    return products.filter((product: Product) => {
      // Note: Make sure your Backend "category" matches these IDs (creamy, crunchy, etc.)
      // Or you can filter by "flavor" if that matches better!
      const matchesCategory = selectedCategory === 'all' || 
                              product.category.toLowerCase() === selectedCategory || 
                              product.flavor.toLowerCase() === selectedCategory;

      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, products]);

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4 text-foreground">Categories</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'w-full text-left px-4 py-2 rounded-lg text-sm transition-colors',
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Our Products</h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Explore our complete range of premium peanut butter, from classic creamy 
            to unique flavored varieties.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Mobile Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-card">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterSidebar />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-card rounded-xl p-6 shadow-md border border-border">
              <FilterSidebar />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* LOADING STATE: Show Spinner while fetching */}
            {isLoading ? (
               <div className="flex justify-center py-20">
                 <Loader2 className="h-10 w-10 animate-spin text-primary" />
               </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                Failed to load products. Is the backend running?
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found matching your criteria.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <div
                    // IMPORTANT: MongoDB uses '_id', not 'id'
                    key={product._id} 
                    className="animate-scale-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* We pass the whole product. 
                        Make sure ProductCard can handle '_id' or map it if needed. 
                        Most likely, your ProductCard expects 'id', so we might need a small fix there 
                        if it breaks. For now, I'm passing 'product' directly.
                    */}
                    {/* @ts-ignore - Ignoring type mismatch for id/_id for now to keep it working */}
                    <ProductCard product={{...product, id: product._id}} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Shop;