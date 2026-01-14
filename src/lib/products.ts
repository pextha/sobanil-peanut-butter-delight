export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'creamy' | 'crunchy' | 'organic' | 'flavored';
  weight: string;
  inStock: boolean;
  featured?: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Classic Creamy',
    description: 'Our signature smooth and creamy peanut butter, made from 100% roasted peanuts with no added preservatives.',
    price: 8.99,
    image: '/product-classic-creamy.jpg',
    category: 'creamy',
    weight: '340g',
    inStock: true,
    featured: true
  },
  {
    id: '2',
    name: 'Premium Crunchy',
    description: 'Perfectly crunchy with generous chunks of roasted peanuts. A texture lover\'s dream.',
    price: 9.49,
    image: '/product-crunchy.jpg',
    category: 'crunchy',
    weight: '340g',
    inStock: true,
    featured: true
  },
  {
    id: '3',
    name: 'Organic Natural',
    description: 'USDA certified organic peanut butter with nothing but pure, natural goodness.',
    price: 11.99,
    image: '/product-organic.jpg',
    category: 'organic',
    weight: '340g',
    inStock: true,
    featured: true
  },
  {
    id: '4',
    name: 'Honey Roasted',
    description: 'Sweet and savory blend of premium peanut butter with a touch of natural honey.',
    price: 10.49,
    image: '/product-honey-roasted.jpg',
    category: 'flavored',
    weight: '340g',
    inStock: true,
    featured: true
  },
  {
    id: '5',
    name: 'Extra Creamy Family Size',
    description: 'Our beloved creamy peanut butter in a generous family-sized jar.',
    price: 14.99,
    image: '/product-classic-creamy.jpg',
    category: 'creamy',
    weight: '680g',
    inStock: true
  },
  {
    id: '6',
    name: 'Dark Roast Crunchy',
    description: 'Deep roasted peanuts for an intense, bold flavor with satisfying crunch.',
    price: 10.99,
    image: '/product-crunchy.jpg',
    category: 'crunchy',
    weight: '340g',
    inStock: true
  }
];

export const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'creamy', name: 'Creamy' },
  { id: 'crunchy', name: 'Crunchy' },
  { id: 'organic', name: 'Organic' },
  { id: 'flavored', name: 'Flavored' }
];
