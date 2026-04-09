import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import useSEO from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FAQSection {
  key: string;
  title: string;
  description: string;
}

const SECTION_CONFIG: FAQSection[] = [
  {
    key: "getting_started",
    title: "Getting Started",
    description: "Everything you need before your first solar purchase.",
  },
  {
    key: "system_sizing_reliability",
    title: "System Sizing & Reliability",
    description: "Practical answers for real-life usage in Nigeria.",
  },
  {
    key: "delivery_support_trust",
    title: "Delivery, Support & Trust",
    description: "How we handle delivery, support, and after-sales experience.",
  },
];

const fallbackFaqs: FAQItem[] = [
  {
    id: "fallback-1",
    category: "getting_started",
    question: "How much does a solar system cost in Nigeria?",
    answer:
      "Most customers fall into tiers based on load, not house size alone. Entry backup setups are lower-cost, while full home/business independence costs more. The most accurate route is a load-based quote from our free power audit.",
  },
  {
    id: "fallback-2",
    category: "getting_started",
    question: "How do I know what size to buy?",
    answer:
      "Start with daily energy use (kWh/day) and peak load (W). Our calculator gives a first estimate; we then refine with your outage pattern, night-use loads, and installation conditions before final recommendation.",
  },
  {
    id: "fallback-3",
    category: "getting_started",
    question: "I am renting. Can I still go solar?",
    answer:
      "Yes. Tenant-friendly options include portable/plug-and-play backup and non-invasive setups. If rooftop permission is available, we can scale to a stronger hybrid system.",
  },
  {
    id: "fallback-4",
    category: "system_sizing_reliability",
    question: "Will solar work during rainy season?",
    answer:
      "Yes. Output drops on cloudy days, but systems are designed with battery backup and sizing margins to carry critical loads. Final sizing depends on your required autonomy and usage habits.",
  },
  {
    id: "fallback-5",
    category: "system_sizing_reliability",
    question: "Can one setup power AC, fridge, and pump together?",
    answer:
      "Often yes, but these are surge-heavy loads. We size inverter surge capacity and protection correctly to avoid nuisance trips and premature component stress.",
  },
  {
    id: "fallback-6",
    category: "system_sizing_reliability",
    question: "How long do lithium batteries last?",
    answer:
      "Quality LiFePO4 batteries typically deliver long cycle life under proper charging and temperature conditions. We guide you on operating practices that preserve battery health and ROI.",
  },
  {
    id: "fallback-7",
    category: "delivery_support_trust",
    question: "Do you deliver outside Lagos?",
    answer:
      "Yes. We support nationwide product delivery and provide guided setup/install pathways based on your location and project scope.",
  },
  {
    id: "fallback-8",
    category: "delivery_support_trust",
    question: "What happens after I buy?",
    answer:
      "You get post-purchase support for setup, usage guidance, and troubleshooting. Our team remains available on WhatsApp for quick follow-up help.",
  },
  {
    id: "fallback-9",
    category: "delivery_support_trust",
    question: "What if my exact model is not listed on your site yet?",
    answer:
      "No problem. We can recommend the closest in-catalog equivalent or source the best-fit option while we continue expanding our product catalog.",
  },
  {
    id: "fallback-10",
    category: "delivery_support_trust",
    question: "How quickly can I get a quote?",
    answer:
      "After your load details are confirmed, we usually respond with a structured recommendation and quote path quickly via WhatsApp or email.",
  },
];

const normalizeCategory = (category: string): string => {
  const raw = category
    .toLowerCase()
    .trim()
    .replaceAll("&", "and")
    .replace(/\s+/g, "_");

  if (raw === "getting_started" || raw === "general") {
    return "getting_started";
  }

  if (
    raw === "system_sizing_reliability" ||
    raw === "system_sizing_and_reliability" ||
    raw === "products"
  ) {
    return "system_sizing_reliability";
  }

  if (
    raw === "delivery_support_trust" ||
    raw === "orders" ||
    raw === "payments" ||
    raw === "shipping" ||
    raw === "returns" ||
    raw === "services"
  ) {
    return "delivery_support_trust";
  }

  return raw;
};

