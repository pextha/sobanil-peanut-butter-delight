import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Package, MapPin, Heart, LogOut, Eye } from 'lucide-react';

const Dashboard = () => {
  const mockOrders = [
    {
      id: 'ORD-001',
      date: '2026-01-10',
      status: 'Delivered',
      total: 34.97,
      items: 3
    },
    {
      id: 'ORD-002',
      date: '2026-01-05',
      status: 'Shipped',
      total: 21.48,
      items: 2
    },
    {
      id: 'ORD-003',
      date: '2025-12-28',
      status: 'Delivered',
      total: 45.96,
      items: 4
    }
  ];

  const statusColors: Record<string, string> = {
    'Pending': 'bg-honey text-foreground',
    'Shipped': 'bg-secondary text-secondary-foreground',
    'Delivered': 'bg-primary text-primary-foreground'
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg sticky top-24">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">John Doe</h3>
                  <p className="text-muted-foreground text-sm">john@example.com</p>
                </div>

                <Separator className="my-4" />

                <nav className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground">
                    <Package className="w-4 h-4" />
                    <span>My Orders</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                    <MapPin className="w-4 h-4" />
                    <span>Addresses</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                    <Heart className="w-4 h-4" />
                    <span>Wishlist</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                    <User className="w-4 h-4" />
                    <span>Account Settings</span>
                  </button>
                  <Separator className="my-2" />
                  <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
              <p className="text-muted-foreground mt-1">View and track your order history</p>
            </div>

            {mockOrders.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't placed any orders. Start shopping!
                  </p>
                  <Button asChild>
                    <Link to="/shop">Browse Products</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {mockOrders.map((order, index) => (
                  <Card
                    key={order.id}
                    className="border-0 shadow-md hover:shadow-lg transition-shadow animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground">{order.id}</h3>
                            <Badge className={statusColors[order.status]}>
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            Placed on {new Date(order.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">{order.items} items</p>
                            <p className="font-semibold text-lg text-primary">
                              ${order.total.toFixed(2)}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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

export default Dashboard;
