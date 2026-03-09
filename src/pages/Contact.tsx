import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MessageCircle, MapPin } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import useSEO from "@/hooks/useSEO";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  phone: z.string().trim().min(1, "Phone number is required").max(20, "Phone number must be less than 20 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  city: z.string().trim().max(100, "City must be less than 100 characters").optional(),
  interest: z.string().trim().max(100, "Interest must be less than 100 characters").optional(),
  message: z.string().trim().max(1000, "Message must be less than 1000 characters").optional()
});

const Contact = () => {
  useSEO({ title: "Contact PawaMore Systems — Solar Installation Enquiries", description: "Reach PawaMore Systems via WhatsApp, phone, or email. Offices in Lagos, Ibadan, and Abuja. Book your free power audit today." });
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", city: "", interest: "", message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const validatedData = contactSchema.parse(formData);
      
      setSubmitting(true);

      // Submit to database
      const { error } = await supabase
        .from("contact_submissions")
        .insert({
          name: validatedData.name,
          phone: validatedData.phone,
          email: validatedData.email,
          city: validatedData.city || null,
          interest: validatedData.interest || null,
          message: validatedData.message || null,
          user_agent: navigator.userAgent,
        });

      if (error) throw error;

      toast({ 
        title: "Message sent successfully! 🎉", 
        description: "We'll get back to you within 2 hours during business hours." 
      });

      // Reset form
      setFormData({ name: "", phone: "", email: "", city: "", interest: "", message: "" });

      // Also offer WhatsApp option
      setTimeout(() => {
        if (confirm("Would you also like to reach us on WhatsApp for faster response?")) {
          const whatsappMsg = `Hi PawaMore! I'm ${validatedData.name} from ${validatedData.city}. I'm interested in: ${validatedData.interest}. ${validatedData.message}`;
          window.open(`https://wa.me/YOUR_WHATSAPP_NUMBER_HERE?text=${encodeURIComponent(whatsappMsg)}`, "_blank");
        }
      }, 1000);
    } catch (error: any) {
      console.error("Contact form error:", error);
      if (error instanceof z.ZodError) {
        toast({ 
          title: "Validation Error", 
          description: error.errors[0].message, 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Failed to send message", 
          description: "Please try again or contact us directly.",
          variant: "destructive" 
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="relative py-20 md:py-28" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 kente-pattern opacity-20" />
        <div className="container relative z-10 text-center">
          <ScrollReveal>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-4">
              We're Here. <span className="text-accent">Real People. Real Support.</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Whether you have a question, need a quote, or want to book an installation — reach us the way that works best for you.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Details */}
            <div className="space-y-8">
              <ScrollReveal>
                <h2 className="text-3xl font-extrabold mb-8">Get In <span className="text-accent">Touch</span></h2>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { icon: MessageCircle, title: "WhatsApp", detail: "+234 706 271 6154", sub: "Our fastest channel — respond within the hour", href: "https://wa.me/2347062716154" },
                  { icon: Phone, title: "Phone", detail: "+234 706 271 6154", sub: "Mon–Sat | 8am–6pm", href: "tel:+2347062716154" },
                  { icon: Mail, title: "Email", detail: "support@pawamore.com", sub: "Response within 24 hours", href: "mailto:support@pawamore.com" },
                ].map((c, i) => (
                  <ScrollReveal key={i} delay={i * 100}>
                    <a href={c.href} target="_blank" rel="noopener noreferrer" className="block bg-card rounded-xl p-6 border border-border hover:border-primary hover:shadow-[var(--shadow-card)] transition-all group">
                      <c.icon className="w-8 h-8 text-primary group-hover:text-accent transition-colors mb-3" />
                      <h3 className="font-display font-bold text-lg">{c.title}</h3>
                      <p className="text-primary font-semibold text-sm mt-1">{c.detail}</p>
                      <p className="text-muted-foreground text-xs mt-1">{c.sub}</p>
                    </a>
                  </ScrollReveal>
                ))}
              </div>

              {/* Offices */}
              <ScrollReveal>
                <h3 className="font-display font-bold text-xl mb-4">Our Offices</h3>
                <div className="space-y-4">
                  {[
                    { city: "Lagos Office", areas: "Lagos Island, Mainland, Lekki, VI, Ikeja" },
                    { city: "Ibadan Office", areas: "Ibadan, Oyo Town, and surrounding areas" },
                    { city: "Abuja Office", areas: "Wuse, Gwarinpa, Maitama, Asokoro" },
                  ].map((office, i) => (
                    <div key={i} className="flex items-start gap-3 bg-secondary rounded-lg p-4">
                      <MapPin className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                      <div>
                        <div className="font-display font-bold text-sm">{office.city}</div>
                        <div className="text-muted-foreground text-xs">Installations: {office.areas}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>

            {/* Form */}
            <ScrollReveal delay={200}>
              <div className="bg-card rounded-2xl p-8 border border-border shadow-[var(--shadow-card)]">
                <h3 className="font-display font-extrabold text-2xl mb-6">Send Us a Message</h3>
                <p className="text-muted-foreground text-sm mb-6">Fill in the form below and we'll get back to you within 2 hours during business hours.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="text" 
                    placeholder="Full Name *" 
                    required
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={submitting}
                    maxLength={100}
                  />
                  <Input
                    type="tel" 
                    placeholder="Phone Number *" 
                    required
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={submitting}
                    maxLength={20}
                  />
                  <Input
                    type="email" 
                    placeholder="Email *" 
                    required
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={submitting}
                    maxLength={255}
                  />
                  <Input
                    type="text" 
                    placeholder="City"
                    value={formData.city} 
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    disabled={submitting}
                    maxLength={100}
                  />
                  <select
                    value={formData.interest} 
                    onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                    disabled={submitting}
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">I'm interested in...</option>
                    <option>Home Battery System</option>
                    <option>Solar + Battery System</option>
                    <option>Commercial Installation</option>
                    <option>Maintenance & Support</option>
                    <option>Just Enquiring</option>
                  </select>
                  <Textarea
                    placeholder="Your Message" 
                    rows={4}
                    value={formData.message} 
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    disabled={submitting}
                    maxLength={1000}
                  />
                  <Button type="submit" variant="amber" className="w-full" size="lg" disabled={submitting}>
                    {submitting ? "Sending..." : "Send Message →"}
                  </Button>
                </form>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;