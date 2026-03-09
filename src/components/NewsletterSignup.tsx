import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

interface NewsletterSignupProps {
  variant?: "default" | "compact" | "inline";
  source?: string;
  className?: string;
}

const NewsletterSignup = ({ variant = "default", source = "website", className = "" }: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate email
      emailSchema.parse({ email });
      
      setLoading(true);

      const { error } = await supabase
        .from("newsletter_subscriptions")
        .insert({
          email: email.toLowerCase().trim(),
          source: "website",
          user_agent: navigator.userAgent,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({ 
            title: "Already subscribed! 📧", 
            description: "You're already on our mailing list.",
          });
        } else {
          throw error;
        }
      } else {
        toast({ 
          title: "Subscribed successfully! 🎉", 
          description: "Welcome to our newsletter!" 
        });
        setEmail("");
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({ 
          title: "Invalid email", 
          description: error.errors[0].message, 
          variant: "destructive" 
        });
      } else {
        console.error("Newsletter subscription error:", error);
        toast({ 
          title: "Subscription failed", 
          description: "Please try again later.",
          variant: "destructive" 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (variant === "compact") {
    return (
      <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Newsletter</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Get updates on new products and energy-saving tips
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            className="text-xs"
          />
          <Button 
            type="submit" 
            disabled={loading} 
            size="sm"
            variant="amber"
          >
            {loading ? "..." : "Join"}
          </Button>
        </form>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 max-w-md ${className}`}>
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        <Button 
          type="submit" 
          disabled={loading}
          variant="amber"
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
    );
  }

  // Default variant - full section
  return (
    <div className={`text-center ${className}`}>
      <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-2 mb-4">
        <Mail className="w-4 h-4 text-primary" />
        <span className="text-xs font-display font-semibold text-primary uppercase tracking-wider">
          Newsletter
        </span>
      </div>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
        Stay <span className="text-accent">Powered Up</span>
      </h2>
      <p className="text-muted-foreground max-w-xl mx-auto mb-6">
        Get the latest updates on energy solutions, exclusive deals, and expert tips to maximize your power savings.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          className="flex-1"
        />
        <Button 
          type="submit" 
          disabled={loading}
          variant="amber"
          className="sm:w-auto"
        >
          {loading ? "Subscribing..." : "Subscribe Now"}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground mt-3">
        No spam, just valuable energy insights. Unsubscribe anytime.
      </p>
    </div>
  );
};

export default NewsletterSignup;