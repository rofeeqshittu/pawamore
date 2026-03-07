import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";

const posts = [
  {
    title: "How Much Does Solar Installation Cost in Nigeria in 2026?",
    intro: "Solar installation costs in Nigeria vary widely — from ₦380,000 for a basic home battery system to ₦5,000,000+ for a full commercial solar setup. In this guide, we break down exactly what drives those prices.",
    tag: "Pricing Guide",
    date: "2026",
  },
  {
    title: "Generator vs Solar in Nigeria: The True Cost Comparison (2026)",
    intro: "Most Nigerians think solar is expensive and generators are cheaper. The opposite is true — and we have the numbers to prove it.",
    tag: "Cost Analysis",
    date: "2026",
  },
  {
    title: "EcoFlow vs Itel Energy vs Felicity Solar: Which Home Battery is Best?",
    intro: "Three of the most popular home battery brands in Nigeria right now. We've installed hundreds using all three. Here's our honest comparison.",
    tag: "Product Review",
    date: "2026",
  },
  {
    title: "How to Calculate the Right Solar System Size for Your Nigerian Home",
    intro: "One of the biggest solar mistakes Nigerians make is buying a system that's too small. This step-by-step guide shows you how to get it right.",
    tag: "How-To Guide",
    date: "2026",
  },
  {
    title: "5 Questions to Ask Before You Hire a Solar Installer in Nigeria",
    intro: "Not all solar installers are created equal. Before you hand over your money, these five critical questions will separate the trustworthy from the scammers.",
    tag: "Buyer's Guide",
    date: "2026",
  },
];

const Blog = () => (
  <Layout>
    <section className="relative py-20 md:py-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute inset-0 kente-pattern opacity-20" />
      <div className="container relative z-10 text-center">
        <ScrollReveal>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-4">
            Energy Tips & <span className="text-accent">Solar Guides</span>
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Honest guides on solar installation, battery systems, and how to cut your energy bills in Nigeria.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="py-20 md:py-28">
      <div className="container max-w-4xl space-y-8">
        {posts.map((post, i) => (
          <ScrollReveal key={i} delay={i * 100}>
            <article className="bg-card rounded-2xl border border-border p-8 hover:shadow-[var(--shadow-elevated)] hover:border-primary/30 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-primary/10 text-primary font-display font-bold text-xs uppercase tracking-wider rounded-full px-3 py-1">
                  {post.tag}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Calendar className="w-3 h-3" /> {post.date}
                </span>
              </div>
              <h2 className="font-display font-bold text-xl md:text-2xl mb-3 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{post.intro}</p>
              <div className="flex items-center gap-2 text-primary font-display font-bold text-sm group-hover:gap-3 transition-all">
                Read Full Article <ArrowRight className="w-4 h-4" />
              </div>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>

    <section className="py-16 bg-secondary">
      <div className="container text-center">
        <p className="text-muted-foreground mb-4">Have a question about solar power in Nigeria?</p>
        <Link to="/contact"><Button variant="default" size="lg">Ask Us Anything →</Button></Link>
      </div>
    </section>
  </Layout>
);

export default Blog;
