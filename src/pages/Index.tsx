import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import Layout from "@/components/Layout";
import { Fuel, Volume2, Clock, ClipboardCheck, Settings, Wrench, HeartHandshake, Shield, CheckCircle, Star, ChevronRight, Zap, Battery, Sun } from "lucide-react";
import heroImg from "@/assets/hero-install.jpg";
import familyImg from "@/assets/family-power.jpg";
import useSEO from "@/hooks/useSEO";
import batteryImg from "@/assets/battery-system.jpg";

const painPoints = [
  {
    icon: Fuel,
    title: "Fuel Bills Eating Your Income",
    desc: "You're spending ₦30,000–₦80,000 every month on generator fuel. It never stops. It only gets worse as petrol prices rise.",
  },
  {
    icon: Volume2,
    title: "Generator Noise & Fumes",
    desc: "The constant roar. The petrol smell. Your children breathing it. Your neighbours complaining. You deserve better than this.",
  },
  {
    icon: Clock,
    title: "Living on NEPA's Schedule",
    desc: "Planning your life around 'when light comes.' Spoiled food, dead phones, interrupted work — every single day.",
  },
];

const steps = [
  { icon: ClipboardCheck, title: "Free Power Audit", desc: "We assess your load — completely free. No guessing, no overselling." },
  { icon: Settings, title: "Custom System", desc: "We design the exact system for your needs and budget. Full written quote." },
  { icon: Wrench, title: "Professional Installation", desc: "Our certified team installs cleanly and safely — usually in one day." },
  { icon: HeartHandshake, title: "Ongoing Support", desc: "We follow up, support your system, and stand behind our work." },
];

const products = [
  {
    icon: Battery,
    tag: "Entry Level",
    title: "Starter Battery System",
    desc: "Power your essentials — fridge, fans, TV, lights — all night. No solar needed. Plug and play.",
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
    quote: "The installation was clean, fast, and professional. The team explained everything. Best decision for my business.",
    name: "Mrs. Funke O.",
    location: "Ibadan, Oyo State",
  },
  {
    quote: "They followed up a week after installation just to check everything was perfect. No other company does that.",
    name: "Chidi M.",
    location: "Wuse 2, Abuja",
  },
];

const stats = [
  { value: "500+", label: "Installations Completed" },
  { value: "3", label: "Cities Covered" },
  { value: "90-Day", label: "Performance Guarantee" },
  { value: "₦0", label: "Fuel Our Customers Buy" },
];

