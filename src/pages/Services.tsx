import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ClipboardCheck, Sun, Battery, Cpu, Package, HeartHandshake } from "lucide-react";

const services = [
  {
    icon: ClipboardCheck,
    title: "Free Power Audit",
    desc: "Before we recommend a single product, we want to understand your situation.",
    details: [
      "Your daily power consumption and peak load requirements",
      "Your current generator or NEPA usage and cost",
      "Your goals — budget, timeline, and what you need to power",
      "A personalised written recommendation with pricing",
    ],
    note: "This service is completely free. No obligation. No hard sell.",
  },
  {
    icon: Sun,
    title: "Solar Panel Installation",
    desc: "We supply and install monocrystalline solar panels from verified global manufacturers.",
    details: [
      "Rooftop and ground-mount installations",
      "200W to 500W+ panels — residential and commercial",
      "Full wiring, earthing, and safety installation",
      "Integration with existing inverter or new system",
    ],
  },
  {
    icon: Battery,
    title: "Battery Storage Systems",
    desc: "Modern lithium batteries are the heart of a reliable home power system.",
    details: [
      "Home PowerTank systems from 3.5kWh to 20kWh+",
      "EcoFlow, Itel Energy, Felicity, and other premium brands",
      "Safe installation, BMS-protected, professionally commissioned",
    ],
  },
  {
    icon: Cpu,
    title: "Hybrid Inverter Systems",
    desc: "A hybrid inverter manages solar, battery, and grid power simultaneously.",
    details: [
      "3.5kVA to 10kVA+ hybrid inverters",
      "Seamless switching between solar, battery, grid, and generator",
      "Remote monitoring capability",
      "Suitable for homes, offices, and commercial properties",
    ],
  },
  {
    icon: Package,
    title: "Turnkey System Design & Installation",
    desc: "Complete solution — from site assessment to final commissioning.",
    details: [
      "Load calculation and system design",
      "Product selection and sourcing",
      "Full installation by certified technicians",
      "System commissioning, testing, and customer training",
      "Handover documentation and warranty certificate",
    ],
  },
  {
    icon: HeartHandshake,
    title: "After-Sales Support & Maintenance",
    desc: "This is where PawaMore is different. We don't disappear after installation.",
    details: [
      "7-day post-installation follow-up call",
      "90-day performance guarantee — we fix issues free",
      "WhatsApp technical support line",
      "Annual maintenance packages available",
      "System expansion planning as your needs grow",
    ],
  },
];

const Services = () => (
  <Layout>
    {/* Hero */}
    <section className="relative py-20 md:py-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute inset-0 kente-pattern opacity-20" />
      <div className="container relative z-10 text-center">
        <ScrollReveal>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-6">
            Full-Service Energy Solutions
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            From Consultation to Long-Term Support. We don't just sell products. We design, install, and support complete power systems.
          </p>
        </ScrollReveal>
      </div>
    </section>

    {/* Services */}
    <section className="py-20 md:py-28">
      <div className="container space-y-16">
        {services.map((service, i) => (
          <ScrollReveal key={i} delay={100}>
            <div className={`grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 items-start ${
              i % 2 === 1 ? "lg:grid-cols-[1.5fr_1fr] direction-rtl" : ""
            }`}>
              <div className={`${i % 2 === 1 ? "lg:order-2" : ""}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shrink-0">
                    <service.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <span className="text-xs font-display font-bold text-accent uppercase tracking-wider">Service {i + 1}</span>
                    <h2 className="text-2xl md:text-3xl font-extrabold">{service.title}</h2>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">{service.desc}</p>
                {service.note && (
                  <p className="text-primary font-semibold text-sm italic">{service.note}</p>
                )}
              </div>
              <div className={`bg-secondary rounded-2xl p-6 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                <ul className="space-y-3">
                  {service.details.map((detail, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                      <span className="text-muted-foreground text-sm leading-relaxed">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {i < services.length - 1 && <div className="kente-strip mt-16" />}
          </ScrollReveal>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 bg-primary">
      <div className="container text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-6">
          Ready to Get Started?
        </h2>
        <Link to="/contact">
          <Button variant="amber" size="xl">Get Started — Book Free Power Audit →</Button>
        </Link>
      </div>
    </section>
  </Layout>
);

export default Services;
