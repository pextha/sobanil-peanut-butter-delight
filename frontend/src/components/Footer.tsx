import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import logoImage from '@/assets/sobanil-logo.jpg';


export function Footer() {
  return (
    <footer className="bg-peanut-dark text-peanut-cream">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform">
                <img
                  src={logoImage}
                  alt="Sobanil Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-bold tracking-tight">Sobanil</span>
            </Link>
            <p className="text-peanut-cream/80 text-sm leading-relaxed">
              Premium peanut butter crafted with love and the finest ingredients.
              Experience the authentic taste of nature in every jar.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'Shop', 'About Us', 'Contact'].map(item => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase().replace(' ', '-').replace('home', '')}`}
                    className="text-peanut-cream/80 hover:text-primary transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4">Our Products</h4>
            <ul className="space-y-2">
              {['Classic Creamy', 'Premium Crunchy', 'Organic Natural', 'Honey Roasted'].map(item => (
                <li key={item}>
                  <Link
                    to="/shop"
                    className="text-peanut-cream/80 hover:text-primary transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-peanut-cream/80">hello@sobanil.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-peanut-cream/80">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <span className="text-peanut-cream/80">
                  123 Peanut Lane<br />
                  Nutville, NV 12345
                </span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-peanut-cream/20" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-peanut-cream/60">
          <p>© 2026 Sobanil. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-peanut-cream transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-peanut-cream transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