const Index = () => {
  useSEO({
    title: "PawaMore Systems — Solar & Battery Installation Nigeria",
    description: "PawaMore Systems installs world-class solar panels and battery storage for Nigerian homes and businesses. Free power audit. 90-day guarantee. Lagos, Abuja, Ibadan.",
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        {/* Kente pattern overlay */}
        <div className="absolute inset-0 kente-pattern opacity-30" />
        
        {/* Asymmetric image slice */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[55%] overflow-hidden">
          <div className="absolute inset-0" style={{ clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)" }}>
            <img src={heroImg} alt="Solar installation on Nigerian home" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/60 to-transparent" />
          </div>
        </div>

        <div className="container relative z-10 py-20 lg:py-0">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-accent/20 rounded-full px-4 py-1.5 mb-6">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-accent text-sm font-display font-semibold">Powering Nigeria. Powering More.</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-primary-foreground leading-[1.05] mb-6">
              Nigeria's Power
              <br />
              Problem{" "}
              <span className="text-accent">Ends Here.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed mb-8 max-w-lg">
              PawaMore Systems installs world-class solar and battery power for Nigerian homes, businesses, and estates. Clean. Silent. Permanent. Guaranteed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact">
                <Button variant="hero" size="xl">
                  Book Your FREE Power Audit →
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="hero-outline" size="xl">
                  See Our Systems
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-primary py-6">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display font-extrabold text-2xl md:text-3xl text-accent">{stat.value}</div>
              <div className="text-primary-foreground/80 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pain Section */}
      <section className="py-20 md:py-28 kente-pattern">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-4">
              We Know Exactly How This <span className="text-accent">Feels.</span>
            </h2>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {painPoints.map((pain, i) => (
              <ScrollReveal key={i} delay={i * 150}>
                <div className="bg-card rounded-xl p-8 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow duration-300 border-l-4 border-accent relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-bl-[4rem] group-hover:bg-accent/10 transition-colors" />
                  <pain.icon className="w-10 h-10 text-accent mb-4" />
                  <h3 className="font-display font-bold text-xl mb-3">{pain.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{pain.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          
          <ScrollReveal>
            <p className="text-center text-xl font-display font-bold text-primary mt-12">
              PawaMore Systems solves all three. <span className="text-accent">Permanently.</span>
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-secondary diagonal-top -mt-8 pt-28">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-4">
              How It Works — <span className="text-primary">4 Simple Steps</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {steps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="relative text-center group">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md">
                    <step.icon className="w-9 h-9 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent font-display font-extrabold text-sm flex items-center justify-center">
                    {i + 1}
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                  {i < steps.length - 1 && (
                    <ChevronRight className="hidden lg:block absolute -right-4 top-10 w-6 h-6 text-muted-foreground/30" />
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-20 md:py-28">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-4">
              Our Most Popular <span className="text-accent">Systems</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {products.map((product, i) => (
              <ScrollReveal key={i} delay={i * 150}>
                <div className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:shadow-[var(--shadow-elevated)] ${
                  i === 1 ? "border-accent bg-card scale-[1.02]" : "border-border bg-card"
                }`}>
                  {i === 1 && (
                    <div className="bg-accent text-foreground text-center py-1.5 font-display font-bold text-xs uppercase tracking-wider">
                      ⭐ Most Popular
                    </div>
                  )}
                  <div className="p-8">
                    <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-3 py-1 mb-4">
                      <product.icon className="w-4 h-4 text-primary" />
                      <span className="text-xs font-display font-semibold text-primary">{product.tag}</span>
                    </div>
                    <h3 className="font-display font-bold text-xl mb-3">{product.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">{product.desc}</p>
                    <div className="font-display font-extrabold text-2xl text-primary mb-1">{product.price}</div>
                    <div className="text-sm text-muted-foreground mb-6">{product.ideal}</div>
                    <Link to="/products">
                      <Button variant={i === 1 ? "amber" : "outline"} className="w-full">
                        Learn More →
                      </Button>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/products">
              <Button variant="default" size="lg">See All Products & Pricing →</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-forest relative overflow-hidden">
        <div className="absolute inset-0 kente-pattern opacity-20" />
        <div className="container relative z-10">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center text-primary-foreground mb-4">
              What Our Customers Are <span className="text-accent">Saying</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 150}>
                <div className="bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 rounded-2xl p-8">
                  <div className="flex gap-1 mb-4">
                    {Array(5).fill(0).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <blockquote className="text-primary-foreground/90 leading-relaxed mb-6 italic">
                    "{t.quote}"
                  </blockquote>
                  <div>
                    <div className="font-display font-bold text-accent">{t.name}</div>
                    <div className="text-primary-foreground/60 text-sm">{t.location}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why PawaMore Trust */}
      <section className="py-20 md:py-28 bg-primary diagonal-top -mt-8 pt-28">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-primary-foreground mb-12">
              Why <span className="text-accent">PawaMore?</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "90-Day Performance Guarantee on every installation",
              "Free Home Power Audit before we recommend anything",
              "Certified installation team — trained, uniformed, accountable",
              "After-sales support — we show up long after the job is done",
              "Nationwide delivery — Lagos, Abuja, Ibadan and beyond",
              "Authorised distributors of EcoFlow, Felicity Solar, Itel Energy and more",
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="flex items-start gap-3 bg-primary-foreground/5 rounded-xl p-5 border border-primary-foreground/10">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <span className="text-primary-foreground/90 text-sm leading-relaxed">{item}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Family Image */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={familyImg} alt="Nigerian family with power" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-forest/85" />
        </div>
        <div className="container relative z-10 text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary-foreground mb-6">
              Ready to End Your Power Problem <span className="text-accent">For Good?</span>
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">
              Book your free power audit today — no pressure, no commitment. Just honest advice on the best system for your home or business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button variant="hero" size="xl">Book FREE Power Audit Now →</Button>
              </Link>
              <a href="https://wa.me/2340000000000" target="_blank" rel="noopener noreferrer">
                <Button variant="hero-outline" size="xl">WhatsApp Us Directly →</Button>
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
