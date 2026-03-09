import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";
import NewsletterSignup from "@/components/NewsletterSignup";

const Footer = () => {
  return (
    <footer className="bg-forest text-primary-foreground">
      <div className="kente-strip" />
      
      {/* Newsletter Section */}
      <div className="container py-10 border-b border-primary-foreground/10">
        <div className="max-w-xl mx-auto text-center">
          <NewsletterSignup source="footer" />
        </div>
      </div>

      <div className="container py-16">
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
    </footer>);

};

export default Footer;