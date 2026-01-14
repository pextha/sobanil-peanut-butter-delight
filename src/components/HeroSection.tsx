import { ArrowRight, Award, Leaf, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import heroVideo from '@/assets/Sobanil.mp4';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
      <video
        src={heroVideo}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl animate-fade-in">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary-foreground text-sm font-medium mb-6">
            <Leaf className="w-4 h-4" />
            100% Natural & Organic
          </span>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-card mb-6 leading-tight">
            Pure Peanut
            <span className="block text-primary">Perfection</span>
          </h1>
          
          <p className="text-lg md:text-xl text-card/80 mb-8 leading-relaxed max-w-lg">
            Discover the authentic taste of premium peanut butter, crafted with 
            love and the finest locally-sourced ingredients.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="group text-lg px-8">
              <Link to="/shop">
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-card/10 border-card/30 text-card hover:bg-card/20 hover:text-card">
              <Link to="/about">
                Our Story
              </Link>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-6 mt-12">
            <div className="flex items-center gap-2 text-card/80">
              <Award className="w-5 h-5 text-primary" />
              <span className="text-sm">Award Winning</span>
            </div>
            <div className="flex items-center gap-2 text-card/80">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="text-sm">Locally Sourced</span>
            </div>
            <div className="flex items-center gap-2 text-card/80">
              <Heart className="w-5 h-5 text-primary" />
              <span className="text-sm">No Preservatives</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
