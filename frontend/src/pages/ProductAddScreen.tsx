import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Loader2, Upload } from 'lucide-react';
import api from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreatableSelect } from '@/components/CreatableSelect'; // <--- IMPORT THIS
import { toast } from 'sonner';

const ProductAddScreen = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- FORM STATE ---
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  // --- DROPDOWN STATES ---
  const [flavor, setFlavor] = useState('');
  const [category, setCategory] = useState('');
  const [weight, setWeight] = useState(''); // Added Weight

  // --- FILE UPLOAD HANDLER ---
  const uploadFileHandler = async (e: any) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await api.post('/upload', formData, config);
      setImage(data);
      setUploading(false);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error(error);
      setUploading(false);
      toast.error('Image upload failed');
    }
  };

  // --- CREATE MUTATION ---
  const createMutation = useMutation({
    mutationFn: async (e: React.FormEvent) => {
      e.preventDefault();
      await api.post('/products', {
        name,
        price,
        imageUrl: image,
        flavor,
        category,
        weight, // Include weight
        description,
        countInStock,
      });
    },
    onSuccess: () => {
      toast.success('Product Created Successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/admin');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Creation failed');
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="container mx-auto py-10 px-4 max-w-2xl flex-1">
        <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-8">Add New Product</h1>

        <form onSubmit={createMutation.mutate} className="space-y-6 border p-6 rounded-lg bg-card shadow-sm">
          
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sobanil Super Crunchy" required />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (Rs)</Label>
              <Input id="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Count In Stock</Label>
              <Input id="stock" type="number" value={countInStock} onChange={(e) => setCountInStock(Number(e.target.value))} required />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Product Image</Label>
            <div className="flex gap-2 items-center">
              <Input 
                id="image" 
                value={image} 
                onChange={(e) => setImage(e.target.value)} 
                placeholder="Upload an image" 
                readOnly 
                className="bg-muted"
              />
              <div className="relative">
                <input
                  type="file"
                  id="image-file"
                  onChange={uploadFileHandler}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button type="button" variant="outline" size="icon" disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* --- SMART DROPDOWNS ROW 1 --- */}
          <div className="grid grid-cols-2 gap-4">
            <CreatableSelect 
                label="Flavor" 
                value={flavor} 
                onChange={setFlavor} 
                endpoint="flavors" 
                placeholder="Select Flavor"
            />
            <CreatableSelect 
                label="Category" 
                value={category} 
                onChange={setCategory} 
                endpoint="categories" 
                placeholder="Select Category"
            />
          </div>

          {/* --- SMART DROPDOWNS ROW 2 --- */}
          <div className="grid grid-cols-2 gap-4">
             <CreatableSelect 
                label="Weight" 
                value={weight} 
                onChange={setWeight} 
                endpoint="weights" 
                placeholder="Select Weight"
            />
            {/* Empty div to keep the grid layout balanced if you only have 3 dropdowns */}
            <div></div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
          </div>

          <Button type="submit" className="w-full" disabled={createMutation.isPending || uploading}>
            {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Create Product
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default ProductAddScreen;