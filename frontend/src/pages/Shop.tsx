import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Loader2, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { ProductCard } from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

// --- INTERFACES ---
interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  flavor: string;
  description: string;
  category: string;
  countInStock: number;
  weight?: string;
}

interface Attribute {
  _id: string;
  name: string;
}

const Shop = () => {
  // --- STATE ---
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFlavor, setSelectedFlavor] = useState('All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Keep URL in sync with search query (optional, but good for shareable links)
  useEffect(() => {
    if (searchQuery) {
      setSearchParams(prev => {
        prev.set('search', searchQuery);
        return prev;
      }, { replace: true });
    } else {
      setSearchParams(prev => {
        prev.delete('search');
        return prev;
      }, { replace: true });
    }
  }, [searchQuery, setSearchParams]);

  // --- 1. FETCH DATA (Products, Categories, Flavors) ---

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await api.get<Product[]>('/products')).data,
  });

  const { data: categoriesData, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Attribute[]>('/attributes/categories')).data,
  });

  const { data: flavorsData, isLoading: flavLoading } = useQuery({
    queryKey: ['flavors'],
    queryFn: async () => (await api.get<Attribute[]>('/attributes/flavors')).data,
  });

  // --- 2. PREPARE FILTER LISTS ---
  const categoriesList = useMemo(() =>
    [{ _id: 'all-cat', name: 'All' }, ...(categoriesData || [])],
    [categoriesData]);

  const flavorsList = useMemo(() =>
    [{ _id: 'all-flav', name: 'All' }, ...(flavorsData || [])],
    [flavorsData]);

  // --- 3. FILTER LOGIC (The Brain) ---
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      // 1. Check Category (Type)
      const categoryMatch = selectedCategory === 'All' ||
        product.category === selectedCategory;

      // 2. Check Flavor (Variant)
      const flavorMatch = selectedFlavor === 'All' ||
        product.flavor === selectedFlavor;

      // 3. Check Search Text
      const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      return categoryMatch && flavorMatch && searchMatch;
    });
  }, [selectedCategory, selectedFlavor, searchQuery, products]);

  // --- 4. SIDEBAR COMPONENT ---
  const FilterSidebar = () => (
    <div className="space-y-8">
      {/* Category Section */}
      <div>
        <h3 className="font-semibold mb-3 text-foreground">Category</h3>
        {catLoading ? <div className="text-xs text-muted-foreground">Loading...</div> : (
          <div className="space-y-1">
            {categoriesList.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelectedCategory(c.name)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                  selectedCategory === c.name
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Flavor Section */}
      <div>
        <h3 className="font-semibold mb-3 text-foreground">Flavor</h3>
        {flavLoading ? <div className="text-xs text-muted-foreground">Loading...</div> : (
          <div className="space-y-1">
            {flavorsList.map((f) => (
              <button
                key={f._id}
                onClick={() => setSelectedFlavor(f.name)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                  selectedFlavor === f.name
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {f.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Our Collection</h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Browse our premium selection of peanut butters and cookies.
          </p>
        </div>

        {/* Top Bar: Search & Mobile Filter */}
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

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-card w-[300px]">
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
            <div className="sticky top-24 bg-card rounded-xl p-6 shadow-sm border border-border">
              <FilterSidebar />
              {(selectedCategory !== 'All' || selectedFlavor !== 'All') && (
                <Button
                  variant="ghost"
                  className="w-full mt-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedFlavor('All');
                    setSearchQuery('');
                  }}
                >
                  <X className="w-4 h-4 mr-2" /> Clear All Filters
                </Button>
              )}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {productsLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
                <p className="text-muted-foreground">No products found matching these filters.</p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedFlavor('All');
                    setSearchQuery('');
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product._id}
                    className="animate-scale-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ProductCard product={{
                      id: product._id,
                      name: product.name,
                      price: product.price,
                      image: product.imageUrl,
                      category: product.category,
                      description: product.description,
                      inStock: product.countInStock > 0,
                      weight: product.weight,
                      flavor: product.flavor
                    }} />
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