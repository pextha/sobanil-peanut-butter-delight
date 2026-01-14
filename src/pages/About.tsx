import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Leaf, Heart, Award, Users } from 'lucide-react';
import heroImage from '@/assets/hero-peanut-butter.jpg';

const About = () => {
  const values = [
    {
      icon: Leaf,
      title: 'Sustainability',
      description: 'We partner with local farmers who practice sustainable agriculture, ensuring our peanuts are grown with care for the environment.'
    },
    {
      icon: Heart,
      title: 'Quality First',
      description: 'Every jar of Sobanil peanut butter is crafted with the finest ingredients and undergoes rigorous quality checks.'
    },
    {
      icon: Award,
      title: 'Award-Winning Taste',
      description: 'Our recipes have been perfected over years, earning us recognition as one of the best peanut butter brands.'
    },
    {
      icon: Users,
      title: 'Community Focused',
      description: 'We believe in giving back. A portion of every purchase goes to local food banks and nutrition programs.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero */}
        <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="About Sobanil"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-foreground/70" />
          </div>
          <div className="relative z-10 text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-card mb-4">Our Story</h1>
            <p className="text-card/80 text-lg md:text-xl max-w-2xl mx-auto">
              From humble beginnings to your kitchen table
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-primary font-medium">Est. 2015</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6 text-foreground">
                A Passion for Peanuts
              </h2>
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                <p>
                  Sobanil began with a simple idea: to create the most delicious, 
                  natural peanut butter using only the finest ingredients. Founded 
                  by a family of peanut farmers, we've grown from a small kitchen 
                  operation to a beloved brand trusted by thousands.
                </p>
                <p>
                  Every jar of Sobanil peanut butter tells a story of dedication, 
                  quality, and love. We source our peanuts exclusively from local 
                  farms that share our commitment to sustainable farming practices.
                </p>
                <p>
                  Today, we're proud to offer a range of premium peanut butter 
                  varieties that cater to every taste – from classic creamy to 
                  adventurous flavored options.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-primary font-medium">What We Stand For</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 text-foreground">
                Our Values
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div
                  key={value.title}
                  className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default About;
