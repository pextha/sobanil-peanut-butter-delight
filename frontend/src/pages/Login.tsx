import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, Loader2 } from 'lucide-react';
import { useCart } from '@/lib/cart';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchCart } = useCart();

  // --- 1. SMART REDIRECT ON LOAD ---
  // If user is already logged in, send them to the right place immediately
  useEffect(() => {
    const userInfoString = localStorage.getItem('userInfo');

    if (userInfoString) {
      const userInfo = JSON.parse(userInfoString);

      // CHECK: Is it an Admin?
      if (userInfo.isAdmin) {
        navigate('/admin'); // Admins go to Dashboard
      } else {
        navigate('/profile'); // Customers go to Profile
      }
    }
  }, [navigate]);

  // --- LOGIN STATE ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // --- REGISTER STATE ---
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  // Default redirect for customers (unless they came from checkout)
  const from = location.state?.from?.pathname || '/profile';

  // --- 2. LOGIN ACTION ---
  const loginMutation = useMutation({
    mutationFn: async (e: React.FormEvent) => {
      e.preventDefault();
      const { data } = await api.post('/users/login', {
        email: loginEmail,
        password: loginPassword,
      });
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Welcome back!');
      fetchCart();

      // SMART REDIRECT AFTER LOGIN
      if (data.isAdmin) {
        navigate('/admin');
      } else {
        navigate(from);
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    },
  });

  // --- 3. REGISTER ACTION ---
  const registerMutation = useMutation({
    mutationFn: async (e: React.FormEvent) => {
      e.preventDefault();
      if (regPassword !== regConfirm) throw new Error('Passwords do not match');

      const { data } = await api.post('/users', {
        name: `${regFirstName} ${regLastName}`,
        email: regEmail,
        password: regPassword,
      });
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Account created successfully!');
      fetchCart();

      // New users are never Admins, so go to Profile
      navigate('/profile');
    },
    onError: (err: any) => {
      const msg = err.message === 'Passwords do not match'
        ? err.message
        : (err.response?.data?.message || 'Registration failed');
      toast.error(msg);
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Welcome to Sobanil</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* LOGIN FORM */}
              <TabsContent value="login">
                <form onSubmit={loginMutation.mutate} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-input" />
                      <span className="text-muted-foreground">Remember me</span>
                    </label>
                    <a href="#" className="text-primary hover:underline">Forgot password?</a>
                  </div>
                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              {/* REGISTER FORM */}
              <TabsContent value="register">
                <form onSubmit={registerMutation.mutate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reg-firstname">First Name</Label>
                      <Input
                        id="reg-firstname"
                        placeholder="John"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-lastname">Last Name</Label>
                      <Input
                        id="reg-lastname"
                        placeholder="Doe"
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="you@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-confirm">Confirm Password</Label>
                    <Input
                      id="reg-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Login;