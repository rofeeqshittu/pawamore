import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <section className="py-12 sm:py-20">
        <div className="container max-w-md px-4">
          <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-[var(--shadow-card)]">
            <h1 className="font-display font-extrabold text-2xl mb-4">Set New Password</h1>
            {error && <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 mb-4">{error}</div>}
            {success ? (
              <div className="bg-primary/10 text-primary text-sm rounded-lg p-4 text-center">
                Password updated! Redirecting to login...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="password" placeholder="New password (min 6 chars)" required minLength={6}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <Button type="submit" variant="amber" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Updating..." : "Update Password →"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ResetPassword;
