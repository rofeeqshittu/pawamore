import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";
import mascotFooter from "@/assets/mascot-footer.png";
import NewsletterSignup from "@/components/NewsletterSignup";

const Footer = () => {
  return (
    <footer className="bg-forest text-primary-foreground relative">
      {/* Mascot sitting on top of footer */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-16 sm:-top-20 md:-top-24 z-20 pointer-events-none select-none">
        <img 
          src={mascotFooter} 
          alt="" 
          aria-hidden="true"
          className="w-20 sm:w-28 md:w-36 h-auto drop-shadow-lg animate-float"
        />
      </div>
      <div className="kente-strip" />
      
      {/* Newsletter Section */}
      <div className="container py-10 border-b border-primary-foreground/10">
        <div className="max-w-xl mx-auto text-center">
          <NewsletterSignup source="footer" />
        </div>
      </div>

      <div className="relative overflow-hidden">
        {/* Giant watermark logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden="true">
          <img 
            src={logo} 
            alt="" 
            className="w-[500px] sm:w-[600px] md:w-[700px] lg:w-[800px] h-auto opacity-[0.04] blur-[1px]"
            style={{ filter: 'grayscale(100%) brightness(2) blur(1px)' }}
          />
        </div>

        {/* Subtle radial glow behind watermark */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          aria-hidden="true"
          style={{ 
            background: 'radial-gradient(ellipse 60% 50% at 50% 55%, hsl(152 65% 29% / 0.08) 0%, transparent 70%)' 
          }} 
        />

        <div className="container py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-3 sm:mb-4">
                <img src={logo} alt="PawaMore Systems" className="h-8 sm:h-10 w-auto rounded-lg" />
                <div>
                  <div className="font-display font-extrabold text-lg leading-none">PawaMore</div>
                  <div className="font-display text-[10px] uppercase tracking-[0.2em] text-primary-foreground/60">Systems</div>
                </div>
              </Link>
              <p className="text-primary-foreground/70 text-sm leading-relaxed">
                Powering Nigeria. Powering More. Clean, reliable energy for homes and businesses.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display font-bold text-accent mb-4 uppercase text-sm tracking-wider">Quick Links</h4>
              <div className="flex flex-col gap-2">
                {[
                { to: "/services", label: "Services" },
                { to: "/products", label: "Products" },
                { to: "/shop", label: "Shop" },
                { to: "/why-pawamore", label: "Why PawaMore" },
                { to: "/about", label: "About Us" },
                { to: "/faqs", label: "FAQs" }].
                map((l) =>
                <Link key={l.to} to={l.to} className="text-primary-foreground/70 hover:text-accent transition-colors text-sm">
                    {l.label}
                  </Link>
                )}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display font-bold text-accent mb-4 uppercase text-sm tracking-wider">Contact</h4>
              <div className="flex flex-col gap-3 text-sm text-primary-foreground/70">
                <a className="flex items-center gap-2 hover:text-accent transition-colors" href="tel:+2347062716154">
                  <Phone className="w-4 h-4" /> +234 706 271 6154
                </a>
                <a href="mailto:hello@pawamore.com.ng" className="flex items-center gap-2 hover:text-accent transition-colors">
                  <Mail className="w-4 h-4" /> hello@pawamore.com.ng
                </a>
                <Link to="/order-lookup" className="hover:text-accent transition-colors">
                  Track Your Order
                </Link>
              </div>
            </div>

            {/* Locations */}
            <div>
              <h4 className="font-display font-bold text-accent mb-4 uppercase text-sm tracking-wider">Locations</h4>
              <div className="flex flex-col gap-3 text-sm text-primary-foreground/70">
                {["Lagos", "Ibadan, Oyo State", "Abuja, FCT"].map((city) =>
                <div key={city} className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent/70" /> {city}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="kente-strip mt-12 mb-6" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/50">
            <span>© 2026 PawaMore Systems. All rights reserved.</span>
            <span>Powering Nigeria. Powering More.</span>
          </div>
        </div>
      </div>
    </footer>);

};

export default Footer;