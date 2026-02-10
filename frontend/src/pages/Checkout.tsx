import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, Truck, Package, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/lib/cart';
import { cn } from '@/lib/utils';
// Removed Stripe imports

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

type Step = 'shipping' | 'payment';

declare global {
  interface Window {
    payhere: any;
  }
}

// Helper to calculate weight in KG (same as backend)
const getWeightInKg = (weight: string): number => {
  const w = weight.toLowerCase();
  if (w.includes('kg')) {
    return parseFloat(w.replace('kg', ''));
  } else if (w.includes('g')) {
    return parseFloat(w.replace('g', '')) / 1000;
  }
  return 0.2; // Default fallback 200g
};

const calculateDeliveryFee = (cartItems: any[]) => {
  let totalWeight = 0;

  // Items in cart context are { product: { weight: string, ... }, quantity: number }
  for (const item of cartItems) {
    if (item.product && item.product.weight) {
      totalWeight += getWeightInKg(item.product.weight) * item.quantity;
    } else {
      totalWeight += 0.2 * item.quantity; // Default per item if weight missing
    }
  }

  if (totalWeight <= 1) {
    return 350;
  } else {
    const extraWeight = Math.ceil(totalWeight - 1);
    return 350 + (extraWeight * 80);
  }
};

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState<Step>('shipping');
  const { items, totalPrice, clearCart } = useCart();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const navigate = useNavigate();

  // Calculate dynamic shipping cost
  const shippingCost = calculateDeliveryFee(items);
  const total = totalPrice + shippingCost;

  // State for shipping address
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });

  const [userInfo, setUserInfo] = useState<any>(null);

  const steps = [
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'payment', label: 'Payment', icon: CreditCard }
  ];

  // Fetch publishable key & user profile
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const userInfoStored = localStorage.getItem('userInfo');
        const token = userInfoStored ? JSON.parse(userInfoStored).token : null;

        if (!token) {
          navigate('/login'); // Redirect if not logged in
          return;
        }

        setUserInfo(JSON.parse(userInfoStored!));

        // Get User Profile for Address
        const resProfile = await fetch('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dataProfile = await resProfile.json();

        // Pre-fill if address exists
        if (dataProfile.addresses && dataProfile.addresses.length > 0) {
          // Find default or first
          const defaultAddr = dataProfile.addresses.find((a: any) => a.isDefault) || dataProfile.addresses[0];
          setFormData({
            firstName: dataProfile.name.split(' ')[0] || '',
            lastName: dataProfile.name.split(' ')[1] || '',
            email: dataProfile.email,
            address: defaultAddr.address,
            city: defaultAddr.city,
            state: '', // Assuming not stored separately in backend model shown earlier
            postalCode: defaultAddr.postalCode,
            country: defaultAddr.country
          });
        } else {
          setFormData(prev => ({ ...prev, email: dataProfile.email, firstName: dataProfile.name.split(' ')[0], lastName: dataProfile.name.split(' ')[1] }));
        }

      } catch (error) {
        console.error('Error fetching config/profile:', error);
      }
    };

    fetchConfig();
  }, [navigate]);


  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('payment');
  };

  const handlePayHerePayment = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('userInfo')!).token;

      // 1. Create Order
      const resOrder = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderItems: items.map(item => ({
            product: item.product.id,
            qty: item.quantity,
          })),
          shippingAddress: formData,
          paymentMethod: 'PayHere',
          itemsPrice: totalPrice,
          taxPrice: 0,
          shippingPrice: shippingCost,
          totalPrice: total
        })
      });

      if (!resOrder.ok) throw new Error('Failed to create order');
      const order = await resOrder.json();

      // 2. Generate Hash
      const resHash = await fetch('http://localhost:5000/api/orders/generate-payhere-hash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: order._id,
          amount: total,
          currency: 'LKR'
        })
      });

      if (!resHash.ok) throw new Error('Failed to generate payment hash');
      const { hash, merchantId } = await resHash.json();

      // 3. Start PayHere Payment
      const payment = {
        sandbox: true,
        merchant_id: merchantId,
        return_url: `${window.location.origin}/checkout`,
        cancel_url: `${window.location.origin}/checkout`,
        notify_url: 'http://localhost:5000/api/orders/webhook', // Optional dev URL
        order_id: order._id,
        items: 'Sobanil Peanut Butter Order',
        amount: total.toFixed(2),
        currency: 'LKR',
        hash: hash,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: '0771234567', // Static for now, can add to form
        address: formData.address,
        city: formData.city,
        country: 'Sri Lanka',
        delivery_address: formData.address,
        delivery_city: formData.city,
        delivery_country: 'Sri Lanka',
        custom_1: '',
        custom_2: ''
      };

      if (!window.payhere) {
        alert('PayHere SDK not loaded');
        return;
      }

      window.payhere.onCompleted = async function onCompleted(orderId: string) {
        console.log("Payment completed. OrderID:" + orderId);
        try {
          // Mark as paid
          await fetch(`http://localhost:5000/api/orders/${orderId}/pay`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              id: orderId,
              status: 'COMPLETED',
              update_time: new Date().toISOString(),
              email_address: formData.email
            })
          });
          handleSuccess();
        } catch (e) {
          console.error('Failed to update order status', e);
        }
      };

      window.payhere.onDismissed = function onDismissed() {
        console.log("Payment dismissed");
      };

      window.payhere.onError = function onError(error: any) {
        console.log("Error:" + error);
        alert('Payment Error: ' + error);
      };

      window.payhere.startPayment(payment);

    } catch (err) {
      console.error(err);
      alert('Failed to initiate payment');
    }
  };

  const handleSuccess = () => {
    setOrderPlaced(true);
    clearCart();
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Order Placed!</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for your order. We'll send you a confirmation email with order details.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/shop">Continue Shopping</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard">View Orders</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
        <CartDrawer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Add some products to your cart before checking out.
            </p>
            <Button asChild>
              <Link to="/shop">Browse Products</Link>
            </Button>
          </div>
        </main>
        <Footer />
        <CartDrawer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/shop">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
        </Button>

        <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full transition-colors',
                  currentStep === step.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <step.icon className="w-5 h-5" />
                <span className="font-medium hidden sm:inline">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className="w-16 h-0.5 bg-border mx-2" />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>
                  {currentStep === 'shipping' ? 'Shipping Information' : 'Payment Details'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentStep === 'shipping' ? (
                  <form onSubmit={handleShippingSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">ZIP Code</Label>
                        <Input
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                    >
                      Continue to Payment
                    </Button>
                  </form>
                ) : (
                  // Payment Step
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Billing Details</h3>
                      <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md">
                        <p className="font-medium text-foreground">{formData.firstName} {formData.lastName}</p>
                        <p>{formData.address}</p>
                        <p>{formData.city}, {formData.postalCode}</p>
                        <p>{formData.country}</p>
                        <p className="mt-2">{formData.email}</p>
                      </div>
                    </div>

                    <div className="bg-primary/5 p-4 rounded-md border border-primary/20">
                      <p className="text-sm text-center mb-4 text-muted-foreground">
                        You will be redirected to the secure PayHere payment gateway to complete your purchase.
                      </p>
                      <Button
                        onClick={handlePayHerePayment}
                        className="w-full h-12 text-lg font-semibold"
                      >
                        Pay Rs. {total.toFixed(2)} with PayHere
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('shipping')}
                      className="w-full"
                    >
                      Back to Shipping
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="border-0 shadow-lg sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map(item => (
                  <div key={item.product.id} className="flex gap-3">
                    <img
                      src={imageMap[item.product.image] || item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product.name}</p>
                      <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">
                      Rs. {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>Rs. {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>Rs. {shippingCost.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">Rs. {total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Checkout;
