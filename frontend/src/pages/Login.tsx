import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query'; // NEW: For API calls
import api from '@/lib/api'; // NEW: Your API helper
import { toast } from 'sonner'; // NEW: Alerts
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  // --- LOGIN STATE ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // --- REGISTER STATE ---
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  // --- 1. LOGIN ACTION ---
  const loginMutation = useMutation({
    mutationFn: async (e: React.FormEvent) => {
      e.preventDefault();
      // Send email/pass to backend
      const { data } = await api.post('/users/login', {
        email: loginEmail,
        password: loginPassword,
      });
      return data;
    },
    onSuccess: (data) => {
      // Save Token to Browser
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Welcome back!');
      
      // Smart Redirect: Admin -> Dashboard, User -> Home
      if (data.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    },
  });

  // --- 2. REGISTER ACTION ---
  const registerMutation = useMutation({
    mutationFn: async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (regPassword !== regConfirm) {
        throw new Error('Passwords do not match');
      }

      // Send data to backend
      const { data } = await api.post('/users', {
        name: `${regFirstName} ${regLastName}`,
        email: regEmail,
        password: regPassword,
      });
      return data;
    },
    onSuccess: (data) => {
      // Login immediately after registering
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Account created successfully!');
      navigate('/');
    },
    onError: (err: any) => {
      // Check if it's a "User already exists" error or password mismatch
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
                    <a href="#" className="text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
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
                     {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="text-center text-sm text-muted-foreground mt-6">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Login;