import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import useSEO from "@/hooks/useSEO";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  useSEO({
    title: post ? `${post.title} — PawaMore Systems Blog` : "Blog Post — PawaMore Systems",
    description: post?.intro ?? "Read practical energy and solar insights from PawaMore Systems.",
  });

  if (!post) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-extrabold mb-4">Post Not Found</h1>
          <Link to="/blog"><Button variant="default">← Back to Blog</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-10 sm:py-14 md:py-20" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 kente-pattern opacity-20" />
        <div className="container relative z-10 max-w-3xl">
          <ScrollReveal>
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-primary-foreground/70 hover:text-accent transition-colors text-sm mb-4 sm:mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <span className="inline-flex items-center gap-1 bg-accent/20 text-accent font-display font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-full px-2.5 sm:px-3 py-1">
                <Tag className="w-3 h-3" /> {post.tag}
              </span>
              <span className="flex items-center gap-1 text-primary-foreground/60 text-[10px] sm:text-xs">
                <Calendar className="w-3 h-3" /> {post.date}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary-foreground leading-tight">
              {post.title}
            </h1>
          </ScrollReveal>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 sm:py-16 md:py-20">
        <div className="container max-w-3xl px-4">
          <ScrollReveal>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 sm:mb-10 font-medium border-l-4 border-accent pl-4 sm:pl-6">
              {post.intro}
            </p>
          </ScrollReveal>

          <div className="space-y-4 sm:space-y-6">
            {post.content.map((block, i) => {
              if (block.startsWith("## ")) {
                return (
                  <ScrollReveal key={i}>
                    <h2 className="text-xl sm:text-2xl font-extrabold mt-6 sm:mt-10 mb-2 sm:mb-3">
                      {block.replace("## ", "")}
                    </h2>
                  </ScrollReveal>
                );
              }
              // Render bold text
              const parts = block.split(/(\*\*.*?\*\*)/g);
              return (
                <ScrollReveal key={i}>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {parts.map((part, j) =>
                      part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={j} className="text-foreground font-semibold">
                          {part.slice(2, -2)}
                        </strong>
                      ) : (
                        <span key={j}>{part}</span>
                      )
                    )}
                  </p>
                </ScrollReveal>
              );
            })}
          </div>

          {/* CTA */}
          <ScrollReveal>
            <div className="mt-10 sm:mt-16 bg-secondary rounded-xl sm:rounded-2xl p-6 sm:p-10 text-center border-2 border-primary/20">
              <h3 className="text-xl sm:text-2xl font-extrabold mb-3 sm:mb-4">Ready to Take the Next Step?</h3>
              <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">
                Book your free power audit with PawaMore Systems — no obligation, no hard sell.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/contact" className="w-full sm:w-auto">
                  <Button variant="amber" size="lg" className="w-full sm:w-auto">Book Free Power Audit →</Button>
                </Link>
                <a href="https://wa.me/2347062716154" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">WhatsApp Us →</Button>
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* Related */}
          <div className="mt-10 sm:mt-16">
            <h3 className="text-lg sm:text-xl font-extrabold mb-4 sm:mb-6">More Articles</h3>
            <div className="space-y-3 sm:space-y-4">
              {blogPosts
                .filter((p) => p.slug !== slug)
                .slice(0, 3)
                .map((p) => (
                  <Link
                    key={p.slug}
                    to={`/blog/${p.slug}`}
                    className="block bg-card rounded-xl border border-border p-4 sm:p-5 hover:border-primary/30 hover:shadow-[var(--shadow-card)] transition-all"
                  >
                    <span className="text-[10px] sm:text-xs font-display font-bold text-primary uppercase">{p.tag}</span>
                    <h4 className="font-display font-bold text-sm sm:text-base mt-1 leading-snug">{p.title}</h4>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BlogPost;
