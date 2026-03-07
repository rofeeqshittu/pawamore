import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle, Shield } from "lucide-react";

const comparison = [
  { label: "After-sales support", market: "None — they disappear after payment", pawa: "7-day follow-up, 90-day guarantee, ongoing support" },
  { label: "Installation quality", market: "Informal, no training, no SOP", pawa: "Certified team, clean install, documented process" },
  { label: "Product authenticity", market: "Grey market, no guarantee", pawa: "Authorised distributors only, original warranty" },
  { label: "Free consultation", market: "Jump straight to selling", pawa: "Free power audit before any recommendation" },
  { label: "Brand accountability", market: "No address, no name, no recourse", pawa: "Named brand, real offices in 3 cities, CAC registered" },
  { label: "Price transparency", market: "Hidden charges, vague quotes", pawa: "Full itemised quote — no surprises" },
  { label: "Expertise", market: "Generalist traders", pawa: "Energy systems specialists" },
];

const WhyPawamore = () => (
  <Layout>
    <section className="relative py-20 md:py-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute inset-0 kente-pattern opacity-20" />
      <div className="container relative z-10 text-center">
        <ScrollReveal>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-6">
            There Are Many Energy Companies.
            <br className="hidden md:block" />
            <span className="text-accent">Here's Why PawaMore Is Different.</span>
          </h1>
        </ScrollReveal>
      </div>
    </section>

    {/* Comparison Table */}
    <section className="py-20 md:py-28">
      <div className="container max-w-4xl">
        <ScrollReveal>
          <h2 className="text-3xl font-extrabold text-center mb-10">The Honest <span className="text-accent">Comparison</span></h2>
        </ScrollReveal>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-forest">
                <th className="text-left p-4 font-display font-bold text-primary-foreground text-sm">What Matters</th>
                <th className="text-left p-4 font-display font-bold text-primary-foreground/70 text-sm">Typical Market</th>
                <th className="text-left p-4 font-display font-bold text-accent text-sm">PawaMore Systems ✅</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, i) => (
                <tr key={i} className={`border-b border-border ${i % 2 === 0 ? "bg-secondary/50" : "bg-card"}`}>
                  <td className="p-4 font-display font-semibold text-sm">{row.label}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                      {row.market}
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {row.pawa}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    {/* 90-Day Guarantee */}
    <section className="py-20 bg-forest relative overflow-hidden">
      <div className="absolute inset-0 kente-pattern opacity-10" />
      <div className="container relative z-10 max-w-3xl text-center">
        <ScrollReveal>
          <Shield className="w-16 h-16 text-accent mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-6">
            The PawaMore <span className="text-accent">90-Day</span> Performance Guarantee
          </h2>
          <p className="text-primary-foreground/80 leading-relaxed text-lg mb-4">
            If your system does not perform exactly as we specified within the first 90 days — we fix it. Free. No arguments. No excuses.
          </p>
          <p className="text-primary-foreground/70 leading-relaxed">
            This guarantee covers system performance, installation quality, and product function. It is written on your handover certificate and backed by our company. <strong className="text-accent">No other energy company in Nigeria offers this.</strong>
          </p>
        </ScrollReveal>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16">
      <div className="container text-center">
        <Link to="/contact">
          <Button variant="amber" size="xl">Experience the PawaMore Difference — Book Free Audit →</Button>
        </Link>
      </div>
    </section>
  </Layout>
);

export default WhyPawamore;
