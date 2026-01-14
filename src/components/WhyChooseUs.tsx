import { Leaf, Award, Truck, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Leaf,
    title: '100% Natural',
    description: 'No artificial additives, preservatives, or added sugars. Just pure peanut goodness.'
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'We source only the finest peanuts from trusted local farmers.'
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Free shipping on orders over $50. Fresh peanut butter delivered to your door.'
  },
  {
    icon: Shield,
    title: 'Satisfaction Guaranteed',
    description: '30-day money-back guarantee. Love it or we\'ll make it right.'
  }
];

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-leaf-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-primary font-medium">Why Sobanil?</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 text-foreground">
            What Makes Us Different
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
