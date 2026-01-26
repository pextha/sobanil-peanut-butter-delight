// FIX: Updated Interface to match your Database & Shop Logic
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string; // Type of product (e.g. "Peanut Butter")
  flavor?: string;  // Variant (e.g. "Creamy")
  weight: string;
  inStock: boolean;
  featured?: boolean;
}

// Static fallback data (matches your new structure)
export const products: Product[] = [
  {
    id: '1',
    name: 'Classic Creamy',
    description: 'Our signature smooth and creamy peanut butter.',
    price: 1800,
    image: '/product-classic-creamy.jpg',
    category: 'Peanut Butter',
    flavor: 'Creamy',
    weight: '340g',
    inStock: true,
    featured: true
  },
  {
    id: '2',
    name: 'Peanut Butter Cookies',
    description: 'Soft, chewy cookies baked with our premium peanut butter.',
    price: 850,
    image: '/product-cookies.jpg', 
    category: 'Peanut Cookies', // Different Category example
    flavor: 'Original',
    weight: '200g',
    inStock: true
  }
];

export const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'peanut-butter', name: 'Peanut Butter' },
  { id: 'peanut-cookies', name: 'Peanut Cookies' },
  { id: 'gift-packs', name: 'Gift Packs' }
];