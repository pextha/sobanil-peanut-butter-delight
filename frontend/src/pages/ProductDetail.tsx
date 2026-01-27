import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart, Truck, Shield, Heart, Loader2, Star, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/lib/cart';
import { toast } from 'sonner';

// Interfaces for Reviews & Products
interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

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
  rating: number;      // New field
  numReviews: number;  // New field
  reviews: Review[];   // New field
}

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const queryClient = useQueryClient();

  // Review Form State
  const [ratingInput, setRatingInput] = useState('5');
  const [comment, setComment] = useState('');

  // 1. Fetch Product
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => (await api.get<Product>(`/products/${id}`)).data,
    enabled: !!id,
  });

  // 2. Submit Review Logic
  const reviewMutation = useMutation({
    mutationFn: async (data: { rating: number; comment: string }) => {
      await api.post(`/products/${id}/reviews`, data);
    },
    onSuccess: () => {
      toast.success('Review Submitted!');
      setComment('');
      setRatingInput('5');
      // Refresh product data to show new review
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add review. Login required.');
    },
  });

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return toast.error("Please add a comment");
    reviewMutation.mutate({ rating: Number(ratingInput), comment });
  };

  const handleAddToCart = () => {
    if (product) {
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
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background flex flex-col">
       <Navbar /><div className="flex-1 flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div><Footer />
    </div>
  );
  
  if (isError || !product) return (
    <div className="min-h-screen bg-background flex flex-col">
       <Navbar /><div className="flex-1 flex justify-center items-center text-lg">Product not found</div><Footer />
    </div>
  );

  const isOutOfStock = product.countInStock === 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/shop"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop</Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
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

          {/* INFO */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-start mb-2">
                 <div className="flex gap-2">
                    <Badge variant="secondary">{product.category}</Badge>
                    {product.flavor && <Badge variant="outline">{product.flavor}</Badge>}
                 </div>
                 {/* Rating Badge */}
                 <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold text-foreground">{product.rating ? product.rating.toFixed(1) : 'New'}</span>
                    <span className="text-muted-foreground text-xs ml-1">({product.numReviews} reviews)</span>
                 </div>
              </div>
              <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-primary">LKR {product.price.toLocaleString()}</span>
              <span className="text-muted-foreground">/ {product.weight}</span>
            </div>

            <p className="text-muted-foreground text-lg">{product.description}</p>
            <Separator />

            {/* Actions */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-muted rounded-lg p-1">
                <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                   <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} disabled={isOutOfStock}>
                   <Plus className="w-4 h-4" />
                </Button>
              </div>
              <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={isOutOfStock}>
                <ShoppingCart className="mr-2 h-5 w-5" /> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button variant="outline" size="lg"><Heart className="w-5 h-5" /></Button>
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        {/* --- REVIEWS SECTION --- */}
        <div className="grid md:grid-cols-2 gap-12" id="reviews">
          {/* Reviews List */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            {(!product.reviews || product.reviews.length === 0) && (
                <div className="p-8 bg-muted/20 rounded-xl text-center border border-dashed">
                    <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
                </div>
            )}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {product.reviews && product.reviews.map((review) => (
                <div key={review._id} className="bg-card p-4 rounded-xl border shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                        {review.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-sm">{review.name}</span>
                    </div>
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                  <p className="text-xs text-muted-foreground mt-3 text-right">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Write Review Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Write a Review</h2>
            <form onSubmit={submitReview} className="space-y-4 bg-card p-6 rounded-xl border shadow-sm">
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <Select value={ratingInput} onValueChange={setRatingInput}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                    <SelectItem value="4">4 - Very Good</SelectItem>
                    <SelectItem value="3">3 - Good</SelectItem>
                    <SelectItem value="2">2 - Fair</SelectItem>
                    <SelectItem value="1">1 - Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Comment</label>
                <Textarea 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)} 
                  placeholder="Share your experience with this product..." 
                  rows={4} 
                  className="resize-none"
                />
              </div>

              <Button type="submit" disabled={reviewMutation.isPending} className="w-full">
                {reviewMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : 'Submit Review'}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                * Requires Login
              </p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default ProductDetail;