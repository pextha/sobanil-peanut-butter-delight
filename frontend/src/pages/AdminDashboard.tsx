import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // NEW: Query Tools
import api from '@/lib/api'; // NEW: API Helper
import { toast } from 'sonner'; // NEW: Notifications
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Leaf,
  Menu,
  X,
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

// Images (Keep existing map for fallbacks)
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

type Tab = 'dashboard' | 'products' | 'orders';

// Define Real Product Type
interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  flavor: string;
  countInStock: number;
  imageUrl: string;
}

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- 1. SECURITY CHECK ---
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
    } else {
      const user = JSON.parse(userInfo);
      if (!user.isAdmin) {
        navigate('/'); // Redirect non-admins
      }
    }
  }, [navigate]);

  // --- 2. FETCH REAL PRODUCTS ---
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/products');
      return data;
    },
  });

  // --- 3. DELETE FUNCTION ---
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      toast.success('Product Deleted');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Delete failed');
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  // --- 4. CREATE FUNCTION ---
  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/products', {}); // Creates Sample
      return data;
    },
    onSuccess: (data) => {
      toast.success('Sample Product Created');
      navigate(`/admin/product/${data._id}/edit`); // Go to edit page
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Create failed');
    },
  });

  // --- MOCK DATA (For features we haven't built yet) ---
  const mockOrders = [
    { id: 'ORD-001', customer: 'John Doe', email: 'john@example.com', total: 34.97, status: 'Delivered', date: '2026-01-10' },
    { id: 'ORD-002', customer: 'Jane Smith', email: 'jane@example.com', total: 21.48, status: 'Shipped', date: '2026-01-12' },
    { id: 'ORD-003', customer: 'Bob Wilson', email: 'bob@example.com', total: 45.96, status: 'Pending', date: '2026-01-13' },
    { id: 'ORD-004', customer: 'Alice Brown', email: 'alice@example.com', total: 18.98, status: 'Processing', date: '2026-01-14' },
  ];

  const stats = [
    { title: 'Total Products', value: products?.length || 0, icon: Package }, // Real Count
    { title: 'Total Orders', value: mockOrders.length, icon: ShoppingCart },
    { title: 'Customers', value: 156, icon: Users },
    { title: 'Revenue', value: '$4,523', icon: LayoutDashboard },
  ];

  const statusColors: Record<string, string> = {
    'Pending': 'bg-honey text-foreground',
    'Processing': 'bg-secondary text-secondary-foreground',
    'Shipped': 'bg-accent text-accent-foreground',
    'Delivered': 'bg-primary text-primary-foreground'
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">Sobanil Admin</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as Tab);
                  setSidebarOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  activeTab === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/">
                <Settings className="w-4 h-4 mr-2" />
                Back to Store
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground capitalize">{activeTab}</h1>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <Card
                    key={stat.title}
                    className="border-0 shadow-md animate-scale-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm">{stat.title}</p>
                          <p className="text-2xl font-bold text-foreground mt-1">
                            {isLoading && stat.title === 'Total Products' ? '...' : stat.value}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <stat.icon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Orders (Kept Static for now) */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockOrders.slice(0, 4).map(order => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[order.status]}>{order.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Product Management</h2>
                {/* NEW: Button triggers 'createMutation' */}
                <Button onClick={() => navigate('/admin/product/add')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>

              <Card className="border-0 shadow-md">
                <CardContent className="p-0">
                  {isLoading ? (
                     <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>
                  ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products?.map(product => (
                        <TableRow key={product._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {/* Display Image with Fallback */}
                              <img
                                src={imageMap[product.imageUrl] || product.imageUrl || '/placeholder.jpg'}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover"
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  (e.target as HTMLImageElement).src = '/placeholder.svg'; 
                                }}
                              />
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-muted-foreground text-xs">{product.flavor}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{product.category}</TableCell>
                          <TableCell>Rs. {product.price}</TableCell>
                          <TableCell>
                            <Badge variant={product.countInStock > 0 ? 'default' : 'destructive'}>
                              {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* NEW: Edit Button navigates to Edit Page */}
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => navigate(`/admin/product/${product._id}/edit`)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              
                              {/* NEW: Delete Button triggers delete */}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive"
                                onClick={() => handleDelete(product._id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Order Management</h2>
              </div>

              <Card className="border-0 shadow-md">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockOrders.map(order => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell className="text-muted-foreground">{order.email}</TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[order.status]}>{order.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;