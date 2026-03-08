import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSent(true);
    setLoading(false);
  };

  return (
    <Layout>
      <section className="py-12 sm:py-20">
        <div className="container max-w-md px-4">
          <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-[var(--shadow-card)]">
            <h1 className="font-display font-extrabold text-2xl mb-2">Reset Password</h1>
            {sent ? (
              <div className="bg-primary/10 text-primary text-sm rounded-lg p-4 text-center">
                <p>Check your email for a password reset link.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <input type="email" placeholder="Your email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <Button type="submit" variant="amber" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link →"}
                </Button>
              </form>
            )}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline">← Back to Login</Link>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ForgotPassword;
