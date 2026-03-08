import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Brain, Handshake, Flag, Heart, MapPin } from "lucide-react";
import familyImg from "@/assets/family-power.jpg";
import useSEO from "@/hooks/useSEO";

const values = [
  { icon: Shield, title: "Reliability", desc: "We do what we say, every time. Our installations are done right. Our products are genuine. Our support is real." },
  { icon: Brain, title: "Expertise", desc: "We know our systems deeply. We give customers the right solution — not the most expensive one." },
  { icon: Handshake, title: "Honesty", desc: "Transparent pricing. No gimmicks. No over-promising. We tell you exactly what you need and why." },
  { icon: Flag, title: "Local Pride", desc: "We are Nigerian. We understand the heat, the grid, the budget, and the lifestyle. This is home." },
  { icon: Heart, title: "Care", desc: "After the sale is where our relationship begins. We show up. We follow up. We stand behind every system we install." },
];

const About = () => {
  useSEO({ title: "About PawaMore Systems — Nigeria's Most Trusted Energy Company", description: "PawaMore Systems was founded to make reliable, clean, affordable power accessible to every Nigerian home and business. Offices in Lagos, Abuja, and Ibadan." });
  return (
    <Layout>
    {/* Hero */}
    <section className="relative py-12 sm:py-16 md:py-28 overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute inset-0 kente-pattern opacity-20" />
      <div className="container relative z-10">
        <ScrollReveal>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-6">
            We Are Nigerian.<br /><span className="text-accent">We Built This For Us.</span>
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl leading-relaxed">
            PawaMore Systems was founded with one mission: to make reliable, clean, affordable power accessible to every Nigerian home and business — and to do it with the expertise, honesty, and after-sales care that this market has never received.
          </p>
        </ScrollReveal>
      </div>
    </section>

    {/* Our Story */}
    <section className="py-20 md:py-28">
      <div className="container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <ScrollReveal>
          <div className="relative">
            <img src={familyImg} alt="Nigerian family with reliable power" className="rounded-2xl shadow-[var(--shadow-elevated)]" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/20 rounded-2xl -z-10" />
          </div>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6">Why PawaMore <span className="text-accent">Exists</span></h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Nigeria has some of the most driven, creative, and resilient people on earth. Every day, those people — entrepreneurs, parents, students, professionals — are fighting an energy system that was never built for them.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We started PawaMore Systems because we got tired of watching Nigerians spend billions every year on generator fuel, breathing fumes, losing businesses, and living on NEPA's unpredictable schedule.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            PawaMore Systems is not a product shop. It is a <strong>systems integrator</strong> — we design, supply, install, and support complete energy solutions that change how our customers live and work. Every single day.
          </p>
        </ScrollReveal>
      </div>
    </section>

    {/* Mission & Vision */}
    <section className="py-20 bg-secondary kente-pattern">
      <div className="container grid grid-cols-1 md:grid-cols-2 gap-8">
        <ScrollReveal>
          <div className="bg-card rounded-2xl p-10 shadow-[var(--shadow-card)] h-full">
            <h3 className="font-display font-extrabold text-2xl text-primary mb-4">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              To make reliable, clean power accessible to every Nigerian home, business, and community — delivered with expertise, trust, and lasting support.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <div className="bg-card rounded-2xl p-10 shadow-[var(--shadow-card)] h-full">
            <h3 className="font-display font-extrabold text-2xl text-primary mb-4">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              To become Nigeria's most trusted energy systems company — known for quality installations, honest service, and building a cleaner power future.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>

    {/* Values */}
    <section className="py-20 md:py-28">
      <div className="container">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">What We <span className="text-accent">Stand For</span></h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((v, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div className="bg-card rounded-xl p-8 shadow-[var(--shadow-card)] border-b-4 border-primary hover:border-accent transition-colors">
                <v.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-display font-bold text-xl mb-3">{v.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{v.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    {/* Where We Operate */}
    <section className="py-16 bg-forest">
      <div className="container text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-primary-foreground mb-8">Where We Operate</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {["Lagos", "Oyo State (Ibadan)", "Abuja (FCT)", "Nationwide Delivery"].map((city) => (
            <div key={city} className="flex items-center gap-2 bg-primary-foreground/10 rounded-full px-6 py-3">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="text-primary-foreground font-medium">{city}</span>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link to="/contact"><Button variant="amber" size="lg">Book Your Free Power Audit →</Button></Link>
        </div>
      </div>
    </section>
  </Layout>
);

export default About;