const titleFromCategory = (category: string): string =>
  category
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const descriptionFromCategory = (category: string): string =>
  category === "getting_started"
    ? "Everything you need before your first solar purchase."
    : category === "system_sizing_reliability"
      ? "Practical answers for real-life usage in Nigeria."
      : category === "delivery_support_trust"
        ? "How we handle delivery, support, and after-sales experience."
        : "Additional helpful answers.";

const FAQs = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  useSEO({
    title: "Frequently Asked Questions — PawaMore Systems",
    description:
      "Answers to common questions about solar installation cost, battery lifespan, installation time, payment plans, and more. PawaMore Systems Nigeria.",
  });

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data } = await supabase
        .from("faq_items")
        .select("id, question, answer, category")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      if (data && data.length > 0) {
        setFaqs(data);
      }
    };

    fetchFaqs();
  }, []);

  const sourceFaqs = faqs.length > 0 ? faqs : fallbackFaqs;

  const groupedSections = useMemo(() => {
    const grouped = new Map<string, FAQItem[]>();

    sourceFaqs.forEach((faq) => {
      const category = normalizeCategory(faq.category || "getting_started");
      const current = grouped.get(category) || [];
      current.push(faq);
      grouped.set(category, current);
    });

    const knownSections = SECTION_CONFIG.filter((section) =>
      grouped.has(section.key),
    ).map((section) => ({
      ...section,
      items: grouped.get(section.key) || [],
    }));

    const knownKeys = new Set(SECTION_CONFIG.map((section) => section.key));
    const customSections = Array.from(grouped.entries())
      .filter(([key]) => !knownKeys.has(key))
      .map(([key, items]) => ({
        key,
        title: titleFromCategory(key),
        description: descriptionFromCategory(key),
        items,
      }));

    return [...knownSections, ...customSections];
  }, [sourceFaqs]);

  const totalQuestions = sourceFaqs.length;

  return (
    <Layout>
      <section
        className="relative py-20 md:py-28"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute inset-0 kente-pattern opacity-20" />
        <div className="container relative z-10 text-center">
          <ScrollReveal>
            <h1 className="mb-4 text-4xl font-extrabold text-primary-foreground md:text-5xl lg:text-6xl">
              Got Questions? <span className="text-accent">Honest Answers.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-primary-foreground/80 md:text-base">
              Real guidance for Nigerian homes and businesses: sizing,
              reliability, delivery, and support.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Badge className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20">
                {totalQuestions}+ practical answers
              </Badge>
              <Badge className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20">
                Live FAQs from admin dashboard
              </Badge>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container max-w-3xl space-y-10">
          {groupedSections.map((section, sectionIndex) => (
            <div key={section.key}>
              <ScrollReveal delay={sectionIndex * 60}>
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-foreground md:text-2xl">
                      {section.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                  <Badge variant="secondary">{section.items.length} questions</Badge>
                </div>
              </ScrollReveal>

              <Accordion type="single" collapsible className="space-y-4">
                {section.items.map((faq, itemIndex) => (
                  <ScrollReveal key={faq.id} delay={itemIndex * 50}>
                    <AccordionItem
                      value={`${section.key}-${faq.id}`}
                      className="rounded-xl border border-border bg-card px-6 shadow-sm"
                    >
                      <AccordionTrigger className="py-5 text-left font-display text-base font-bold hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-5 leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </ScrollReveal>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary py-16">
        <div className="container text-center">
          <h3 className="mb-2 text-xl font-extrabold text-foreground md:text-2xl">
            Still Unsure? Let’s size it together.
          </h3>
          <p className="mx-auto mb-6 max-w-xl text-sm text-muted-foreground md:text-base">
            Tell us your appliances, outage hours, and budget. We’ll recommend a
            realistic setup path — no overselling.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="https://wa.me/2347062716154?text=Hi%20PawaMore%2C%20I%20need%20help%20sizing%20my%20solar%20setup."
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="default" size="xl">
                Still Have Questions? WhatsApp Us →
              </Button>
            </a>
            <Link to="/contact">
              <Button variant="amber" size="xl">
                Book Your Free Power Audit →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQs;
