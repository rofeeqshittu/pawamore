import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import MobileScrollSection from "@/components/MobileScrollSection";
import Layout from "@/components/Layout";
import { Fuel, Volume2, Clock, ClipboardCheck, Settings, Wrench, HeartHandshake, Shield, CheckCircle, Star, ChevronRight, Zap, Battery, Sun, ArrowRight, Phone } from "lucide-react";
import heroImg from "@/assets/hero-install.jpg";
import familyImg from "@/assets/family-power.jpg";
import useSEO from "@/hooks/useSEO";
import batteryImg from "@/assets/battery-system.jpg";

const painPoints = [
  {
    icon: Fuel,
    title: "Fuel Bills Eating Your Income",
    desc: "₦30,000–₦80,000 every month on generator fuel. It never stops. It only gets worse.",
  },
  {
    icon: Volume2,
    title: "Generator Noise & Fumes",
    desc: "The constant roar. The petrol smell. Your children breathing it in every single day.",
  },
  {
    icon: Clock,
    title: "Living on NEPA's Schedule",
    desc: "Spoiled food, dead phones, interrupted work — planning your life around 'when light comes.'",
  },
];

const steps = [
  { icon: ClipboardCheck, title: "Free Power Audit", desc: "We assess your load — completely free." },
  { icon: Settings, title: "Custom System", desc: "Designed for your needs and budget." },
  { icon: Wrench, title: "Pro Installation", desc: "Certified team. Usually one day." },
  { icon: HeartHandshake, title: "Ongoing Support", desc: "We follow up and stand behind our work." },
];

const products = [
  {
    icon: Battery,
    tag: "Entry Level",
    title: "Starter Battery System",
    desc: "Power your essentials — fridge, fans, TV, lights — all night. Plug and play.",
    price: "From ₦380,000",
    ideal: "Perfect for renters & apartments",
  },
  {
    icon: Sun,
    tag: "Most Popular",
    title: "Standard Solar + Battery",
    desc: "Full day power from solar + battery backup for evening and night.",
    price: "From ₦780,000",
    ideal: "Best for 2–3 bedroom homes",
  },
  {
    icon: Zap,
    tag: "Premium",
    title: "Premium Hybrid System",
    desc: "Total energy independence. Powers AC, washing machine, full home load.",
    price: "From ₦2,200,000",
    ideal: "Best for large homes & SMEs",
  },
];

const testimonials = [
  {
    quote: "My generator has not moved in 3 months. My fuel bill is zero. I wish I had done this years ago.",
    name: "Emeka A.",
    location: "Lekki, Lagos",
  },
  {
    quote: "The installation was clean, fast, and professional. Best decision for my business.",
    name: "Mrs. Funke O.",
    location: "Ibadan, Oyo State",
  },
  {
    quote: "They followed up a week after installation just to check everything was perfect.",
    name: "Chidi M.",
    location: "Wuse 2, Abuja",
  },
];

const stats = [
  { value: "500+", label: "Installations" },
  { value: "3", label: "Cities" },
  { value: "90-Day", label: "Guarantee" },
  { value: "₦0", label: "Fuel Bills" },
];

