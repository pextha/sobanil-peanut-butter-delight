import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import api from '@/lib/api'; // Your API helper
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const ProductEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- FORM STATE ---
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [flavor, setFlavor] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');

  // --- 1. FETCH PRODUCT DATA ---
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data;
    },
  });

  // --- 2. FILL FORM WHEN DATA ARRIVES ---
  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price);
      setImage(product.imageUrl); // Note: Backend uses 'imageUrl'
      setFlavor(product.flavor);
      setCategory(product.category);
      setCountInStock(product.countInStock);
      setDescription(product.description);
    }
  }, [product]);

  // --- 3. UPDATE FUNCTION (PUT) ---
  const updateMutation = useMutation({
    mutationFn: async (e: React.FormEvent) => {
      e.preventDefault();
      // Send updated data to backend
      await api.put(`/products/${id}`, {
        name,
        price,
        imageUrl: image,
        flavor,
        category,
        description,
        countInStock,
      });
    },
    onSuccess: () => {
      toast.success('Product Updated Successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Refresh list
      navigate('/admin'); // Go back to dashboard
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Update failed');
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="container mx-auto py-10 px-4 max-w-2xl flex-1">
        <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-8">Edit Product</h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={updateMutation.mutate} className="space-y-6 border p-6 rounded-lg bg-card shadow-sm">
            
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Sobanil Classic"
                required 
              />
            </div>

            {/* Price & Stock Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (Rs)</Label>
                <Input 
                  id="price" 
                  type="number" 
                  value={price} 
                  onChange={(e) => setPrice(Number(e.target.value))} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Count In Stock</Label>
                <Input 
                  id="stock" 
                  type="number" 
                  value={countInStock} 
                  onChange={(e) => setCountInStock(Number(e.target.value))} 
                  required 
                />
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input 
                id="image" 
                value={image} 
                onChange={(e) => setImage(e.target.value)} 
                placeholder="/images/sample.jpg" 
              />
              <p className="text-xs text-muted-foreground">
                Tip: Put images in your 'public/images' folder or use an external URL.
              </p>
            </div>

            {/* Flavor & Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flavor">Flavor</Label>
                <Input 
                  id="flavor" 
                  value={flavor} 
                  onChange={(e) => setFlavor(e.target.value)} 
                  placeholder="e.g. Creamy" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input 
                  id="category" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                rows={4} 
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Update Product
            </Button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductEditScreen;