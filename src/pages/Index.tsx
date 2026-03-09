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
import avatarEmeka from "@/assets/avatar-emeka.jpg";
import avatarFunke from "@/assets/avatar-funke.jpg";
import avatarChidi from "@/assets/avatar-chidi.jpg";
import avatarTunde from "@/assets/avatar-tunde.jpg";
import avatarAlhaji from "@/assets/avatar-alhaji.jpg";
import avatarNgozi from "@/assets/avatar-ngozi.jpg";

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
    quote: "My generator has been collecting dust for 3 months. Fuel bill? Zero. I'm only angry I didn't do this sooner.",
    name: "Emeka A.",
    location: "Lekki, Lagos",
    avatar: avatarEmeka,
  },
  {
    quote: "Clean work, fast installation, zero wahala. My boutique now runs AC all day — customers stay longer, sales went up.",
    name: "Mrs. Funke O.",
    location: "Ibadan, Oyo State",
    avatar: avatarFunke,
  },
  {
    quote: "One week after installation, they called to check on me. That kind of after-sales? In Nigeria? I was shocked.",
    name: "Chidi M.",
    location: "Wuse 2, Abuja",
    avatar: avatarChidi,
  },
  {
    quote: "During my final year, NEPA nearly ended my project. PawaMore saved me — I could study and code through the night. I graduated with a First Class.",
    name: "Tunde B.",
    location: "UNILAG, Lagos",
    avatar: avatarTunde,
  },
  {
    quote: "My family can now pray, study Quran at night, and the children do homework without candle. Alhamdulillah, this is a blessing for my household.",
    name: "Alhaji Musa K.",
    location: "GRA, Ilorin",
    avatar: avatarAlhaji,
  },
  {
    quote: "As a nurse working night shifts, I need my home ready when I get back. No more coming home to a hot, dark house. PawaMore changed everything.",
    name: "Ngozi E.",
    location: "Trans-Ekulu, Enugu",
    avatar: avatarNgozi,
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
            <MobileScrollSection showSwipeHint={true} showDots={true} showArrows={false} indicatorStyle="dots">
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
            <MobileScrollSection showSwipeHint={false} showDots={true} showArrows={false} indicatorStyle="bar">
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
            <MobileScrollSection showSwipeHint={false} showDots={true} showArrows={true} indicatorStyle="counter">
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
                    <div className="flex items-center gap-3">
                      <img src={t.avatar} alt={t.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover ring-2 ring-accent/30" loading="lazy" />
                      <div>
                        <div className="font-display font-bold text-sm sm:text-base text-accent">{t.name}</div>
                        <div className="text-primary-foreground/60 text-xs sm:text-sm">{t.location}</div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </MobileScrollSection>
          </div>
        </div>
      </section>

      {/* Why PawaMore Trust */}
      <section className="py-12 sm:py-20 md:py-28 bg-primary diagonal-top -mt-6 sm:-mt-8 pt-20 sm:pt-28 pb-16 sm:pb-24">
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

      {/* Epic transition divider — Nigerian skyline + energy story */}
      <div className="relative bg-primary -mb-1 overflow-visible">
        
        {/* Main landscape SVG */}
        <svg viewBox="0 0 1440 260" className="w-full block h-[140px] sm:h-[200px] md:h-[260px]" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sunsetGlow" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="hsl(37, 91%, 55%)" stopOpacity="0.2" />
              <stop offset="60%" stopColor="hsl(37, 91%, 45%)" stopOpacity="0.08" />
              <stop offset="100%" stopColor="hsl(152, 53%, 9%)" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="energyFlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(37, 91%, 55%)" stopOpacity="0" />
              <stop offset="30%" stopColor="hsl(37, 91%, 55%)" stopOpacity="0.7" />
              <stop offset="50%" stopColor="hsl(37, 91%, 65%)" stopOpacity="1" />
              <stop offset="70%" stopColor="hsl(37, 91%, 55%)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="hsl(37, 91%, 55%)" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="sunDisc" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(37, 95%, 70%)" />
              <stop offset="60%" stopColor="hsl(37, 91%, 55%)" />
              <stop offset="100%" stopColor="hsl(37, 80%, 40%)" stopOpacity="0.6" />
            </radialGradient>
            <radialGradient id="sunHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(37, 91%, 55%)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="hsl(37, 91%, 55%)" stopOpacity="0" />
            </radialGradient>
            {/* Flicker filter for window lights */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Sky base */}
          <rect width="1440" height="260" fill="hsl(152, 65%, 29%)" />

          {/* Sunset glow behind city */}
          <ellipse cx="720" cy="100" rx="600" ry="120" fill="url(#sunsetGlow)" />

          {/* Sun disc with halo */}
          <circle cx="720" cy="65" r="80" fill="url(#sunHalo)" />
          <circle cx="720" cy="65" r="35" fill="url(#sunDisc)" filter="url(#softGlow)">
            <animate attributeName="r" values="33;37;33" dur="4s" repeatCount="indefinite" />
          </circle>

          {/* ===== BACK LAYER — distant buildings (lighter) ===== */}
          <g opacity="0.3">
            {/* Far left apartments */}
            <rect x="30" y="105" width="25" height="95" fill="hsl(152, 53%, 9%)" rx="1" />
            <rect x="60" y="115" width="20" height="85" fill="hsl(152, 53%, 9%)" rx="1" />
            {/* Far center */}
            <rect x="520" y="100" width="18" height="100" fill="hsl(152, 53%, 9%)" rx="1" />
            <rect x="545" y="110" width="22" height="90" fill="hsl(152, 53%, 9%)" rx="1" />
            {/* Far right */}
            <rect x="1050" y="108" width="20" height="92" fill="hsl(152, 53%, 9%)" rx="1" />
            <rect x="1380" y="100" width="25" height="100" fill="hsl(152, 53%, 9%)" rx="1" />
            <rect x="1410" y="110" width="30" height="90" fill="hsl(152, 53%, 9%)" rx="1" />
          </g>

          {/* ===== MID LAYER — main buildings ===== */}
          <g opacity="0.55">
            {/* Left residential cluster */}
            <rect x="80" y="95" width="35" height="105" fill="hsl(152, 53%, 9%)" rx="1" />
            <rect x="120" y="110" width="28" height="90" fill="hsl(152, 53%, 9%)" rx="1" />
            <rect x="155" y="100" width="30" height="100" fill="hsl(152, 53%, 9%)" rx="1" />
            {/* Pitched roof house */}
            <path d="M200,120 L215,100 L230,120 L230,200 L200,200 Z" fill="hsl(152, 53%, 9%)" />
            
            {/* Center-left — house with SOLAR PANELS */}
            <rect x="350" y="105" width="80" height="95" fill="hsl(152, 53%, 9%)" rx="1" />
            {/* Angled solar panel array on roof */}
            <polygon points="348,105 432,105 440,85 340,85" fill="hsl(152, 40%, 15%)" stroke="hsl(37, 91%, 55%)" strokeWidth="0.8" strokeOpacity="0.6" />
            {/* Panel grid lines */}
            <line x1="362" y1="105" x2="356" y2="85" stroke="hsl(37, 91%, 55%)" strokeWidth="0.5" strokeOpacity="0.4" />
            <line x1="380" y1="105" x2="374" y2="85" stroke="hsl(37, 91%, 55%)" strokeWidth="0.5" strokeOpacity="0.4" />
            <line x1="398" y1="105" x2="392" y2="85" stroke="hsl(37, 91%, 55%)" strokeWidth="0.5" strokeOpacity="0.4" />
            <line x1="416" y1="105" x2="410" y2="85" stroke="hsl(37, 91%, 55%)" strokeWidth="0.5" strokeOpacity="0.4" />
            {/* Glowing panel reflection */}
            <polygon points="348,105 432,105 440,85 340,85" fill="hsl(37, 91%, 55%)" fillOpacity="0.08">
              <animate attributeName="fill-opacity" values="0.05;0.15;0.05" dur="3s" repeatCount="indefinite" />
            </polygon>

            {/* Mosque with dome and minaret */}
            <rect x="610" y="90" width="50" height="110" fill="hsl(152, 53%, 9%)" rx="1" />
            <ellipse cx="635" cy="90" rx="25" ry="12" fill="hsl(152, 53%, 9%)" />
            {/* Crescent on dome */}
            <path d="M632,78 A4,4 0 1,1 638,78 A3,3 0 1,0 632,78" fill="hsl(37, 91%, 55%)" fillOpacity="0.5" />
            {/* Minaret */}
            <rect x="670" y="70" width="8" height="130" fill="hsl(152, 53%, 9%)" rx="1" />
            <circle cx="674" cy="68" r="4" fill="hsl(37, 91%, 55%)" fillOpacity="0.4" />

            {/* Church spire */}
            <rect x="770" y="95" width="35" height="105" fill="hsl(152, 53%, 9%)" rx="1" />
            <path d="M775,95 L787,65 L800,95" fill="hsl(152, 53%, 9%)" />
            <line x1="787" y1="65" x2="787" y2="58" stroke="hsl(152, 53%, 9%)" strokeWidth="2" />
            <line x1="783" y1="62" x2="791" y2="62" stroke="hsl(152, 53%, 9%)" strokeWidth="1.5" />

            {/* Right commercial district */}
            <rect x="950" y="85" width="30" height="115" fill="hsl(152, 53%, 9%)" rx="1" />
            <rect x="985" y="95" width="40" height="105" fill="hsl(152, 53%, 9%)" rx="1" />
            <rect x="1030" y="80" width="25" height="120" fill="hsl(152, 53%, 9%)" rx="1" />
            
            {/* Tall telecom tower */}
            <rect x="1130" y="55" width="8" height="145" fill="hsl(152, 53%, 9%)" rx="0.5" />
            <line x1="1118" y1="80" x2="1146" y2="80" stroke="hsl(152, 53%, 9%)" strokeWidth="1.5" />
            <line x1="1122" y1="95" x2="1142" y2="95" stroke="hsl(152, 53%, 9%)" strokeWidth="1" />
            {/* Blinking tower light */}
            <circle cx="1134" cy="53" r="2.5" fill="hsl(0, 80%, 55%)" fillOpacity="0.8">
              <animate attributeName="fill-opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
            </circle>

            {/* Right apartments + solar */}
            <rect x="1200" y="100" width="45" height="100" fill="hsl(152, 53%, 9%)" rx="1" />
            <rect x="1255" y="90" width="35" height="110" fill="hsl(152, 53%, 9%)" rx="1" />
            {/* Solar panels on right building */}
            <polygon points="1200,100 1245,100 1250,85 1195,85" fill="hsl(152, 40%, 15%)" stroke="hsl(37, 91%, 55%)" strokeWidth="0.6" strokeOpacity="0.4" />
            <polygon points="1200,100 1245,100 1250,85 1195,85" fill="hsl(37, 91%, 55%)" fillOpacity="0.06">
              <animate attributeName="fill-opacity" values="0.04;0.12;0.04" dur="3.5s" repeatCount="indefinite" />
            </polygon>
          </g>

          {/* ===== FRONT LAYER — foreground elements ===== */}

          {/* Palm trees */}
          {/* Palm 1 — left */}
          <path d="M260,165 Q262,130 258,110" fill="none" stroke="hsl(152, 35%, 18%)" strokeWidth="4" />
          <path d="M258,110 Q240,105 225,115" fill="none" stroke="hsl(152, 50%, 25%)" strokeWidth="2.5" />
          <path d="M258,110 Q250,95 238,100" fill="none" stroke="hsl(152, 50%, 25%)" strokeWidth="2" />
          <path d="M258,110 Q265,95 275,98" fill="none" stroke="hsl(152, 50%, 25%)" strokeWidth="2.5" />
          <path d="M258,110 Q270,100 282,108" fill="none" stroke="hsl(152, 50%, 25%)" strokeWidth="2" />
          <path d="M258,110 Q255,95 250,90" fill="none" stroke="hsl(152, 50%, 25%)" strokeWidth="1.5" />

          {/* Palm 2 — right */}
          <path d="M880,170 Q882,138 878,118" fill="none" stroke="hsl(152, 35%, 18%)" strokeWidth="3.5" />
          <path d="M878,118 Q860,112 848,120" fill="none" stroke="hsl(152, 50%, 25%)" strokeWidth="2" />
          <path d="M878,118 Q872,103 862,108" fill="none" stroke="hsl(152, 50%, 25%)" strokeWidth="1.8" />
          <path d="M878,118 Q888,105 898,110" fill="none" stroke="hsl(152, 50%, 25%)" strokeWidth="2" />
          <path d="M878,118 Q892,112 900,118" fill="none" stroke="hsl(152, 50%, 25%)" strokeWidth="1.8" />

          {/* Palm 3 — far right small */}
          <path d="M1340,172 Q1342,148 1339,135" fill="none" stroke="hsl(152, 35%, 18%)" strokeWidth="3" />
          <path d="M1339,135 Q1325,130 1318,138" fill="none" stroke="hsl(152, 50%, 25%)" strokeWidth="1.8" />
          <path d="M1339,135 Q1348,125 1358,130" fill="none" stroke="hsl(152, 50%, 25%)" strokeWidth="1.8" />
          <path d="M1339,135 Q1335,122 1330,120" fill="none" stroke="hsl(152, 50%, 25%)" strokeWidth="1.5" />

          {/* Window lights — animated flicker */}
          <g filter="url(#glow)">
            {/* Left building windows */}
            <rect x="88" y="108" width="4" height="4" fill="hsl(37, 91%, 55%)" fillOpacity="0.7" rx="0.5">
              <animate attributeName="fill-opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite" />
            </rect>
            <rect x="100" y="118" width="4" height="4" fill="hsl(37, 91%, 55%)" fillOpacity="0.5" rx="0.5" />
            <rect x="88" y="130" width="4" height="4" fill="hsl(37, 91%, 55%)" fillOpacity="0.6" rx="0.5">
              <animate attributeName="fill-opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite" />
            </rect>
            {/* Center building windows */}
            <rect x="618" y="105" width="4" height="5" fill="hsl(37, 91%, 55%)" fillOpacity="0.4" rx="0.5" />
            <rect x="640" y="115" width="4" height="5" fill="hsl(37, 91%, 55%)" fillOpacity="0.5" rx="0.5">
              <animate attributeName="fill-opacity" values="0.5;0.15;0.5" dur="2.5s" repeatCount="indefinite" />
            </rect>
            {/* Right building windows */}
            <rect x="958" y="100" width="4" height="4" fill="hsl(37, 91%, 55%)" fillOpacity="0.6" rx="0.5" />
            <rect x="968" y="112" width="4" height="4" fill="hsl(37, 91%, 55%)" fillOpacity="0.4" rx="0.5">
              <animate attributeName="fill-opacity" values="0.4;0.1;0.4" dur="3.5s" repeatCount="indefinite" />
            </rect>
            <rect x="995" y="108" width="5" height="4" fill="hsl(37, 91%, 55%)" fillOpacity="0.55" rx="0.5" />
            <rect x="1010" y="120" width="5" height="4" fill="hsl(37, 91%, 55%)" fillOpacity="0.4" rx="0.5" />
            <rect x="1038" y="95" width="4" height="4" fill="hsl(37, 91%, 55%)" fillOpacity="0.5" rx="0.5">
              <animate attributeName="fill-opacity" values="0.5;0.2;0.5" dur="2.8s" repeatCount="indefinite" />
            </rect>
            <rect x="1210" y="112" width="4" height="4" fill="hsl(37, 91%, 55%)" fillOpacity="0.5" rx="0.5" />
            <rect x="1225" y="125" width="4" height="4" fill="hsl(37, 91%, 55%)" fillOpacity="0.4" rx="0.5">
              <animate attributeName="fill-opacity" values="0.4;0.1;0.4" dur="2.2s" repeatCount="indefinite" />
            </rect>
            <rect x="1262" y="105" width="4" height="4" fill="hsl(37, 91%, 55%)" fillOpacity="0.55" rx="0.5" />
            <rect x="1270" y="118" width="4" height="4" fill="hsl(37, 91%, 55%)" fillOpacity="0.35" rx="0.5" />
          </g>

          {/* Stars in the sky */}
          <circle cx="150" cy="30" r="1" fill="hsl(0, 0%, 100%)" fillOpacity="0.3">
            <animate attributeName="fill-opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="320" cy="18" r="0.8" fill="hsl(0, 0%, 100%)" fillOpacity="0.25" />
          <circle cx="500" cy="25" r="1" fill="hsl(0, 0%, 100%)" fillOpacity="0.2">
            <animate attributeName="fill-opacity" values="0.2;0.05;0.2" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="920" cy="20" r="0.8" fill="hsl(0, 0%, 100%)" fillOpacity="0.25" />
          <circle cx="1100" cy="28" r="1" fill="hsl(0, 0%, 100%)" fillOpacity="0.3">
            <animate attributeName="fill-opacity" values="0.3;0.08;0.3" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="1350" cy="15" r="0.7" fill="hsl(0, 0%, 100%)" fillOpacity="0.2" />

          {/* Ground wave — organic terrain */}
          <path d="M0,175 C180,160 360,180 540,168 C720,156 900,175 1080,162 C1260,150 1350,170 1440,165 L1440,260 L0,260 Z" fill="hsl(152, 53%, 9%)" fillOpacity="0.9" />

          {/* Energy flow line — animated pulse across the city */}
          <path d="M0,173 C180,158 360,178 540,166 C720,154 900,173 1080,160 C1260,148 1350,168 1440,163" fill="none" stroke="url(#energyFlow)" strokeWidth="2.5" strokeLinecap="round">
            <animate attributeName="stroke-dasharray" values="0,2880;1440,1440;2880,0" dur="5s" repeatCount="indefinite" />
          </path>

          {/* Second subtle energy line */}
          <path d="M0,178 C180,163 360,183 540,171 C720,159 900,178 1080,165 C1260,153 1350,173 1440,168" fill="none" stroke="hsl(37, 91%, 55%)" strokeWidth="0.8" strokeOpacity="0.15" strokeDasharray="8,12">
            <animate attributeName="stroke-dashoffset" values="0;-40" dur="2s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>

      {/* Final CTA */}
      <section className="relative py-12 sm:py-20 md:py-28 overflow-hidden -mt-1">
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
