import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Battery, Sun, Zap, CheckCircle } from "lucide-react";
import batteryImg from "@/assets/battery-system.jpg";
import useSEO from "@/hooks/useSEO";

const batteryProducts = [
  {
    name: "Starter Battery System",
    powers: "Fridge, 2 fans, TV, lights, phone charging",
    battery: "3.5kWh Lithium Battery",
    price: "From ₦380,000",
    ideal: "Perfect for renters & apartments",
    popular: false,
  },
];

const solarCombos = [
  {
    name: "Standard Home System",
    popular: true,
    specs: ["2 × 400W Solar Panels", "3.5kWh Lithium Battery", "3.5kVA Hybrid Inverter", "Full installation & commissioning", "90-Day Guarantee"],
    powers: "Fridge, 2 fans, TV, lights, phone charging — all day and night",
    price: "From ₦780,000 installed",
  },
  {
    name: "Premium Home System",
    popular: false,
    specs: ["6 × 400W Solar Panels", "10kWh Lithium Battery Bank", "5kVA Hybrid Inverter", "Full installation & commissioning", "90-Day Guarantee"],
    powers: "Full home load including AC, washing machine, fridge, all lights",
    price: "From ₦2,200,000 installed",
  },
];

const brands = ["EcoFlow", "Itel Energy", "Felicity Solar", "Luminous", "Bluetti"];

const Products = () => {
  useSEO({ title: "Solar Systems & Battery Products — PawaMore Systems Nigeria", description: "Home battery systems from ₦380,000. Solar + battery combos from ₦780,000. EcoFlow, Itel Energy, Felicity Solar. Genuine products, professionally installed." });
  return (
  <Layout>
    {/* Hero */}
    <section className="relative py-20 md:py-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute inset-0 kente-pattern opacity-20" />
      <div className="container relative z-10 text-center">
        <ScrollReveal>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-6">
            World-Class Energy Products.
            <br className="hidden md:block" />
            <span className="text-accent">Expertly Installed.</span>
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            We source only from authorised distributors and verified manufacturers. Every product is genuine, warranted, and installed by our certified team.
          </p>
        </ScrollReveal>
      </div>
    </section>

    {/* Battery Systems */}
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <div>
              <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-1.5 mb-4">
                <Battery className="w-4 h-4 text-primary" />
                <span className="text-sm font-display font-semibold text-primary">Category 1</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                Home Battery & <span className="text-accent">PowerTank</span> Systems
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Lithium home batteries are the fastest, most accessible way to get reliable power — no rooftop needed, no complex installation. They charge from NEPA or solar and power your home through outages.
              </p>
              <div className="bg-secondary rounded-2xl p-8 border-2 border-primary/20">
                <h3 className="font-display font-bold text-xl mb-2">{batteryProducts[0].name}</h3>
                <p className="text-sm text-muted-foreground mb-3">Powers: {batteryProducts[0].powers}</p>
                <p className="text-sm text-muted-foreground mb-4">{batteryProducts[0].battery}</p>
                <div className="font-display font-extrabold text-2xl text-primary mb-1">{batteryProducts[0].price}</div>
                <p className="text-sm text-accent font-semibold">{batteryProducts[0].ideal}</p>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <img src={batteryImg} alt="Home battery system installation" className="rounded-2xl shadow-[var(--shadow-elevated)]" />
          </ScrollReveal>
        </div>
      </div>
    </section>

    {/* Solar + Battery Combos */}
    <section className="py-20 md:py-28 bg-secondary kente-pattern">
      <div className="container">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-card rounded-full px-4 py-1.5 mb-4">
              <Sun className="w-4 h-4 text-primary" />
              <span className="text-sm font-display font-semibold text-primary">Category 2 — Most Popular</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold">Solar + Battery <span className="text-accent">Combined Systems</span></h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Solar panels charge your batteries during the day. Your battery powers your home at night. Zero fuel. Permanent power.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {solarCombos.map((combo, i) => (
            <ScrollReveal key={i} delay={i * 150}>
              <div className={`rounded-2xl overflow-hidden border-2 bg-card ${
                combo.popular ? "border-accent" : "border-border"
              }`}>
                {combo.popular && (
                  <div className="bg-accent text-foreground text-center py-2 font-display font-bold text-xs uppercase tracking-wider">
                    ⭐ Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h3 className="font-display font-bold text-xl mb-4">{combo.name}</h3>
                  <ul className="space-y-2 mb-6">
                    {combo.specs.map((spec, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" /> {spec}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground mb-4 bg-secondary rounded-lg p-3">
                    <strong>Powers:</strong> {combo.powers}
                  </p>
                  <div className="font-display font-extrabold text-2xl text-primary">{combo.price}</div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    {/* Brands */}
    <section className="py-16">
      <div className="container text-center">
        <ScrollReveal>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-8">Brands We <span className="text-accent">Carry</span></h2>
          <div className="flex flex-wrap justify-center gap-6">
            {brands.map((brand) => (
              <div key={brand} className="bg-secondary rounded-xl px-8 py-4 font-display font-bold text-primary text-lg">
                {brand}
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-sm mt-6 max-w-xl mx-auto">
            All products are sourced from authorised Nigerian distributors. Every product comes with the manufacturer's original warranty — plus PawaMore's own 90-day installation guarantee.
          </p>
        </ScrollReveal>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 bg-forest">
      <div className="container text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-6">Not Sure Which System?</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/contact"><Button variant="amber" size="xl">Book a Free Audit →</Button></Link>
          <a href="https://wa.me/2340000000000" target="_blank" rel="noopener noreferrer">
            <Button variant="hero-outline" size="xl">WhatsApp Us to Order →</Button>
          </a>
        </div>
      </div>
    </section>
  </Layout>
  );
};

export default Products;
