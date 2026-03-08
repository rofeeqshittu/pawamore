import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import useSEO from "@/hooks/useSEO";

const Signup = () => {
  useSEO({ title: "Sign Up — PawaMore Systems", description: "Create your PawaMore Systems account." });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <section className="py-12 sm:py-20">
        <div className="container max-w-md px-4">
          <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-[var(--shadow-card)]">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl mb-2">Create Account</h1>
            <p className="text-muted-foreground text-sm mb-6">Join PawaMore — get updates & leave reviews</p>

            {error && <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 mb-4">{error}</div>}
            {success ? (
              <div className="bg-primary/10 text-primary text-sm rounded-lg p-4 text-center">
                <p className="font-semibold mb-1">Check your email!</p>
                <p>We've sent a confirmation link to <strong>{email}</strong></p>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <input type="text" placeholder="Full Name" required value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <input type="password" placeholder="Password (min 6 chars)" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <Button type="submit" variant="amber" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Creating account..." : "Sign Up →"}
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log In</Link>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Signup;
