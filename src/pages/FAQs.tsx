import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import useSEO from "@/hooks/useSEO";

const faqs = [
  { q: "How much does a solar system cost in Nigeria?", a: "Our systems start from ₦380,000 for a basic home battery setup, up to ₦5,000,000+ for a full commercial solar installation. The right price depends on your load, your home size, and your goals. That's why we offer a free power audit — to size the system correctly before quoting." },
  { q: "How long does installation take?", a: "Most residential installations take 1 working day. Larger commercial or estate projects may take 2–5 days. We give you a clear timeline when you book." },
  { q: "Will solar work during rainy season or cloudy days?", a: "Yes. Solar panels still generate electricity on cloudy days — less than full sun, but enough to charge your batteries. Your battery stores power for night and cloudy periods. We design systems with Nigeria's actual weather patterns in mind." },
  { q: "How long do lithium batteries last?", a: "Quality LiFePO4 lithium batteries typically last 8–12 years with normal use. This is 3–5 times longer than traditional lead-acid batteries. We specify battery lifespan in every quote." },
  { q: "What if my system develops a problem?", a: "Contact our support line or WhatsApp us. If the issue falls within our 90-Day Performance Guarantee window, we fix it free. Outside the guarantee, we offer paid support and maintenance services at fair rates." },
  { q: "Do I need my landlord's permission?", a: "For rooftop solar, yes — you need permission. However, we also offer battery-only and indoor systems that require no structural work and no landlord approval. Ask us about tenant-friendly options." },
  { q: "What brands do you use?", a: "We use EcoFlow, Itel Energy, Felicity Solar, Luminous, and other premium brands sourced from authorised Nigerian distributors. We never install grey market or unverified products." },
  { q: "Do you offer payment plans?", a: "We are working with fintech partners to offer instalment payment options on qualifying system sizes. Ask our team for current options when you book your audit." },
  { q: "How do I get a quote?", a: "Book a free power audit — we'll assess your load, ask a few questions, and send you a personalised written quote within 24 hours. No obligation, no hard sell." },
  { q: "Do you cover my city?", a: "We currently operate in Lagos, Oyo State (Ibadan), and Abuja, with nationwide product delivery available. If you're outside these areas, contact us — we're expanding." },
];

const FAQs = () => {
  useSEO({ title: "Frequently Asked Questions — PawaMore Systems", description: "Answers to common questions about solar installation cost, battery lifespan, installation time, payment plans, and more. PawaMore Systems Nigeria." });
  return (
  <Layout>
    <section className="relative py-20 md:py-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute inset-0 kente-pattern opacity-20" />
      <div className="container relative z-10 text-center">
        <ScrollReveal>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-4">
            Got Questions? <span className="text-accent">Honest Answers.</span>
          </h1>
        </ScrollReveal>
      </div>
    </section>

    <section className="py-20 md:py-28">
      <div className="container max-w-3xl">
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 50}>
              <AccordionItem value={`faq-${i}`} className="bg-card rounded-xl border border-border px-6 shadow-sm">
                <AccordionTrigger className="font-display font-bold text-left text-base hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            </ScrollReveal>
          ))}
        </Accordion>
      </div>
    </section>

    <section className="py-16 bg-secondary">
      <div className="container text-center">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="https://wa.me/2340000000000" target="_blank" rel="noopener noreferrer">
            <Button variant="default" size="xl">Still Have Questions? WhatsApp Us →</Button>
          </a>
          <Link to="/contact"><Button variant="amber" size="xl">Book Your Free Power Audit →</Button></Link>
        </div>
      </div>
    </section>
  </Layout>
  );
};

export default FAQs;
