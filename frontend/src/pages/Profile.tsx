import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Package, 
  LogOut, 
  Loader2, 
  Save, 
  LayoutDashboard, 
  Settings, 
  ShoppingBag,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,   // NEW IMPORT
  Heart,    // NEW IMPORT
  Plus      // NEW IMPORT
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- INTERFACES ---
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface Order {
  _id: string;
  createdAt: string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  orderItems: any[];
}

// Define the valid Tab names
type TabType = 'orders' | 'settings' | 'addresses' | 'wishlist';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 1. CHECK AUTH
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) navigate('/login');
  }, [navigate]);

  // 2. FETCH DATA
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await api.get<UserProfile>('/users/profile')).data,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => (await api.get<Order[]>('/orders/myorders')).data,
  });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // 3. UPDATE ACTION
  const updateProfileMutation = useMutation({
    mutationFn: async (e: React.FormEvent) => {
      e.preventDefault();
      if (password && password !== confirmPassword) throw new Error('Passwords do not match');
      const { data } = await api.put('/users/profile', {
        name,
        email,
        password: password || undefined,
      });
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Profile updated successfully');
      setPassword('');
      setConfirmPassword('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Update failed');
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const getOrderStatus = (order: Order) => {
    if (order.isDelivered) return { label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 };
    if (order.isPaid) return { label: 'Processing', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Truck };
    return { label: 'Payment Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock };
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar /><div className="flex-1 flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div><Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* --- SIDEBAR --- */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg sticky top-24">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 relative">
                    <User className="w-10 h-10 text-primary" />
                    {user?.isAdmin && (
                      <Badge className="absolute -bottom-2 px-2 py-0.5 text-[10px] uppercase">Admin</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">{user?.name}</h3>
                  <p className="text-muted-foreground text-sm">{user?.email}</p>
                </div>

                <Separator className="my-4" />

                <nav className="space-y-2">
                  {user?.isAdmin && (
                    <button 
                      onClick={() => navigate('/admin')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors font-medium mb-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </button>
                  )}

                  <button 
                    onClick={() => setActiveTab('orders')}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium",
                      activeTab === 'orders' 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Package className="w-4 h-4" />
                    <span>My Orders</span>
                  </button>

                  {/* NEW: Addresses Tab */}
                  <button 
                    onClick={() => setActiveTab('addresses')}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium",
                      activeTab === 'addresses' 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Addresses</span>
                  </button>

                  {/* NEW: Wishlist Tab */}
                  <button 
                    onClick={() => setActiveTab('wishlist')}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium",
                      activeTab === 'wishlist' 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Heart className="w-4 h-4" />
                    <span>Wishlist</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('settings')}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium",
                      activeTab === 'settings' 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Account Settings</span>
                  </button>

                  <Separator className="my-2" />
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* --- MAIN CONTENT --- */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* VIEW 1: MY ORDERS */}
            {activeTab === 'orders' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
                  <p className="text-muted-foreground mt-1">View and track your recent purchases</p>
                </div>

                {ordersLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
                ) : !orders || orders.length === 0 ? (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                      <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
                      <p className="text-muted-foreground mb-6">
                        You haven't placed any orders yet. Start exploring our collection!
                      </p>
                      <Button asChild size="lg">
                        <span className="cursor-pointer" onClick={() => navigate('/shop')}>Browse Products</span>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order, index) => {
                      const status = getOrderStatus(order);
                      const StatusIcon = status.icon;
                      return (
                        <Card 
                          key={order._id}
                          className="border-0 shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                              <div className="space-y-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-bold text-lg text-foreground tracking-tight">
                                    #{order._id.substring(order._id.length - 6).toUpperCase()}
                                  </h3>
                                  <Badge variant="outline" className={cn("flex items-center gap-1.5 px-3 py-1", status.color)}>
                                    <StatusIcon className="w-3 h-3" />
                                    {status.label}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground text-sm flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5" />
                                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                              </div>
                              <div className="flex items-center gap-6 justify-between sm:justify-end w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0">
                                <div className="text-left sm:text-right">
                                  <p className="text-sm text-muted-foreground">{order.orderItems.length} items</p>
                                  <p className="font-bold text-xl text-primary">LKR {order.totalPrice.toLocaleString()}</p>
                                </div>
                                <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                  <Eye className="w-4 h-4 mr-2" /> Details
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: ADDRESSES (Placeholder) */}
            {activeTab === 'addresses' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Addresses</h1>
                    <p className="text-muted-foreground mt-1">Manage your shipping addresses</p>
                  </div>
                  <Button disabled>
                    <Plus className="w-4 h-4 mr-2" /> Add New
                  </Button>
                </div>
                <Card className="border-dashed border-2 shadow-none bg-muted/20">
                  <CardContent className="p-12 text-center">
                    <MapPin className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No addresses saved</h3>
                    <p className="text-muted-foreground">
                      This feature is coming soon! You will be able to save multiple shipping addresses here.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* VIEW 3: WISHLIST (Placeholder) */}
            {activeTab === 'wishlist' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-foreground">My Wishlist</h1>
                  <p className="text-muted-foreground mt-1">Products you want to buy later</p>
                </div>
                <Card className="border-dashed border-2 shadow-none bg-muted/20">
                  <CardContent className="p-12 text-center">
                    <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Your wishlist is empty</h3>
                    <p className="text-muted-foreground mb-6">
                      Save your favorite items here to find them easily later.
                    </p>
                    <Button asChild size="lg">
                      <span className="cursor-pointer" onClick={() => navigate('/shop')}>Find Products</span>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* VIEW 4: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
                  <p className="text-muted-foreground mt-1">Manage your profile information and security</p>
                </div>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <form onSubmit={updateProfileMutation.mutate} className="space-y-6 max-w-xl">
                      <div className="grid gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-11 bg-muted/30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-11 bg-muted/30"
                          />
                        </div>
                      </div>
                      <Separator className="my-2" />
                      <div className="grid gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="password">New Password</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Leave blank to keep current"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-11 bg-muted/30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="h-11 bg-muted/30"
                          />
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button 
                          type="submit" 
                          size="lg" 
                          className="w-full sm:w-auto min-w-[150px]" 
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
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

export default Profile;