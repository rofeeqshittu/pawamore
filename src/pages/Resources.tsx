import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Calculator, CheckCircle2, HelpCircle } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/data/blogPosts";
import useSEO from "@/hooks/useSEO";

const Resources = () => {
  useSEO({
    title: "Solar Resources Hub — PawaMore Systems",
    description:
      "Practical solar resources for Nigeria: buyer's guide, FAQs, calculator, and expert blog articles to help you choose the right system.",
  });

  const featuredPosts = blogPosts.slice(0, 4);

  return (
    <Layout>
      <section className="relative py-12 sm:py-16 md:py-24" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 kente-pattern opacity-20" />
        <div className="container relative z-10 text-center">
          <ScrollReveal>
            <h1 className="mb-3 text-3xl font-extrabold text-primary-foreground sm:text-4xl md:text-5xl">
              Solar Resources <span className="text-accent">That Actually Help</span>
            </h1>
            <p className="mx-auto max-w-3xl text-sm text-primary-foreground/85 sm:text-base">
              Clear, Nigeria-focused guidance without information overload. Start with our recommended path and
              go deeper only when you need it.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Badge className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20">
                Structured for mobile-first reading
              </Badge>
              <Badge className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20">
                Built for real buying decisions
              </Badge>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="container space-y-5">
          <ScrollReveal>
            <h2 className="text-xl font-extrabold sm:text-2xl">Recommended Path</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ScrollReveal>
              <Card className="h-full border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calculator className="h-4 w-4 text-amber" />
                    1. Start with your load
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Use the calculator for a fast estimate of inverter, battery, and panel sizing.</p>
                  <Link to="/solar-calculator">
                    <Button variant="outline" className="w-full justify-between">
                      Open Solar Calculator
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={80}>
              <Card className="h-full border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpen className="h-4 w-4 text-amber" />
                    2. Read the buyer’s guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Understand system types, battery decisions, budget, and installer vetting.</p>
                  <Link to="/resources/buyers-guide">
                    <Button variant="outline" className="w-full justify-between">
                      Open Buyer&apos;s Guide
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={160}>
              <Card className="h-full border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <HelpCircle className="h-4 w-4 text-amber" />
                    3. Resolve specific questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Use categorized FAQs when you want quick answers before speaking with us.</p>
                  <Link to="/faqs">
                    <Button variant="outline" className="w-full justify-between">
                      Browse FAQs
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-10 sm:py-14">
        <div className="container space-y-5">
          <ScrollReveal>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-xl font-extrabold sm:text-2xl">Latest Insights & Guides</h2>
              <Link to="/blog" className="text-sm font-semibold text-primary hover:underline">
                View all articles
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {featuredPosts.map((post, index) => (
              <ScrollReveal key={post.slug} delay={index * 80}>
                <Link to={`/blog/${post.slug}`} className="block">
                  <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]">
                    <CardHeader className="pb-3">
                      <Badge variant="secondary" className="w-fit">
                        {post.tag}
                      </Badge>
                      <CardTitle className="text-base leading-snug sm:text-lg">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <p className="line-clamp-3">{post.intro}</p>
                    </CardContent>
                  </Card>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <ScrollReveal>
            <Card className="border border-primary/20 bg-card">
              <CardContent className="space-y-4 p-6 sm:p-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <p className="text-sm text-muted-foreground sm:text-base">
                    We intentionally structure this library as <span className="font-semibold text-foreground">start → learn → decide</span>{" "}
                    so users don&apos;t get flooded with too much information at once.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link to="/contact">
                    <Button variant="default" size="lg" className="w-full sm:w-auto">
                      Book Free Power Audit →
                    </Button>
                  </Link>
                  <a
                    href="https://wa.me/2347062716154?text=Hi%20PawaMore%2C%20I%20need%20help%20choosing%20the%20right%20solar%20system."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Ask on WhatsApp
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Resources;
