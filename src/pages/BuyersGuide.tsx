import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import useSEO from "@/hooks/useSEO";

const guideSections = [
  {
    id: "why-solar-now",
    title: "Why Solar Now",
    content:
      "Grid instability and generator fuel costs make solar economics stronger than ever. For many households, the smarter question is no longer if to switch, but how to size correctly so the investment pays back faster.",
    bullets: [
      "Track your current monthly generator + diesel/petrol spend.",
      "Compare that against a properly sized hybrid solar setup.",
      "Prioritize reliability, not only lowest upfront price.",
    ],
  },
  {
    id: "know-your-load",
    title: "Know Your Load First",
    content:
      "The biggest buying mistake is choosing system size by guesswork. List appliances, wattage, and usage hours, then add a safety margin so your system performs well in real-life conditions.",
    bullets: [
      "Calculate daily kWh from appliance wattage and run time.",
      "Include surge-heavy devices (fridge, pump, AC) during sizing.",
      "Add a design buffer for cloudy days and future additions.",
    ],
  },
  {
    id: "system-type",
    title: "Pick the Right System Type",
    content:
      "For most urban users, hybrid systems are the most practical: solar first, battery backup second, and grid support when needed. Off-grid is useful for zero-grid areas; battery-only works for renters and starter setups.",
    bullets: [
      "Hybrid: best fit for most homes and small businesses.",
      "Off-grid: for locations without dependable grid access.",
      "Battery-only: low-friction entry for tenants and apartments.",
    ],
  },
  {
    id: "components",
    title: "Understand Core Components",
    content:
      "Performance depends on panel quality, inverter capability, battery chemistry, and correct installation. A weak component in one area can reduce the value of the full system.",
    bullets: [
      "Use pure sine wave hybrid inverter with proper surge capacity.",
      "Choose battery chemistry for lifecycle, not only purchase price.",
      "Ask for clear specs and warranty terms before payment.",
    ],
  },
  {
    id: "battery-decision",
    title: "Battery Decision (Most Important)",
    content:
      "Battery quality and sizing drive reliability. Lithium (especially LiFePO4) usually gives better long-term value for daily cycling compared to cheaper short-life alternatives.",
    bullets: [
      "Focus on usable capacity and cycle life, not sticker Ah alone.",
      "Confirm depth-of-discharge assumptions in your quote.",
      "Avoid undersized batteries that force deep discharge every night.",
    ],
  },
  {
    id: "budget-roi",
    title: "Budget & ROI Planning",
    content:
      "A complete quote should include equipment, installation, protection, commissioning, and after-sales support. Low prices with hidden add-ons often become more expensive over time.",
    bullets: [
      "Request itemized pricing with installation included.",
      "Compare lifetime cost, not just day-one cost.",
      "Use phased upgrades if full system is outside immediate budget.",
    ],
  },
  {
    id: "installer-vetting",
    title: "How to Vet an Installer",
    content:
      "Installer quality affects outcomes as much as hardware. Good teams validate load, explain tradeoffs clearly, and provide visible post-install support.",
    bullets: [
      "Ask for recent installation examples and customer references.",
      "Verify support response path after installation.",
      "Choose teams that explain limits, not just promises.",
    ],
  },
  {
    id: "maintenance",
    title: "Maintenance & Long-Term Success",
    content:
      "Solar systems are low-maintenance but not zero-maintenance. Light preventive care improves lifespan and helps you keep expected performance.",
    bullets: [
      "Keep panel surfaces reasonably clean and shade-free.",
      "Monitor battery/inverter alerts early to prevent downtime.",
      "Schedule periodic checks for wiring, protections, and settings.",
    ],
  },
];

const BuyersGuide = () => {
  useSEO({
    title: "Solar Buyer's Guide (Nigeria) — PawaMore Systems",
    description:
      "A practical buyer's guide for Nigerian homes and businesses: sizing, batteries, inverters, budgeting, installer vetting, and maintenance.",
  });

  return (
    <Layout>
      <section className="relative py-12 sm:py-16 md:py-24" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 kente-pattern opacity-20" />
        <div className="container relative z-10 text-center">
          <ScrollReveal>
            <h1 className="mb-3 text-3xl font-extrabold text-primary-foreground sm:text-4xl md:text-5xl">
              Solar Buyer&apos;s Guide <span className="text-accent">for Nigeria</span>
            </h1>
            <p className="mx-auto max-w-3xl text-sm text-primary-foreground/85 sm:text-base">
              Everything you need to choose confidently without getting overwhelmed. Read the sections in order or
              jump to what you need.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Badge className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20">
                8 practical sections
              </Badge>
              <Badge className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20">
                Mobile-first format
              </Badge>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="border-b border-border py-5">
        <div className="container">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {guideSections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="shrink-0">
                <Badge variant="secondary" className="px-3 py-1.5 text-xs">
                  {section.title}
                </Badge>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="container max-w-4xl">
          <Accordion type="single" collapsible className="space-y-3">
            {guideSections.map((section, index) => (
              <ScrollReveal key={section.id} delay={index * 40}>
                <AccordionItem
                  id={section.id}
                  value={section.id}
                  className="rounded-xl border border-border bg-card px-4 shadow-sm md:px-6"
                >
                  <AccordionTrigger className="py-5 text-left font-display text-sm font-bold hover:no-underline sm:text-base">
                    <span className="mr-2 text-primary">{String(index + 1).padStart(2, "0")}.</span>
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    <p>{section.content}</p>
                    <ul className="space-y-2">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </ScrollReveal>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="bg-secondary py-12">
        <div className="container text-center">
          <h2 className="mb-2 text-xl font-extrabold text-foreground sm:text-2xl">Take the next step</h2>
          <p className="mx-auto mb-6 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Use your actual appliance profile for a more accurate recommendation and a realistic purchase path.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/solar-calculator">
              <Button variant="default" size="xl">
                Calculate My Solar Setup →
              </Button>
            </Link>
            <Link to="/faqs">
              <Button variant="outline" size="xl">
                Read FAQs →
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="amber" size="xl">
                Book Free Power Audit →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BuyersGuide;