const Index = () => {
  useSEO({
    title: "PawaMore Systems — Solar & Battery Installation Nigeria",
    description: "PawaMore Systems installs world-class solar panels and battery storage for Nigerian homes and businesses. Free power audit. 90-day guarantee. Lagos, Abuja, Ibadan.",
  });

  return (
    <Layout>
      {/* Hero Section — Mobile-first: full-bleed image behind, text on top */}
      <section className="relative min-h-[100svh] flex items-end sm:items-center overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        {/* Background image — full on mobile, clipped on desktop */}
        <div className="absolute inset-0 lg:left-[40%] overflow-hidden">
          <div className="absolute inset-0 lg:hidden">
            <img src={heroImg} alt="Solar installation on Nigerian home" className="w-full h-full object-cover" loading="eager" />
            <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/80 to-forest/30" />
          </div>
          <div className="hidden lg:block absolute inset-0" style={{ clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)" }}>
            <img src={heroImg} alt="Solar installation on Nigerian home" className="w-full h-full object-cover" loading="eager" />
            <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/60 to-transparent" />
          </div>
        </div>

        {/* Kente pattern overlay */}
        <div className="absolute inset-0 kente-pattern opacity-20" />

        <div className="container relative z-10 pb-8 pt-24 sm:py-20 lg:py-0">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm rounded-full px-3 py-1 sm:px-4 sm:py-1.5 mb-4 sm:mb-6">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
              <span className="text-accent text-xs sm:text-sm font-display font-semibold">Powering Nigeria. Powering More.</span>
            </div>
            
            <h1 className="text-[2.25rem] leading-[1.1] sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-primary-foreground mb-4 sm:mb-6">
              Nigeria's Power
              <br />
              Problem{" "}
              <span className="text-accent">Ends Here.</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-primary-foreground/80 leading-relaxed mb-6 sm:mb-8 max-w-lg">
              World-class solar & battery power for your home or business. Clean. Silent. Permanent. <strong className="text-primary-foreground">Guaranteed.</strong>
            </p>

            {/* Mobile: stacked full-width CTAs with proper touch targets */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link to="/contact" className="w-full sm:w-auto">
                <Button variant="hero" size="xl" className="w-full sm:w-auto min-h-[52px] text-base">
                  Book FREE Power Audit
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="https://wa.me/2347062716154" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button variant="hero-outline" size="xl" className="w-full sm:w-auto min-h-[52px] text-base">
                  <Phone className="w-4 h-4 mr-2" />
                  WhatsApp Us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar — compact on mobile */}
      <section className="bg-primary py-4 sm:py-6">
        <div className="container grid grid-cols-4 gap-2 sm:gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display font-extrabold text-lg sm:text-2xl md:text-3xl text-accent leading-tight">{stat.value}</div>
              <div className="text-primary-foreground/70 text-[10px] sm:text-sm mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pain Section — card-based on mobile */}
      <section className="py-12 sm:py-20 md:py-28 kente-pattern">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-3 sm:mb-4 px-2">
              We Know How This <span className="text-accent">Feels.</span>
            </h2>
          </ScrollReveal>
          
          <div className="flex flex-col gap-4 sm:gap-6 md:grid md:grid-cols-3 md:gap-8 mt-8 sm:mt-12">
            {painPoints.map((pain, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="bg-card rounded-xl p-5 sm:p-8 shadow-[var(--shadow-card)] border-l-4 border-accent relative overflow-hidden group active:scale-[0.98] transition-transform">
                  <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-accent/5 rounded-bl-[3rem] sm:rounded-bl-[4rem]" />
                  <div className="flex items-start gap-4 md:block">
                    <pain.icon className="w-8 h-8 sm:w-10 sm:h-10 text-accent shrink-0 md:mb-4" />
                    <div>
                      <h3 className="font-display font-bold text-base sm:text-xl mb-1.5 sm:mb-3">{pain.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{pain.desc}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          
          <ScrollReveal>
            <p className="text-center text-base sm:text-xl font-display font-bold text-primary mt-8 sm:mt-12 px-4">
              PawaMore solves all three. <span className="text-accent">Permanently.</span>
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* How It Works — horizontal scroll on mobile */}
      <section className="py-12 sm:py-20 md:py-28 bg-secondary diagonal-top -mt-6 sm:-mt-8 pt-20 sm:pt-28">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-3 sm:mb-4">
              How It Works — <span className="text-primary">4 Steps</span>
            </h2>
          </ScrollReveal>

          {/* Mobile: horizontal scroll strip */}
          <div className="mt-8 sm:mt-12 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-8">
            <MobileScrollSection showSwipeHint={true} showDots={true} showArrows={false}>
              {steps.map((step, i) => (
                <ScrollReveal key={i} delay={i * 100}>
                  <div className="relative text-center group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-primary flex items-center justify-center mb-4 sm:mb-5 shadow-md">
                      <step.icon className="w-7 h-7 sm:w-9 sm:h-9 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-1 right-2 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent font-display font-extrabold text-xs sm:text-sm flex items-center justify-center">
                      {i + 1}
                    </div>
                    <h3 className="font-display font-bold text-sm sm:text-lg mb-1 sm:mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{step.desc}</p>
                    {i < steps.length - 1 && (
                      <ChevronRight className="hidden lg:block absolute -right-4 top-10 w-6 h-6 text-muted-foreground/30" />
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </MobileScrollSection>
          </div>
        </div>
      </section>

      {/* Products Preview — swipeable cards on mobile */}
      <section className="py-12 sm:py-20 md:py-28">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-3 sm:mb-4">
              Our Popular <span className="text-accent">Systems</span>
            </h2>
          </ScrollReveal>

          {/* Mobile: horizontal scroll, Desktop: grid */}
          <div className="mt-8 sm:mt-12 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:gap-8">
            <MobileScrollSection showSwipeHint={true} showDots={true} showArrows={true}>
              {products.map((product, i) => (
                <ScrollReveal key={i} delay={i * 150}>
                  <div className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 h-full ${
                    i === 1 ? "border-accent bg-card sm:scale-[1.02]" : "border-border bg-card"
                  }`}>
                    {i === 1 && (
                      <div className="bg-accent text-foreground text-center py-1.5 font-display font-bold text-xs uppercase tracking-wider">
                        ⭐ Most Popular
                      </div>
                    )}
                    <div className="p-5 sm:p-8">
                      <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-3 py-1 mb-3 sm:mb-4">
                        <product.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                        <span className="text-xs font-display font-semibold text-primary">{product.tag}</span>
                      </div>
                      <h3 className="font-display font-bold text-lg sm:text-xl mb-2 sm:mb-3">{product.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 sm:mb-6">{product.desc}</p>
                      <div className="font-display font-extrabold text-xl sm:text-2xl text-primary mb-0.5">{product.price}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">{product.ideal}</div>
                      <Link to="/products">
                        <Button variant={i === 1 ? "amber" : "outline"} className="w-full min-h-[44px]">
                          Learn More <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </MobileScrollSection>
          </div>

          <div className="text-center mt-8 sm:mt-10">
            <Link to="/products">
              <Button variant="default" size="lg" className="min-h-[48px]">
                See All Products & Pricing <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials — horizontal scroll on mobile */}
      <section className="py-12 sm:py-20 md:py-28 bg-forest relative overflow-hidden">
        <div className="absolute inset-0 kente-pattern opacity-20" />
        <div className="container relative z-10">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-center text-primary-foreground mb-3 sm:mb-4">
              What Customers Are <span className="text-accent">Saying</span>
            </h2>
          </ScrollReveal>

          <div className="mt-8 sm:mt-12 sm:grid sm:grid-cols-3 sm:gap-8">
            <MobileScrollSection showSwipeHint={true} showDots={true} showArrows={true}>
              {testimonials.map((t, i) => (
                <ScrollReveal key={i} delay={i * 150}>
                  <div className="bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 rounded-2xl p-5 sm:p-8 h-full">
                    <div className="flex gap-0.5 mb-3 sm:mb-4">
                      {Array(5).fill(0).map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <blockquote className="text-primary-foreground/90 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 italic">
                      "{t.quote}"
                    </blockquote>
                    <div>
                      <div className="font-display font-bold text-sm sm:text-base text-accent">{t.name}</div>
                      <div className="text-primary-foreground/60 text-xs sm:text-sm">{t.location}</div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </MobileScrollSection>
          </div>
        </div>
      </section>

      {/* Why PawaMore Trust */}
      <section className="py-12 sm:py-20 md:py-28 bg-primary diagonal-top -mt-6 sm:-mt-8 pt-20 sm:pt-28">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-primary-foreground mb-8 sm:mb-12">
              Why <span className="text-accent">PawaMore?</span>
            </h2>
          </ScrollReveal>

          <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {[
              "90-Day Performance Guarantee on every installation",
              "Free Home Power Audit before we recommend anything",
              "Certified installation team — trained & accountable",
              "After-sales support — we show up long after the job",
              "Nationwide delivery — Lagos, Abuja, Ibadan & beyond",
              "Authorised distributors of EcoFlow, Felicity Solar & more",
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 60}>
                <div className="flex items-start gap-3 bg-primary-foreground/5 rounded-xl p-4 sm:p-5 border border-primary-foreground/10 active:scale-[0.98] transition-transform">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <span className="text-primary-foreground/90 text-sm leading-relaxed">{item}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-12 sm:py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={familyImg} alt="Nigerian family with power" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-forest/85" />
        </div>
        <div className="container relative z-10 text-center px-6">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary-foreground mb-4 sm:mb-6">
              Ready to End Your Power Problem <span className="text-accent">For Good?</span>
            </h2>
            <p className="text-primary-foreground/80 text-sm sm:text-lg max-w-2xl mx-auto mb-6 sm:mb-8">
              Book your free power audit today — no pressure, no commitment. Just honest advice on the best system for you.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
              <Link to="/contact" className="w-full sm:w-auto">
                <Button variant="hero" size="xl" className="w-full sm:w-auto min-h-[52px] text-base">
                  Book FREE Power Audit
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="https://wa.me/2347062716154" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button variant="hero-outline" size="xl" className="w-full sm:w-auto min-h-[52px] text-base">
                  <Phone className="w-4 h-4 mr-2" />
                  WhatsApp Us Directly
                </Button>
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
