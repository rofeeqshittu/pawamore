import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import useSEO from "@/hooks/useSEO";

const faqSections = [
  {
    title: "Getting Started",
    description: "Everything you need before your first solar purchase.",
    items: [
      {
        q: "How much does a solar system cost in Nigeria?",
        a: "Most customers fall into tiers based on load, not house size alone. Entry backup setups are lower-cost, while full home/business independence costs more. The most accurate route is a load-based quote from our free power audit.",
      },
      {
        q: "How do I know what size to buy?",
        a: "Start with daily energy use (kWh/day) and peak load (W). Our calculator gives a first estimate; we then refine with your outage pattern, night-use loads, and installation conditions before final recommendation.",
      },
      {
        q: "I am renting. Can I still go solar?",
        a: "Yes. Tenant-friendly options include portable/plug-and-play backup and non-invasive setups. If rooftop permission is available, we can scale to a stronger hybrid system.",
      },
    ],
  },
  {
    title: "System Sizing & Reliability",
    description: "Practical answers for real life usage in Nigeria.",
    items: [
      {
        q: "Will solar work during rainy season?",
        a: "Yes. Output drops on cloudy days, but systems are designed with battery backup and sizing margins to carry critical loads. Final sizing depends on your required autonomy and usage habits.",
      },
      {
        q: "Can one setup power AC, fridge, and pump together?",
        a: "Often yes, but these are surge-heavy loads. We size inverter surge capacity and protection correctly to avoid nuisance trips and premature component stress.",
      },
      {
        q: "How long do lithium batteries last?",
        a: "Quality LiFePO4 batteries typically deliver long cycle life under proper charging and temperature conditions. We guide you on operating practices that preserve battery health and ROI.",
      },
    ],
  },
  {
    title: "Delivery, Support & Trust",
    description: "How we handle delivery, support, and after-sales experience.",
    items: [
      {
        q: "Do you deliver outside Lagos?",
        a: "Yes. We support nationwide product delivery and provide guided setup/install pathways based on your location and project scope.",
      },
      {
        q: "What happens after I buy?",
        a: "You get post-purchase support for setup, usage guidance, and troubleshooting. Our team remains available on WhatsApp for quick follow-up help.",
      },
      {
        q: "What if my exact model is not listed on your site yet?",
        a: "No problem. We can recommend the closest in-catalog equivalent or source the best-fit option while we continue expanding our product catalog.",
      },
      {
        q: "How quickly can I get a quote?",
        a: "After your load details are confirmed, we usually respond with a structured recommendation and quote path quickly via WhatsApp or email.",
      },
    ],
  },
];

const totalQuestions = faqSections.reduce((sum, section) => sum + section.items.length, 0);

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
          <p className="mx-auto max-w-2xl text-sm text-primary-foreground/80 md:text-base">
            Real guidance for Nigerian homes and businesses: sizing, reliability, delivery, and support.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Badge className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20">
              {totalQuestions}+ practical answers
            </Badge>
            <Badge className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20">
              Built for phone-first users
            </Badge>
            <Badge className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20">
              Nigeria-focused solar context
            </Badge>
          </div>
        </ScrollReveal>
      </div>
    </section>

    <section className="py-10 md:py-14">
      <div className="container max-w-4xl space-y-8 px-4">
        {faqSections.map((section, sectionIndex) => (
          <div key={section.title}>
            <ScrollReveal delay={sectionIndex * 60}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-extrabold text-foreground md:text-2xl">{section.title}</h2>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
                <Badge variant="secondary">{section.items.length} questions</Badge>
              </div>
            </ScrollReveal>

            <Accordion type="single" collapsible className="space-y-3">
              {section.items.map((faq, itemIndex) => (
                <ScrollReveal key={faq.q} delay={itemIndex * 40}>
                  <AccordionItem value={`${section.title}-${itemIndex}`} className="rounded-xl border border-border bg-card px-4 shadow-sm md:px-6">
                    <AccordionTrigger className="py-4 text-left font-display text-sm font-bold hover:no-underline md:text-base">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                </ScrollReveal>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </section>

    <section className="bg-secondary py-12 md:py-16">
      <div className="container text-center">
        <h3 className="mb-2 text-xl font-extrabold text-foreground md:text-2xl">Still Unsure? Let’s size it together.</h3>
        <p className="mx-auto mb-6 max-w-xl text-sm text-muted-foreground md:text-base">
          Tell us your appliances, outage hours, and budget. We’ll recommend a realistic setup path — no overselling.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <a href="https://wa.me/2347062716154?text=Hi%20PawaMore%2C%20I%20need%20help%20sizing%20my%20solar%20setup." target="_blank" rel="noopener noreferrer">
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
