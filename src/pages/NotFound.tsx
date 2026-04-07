import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";
import useSEO from "@/hooks/useSEO";

const NotFound = () => {
  const location = useLocation();

  useSEO({ title: "Page Not Found — PawaMore Systems", description: "The page you're looking for doesn't exist." });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-8xl font-display font-extrabold text-primary/20 mb-2">404</div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-3">Page Not Found</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Sorry, we couldn't find the page you're looking for. It may have been moved or doesn't exist.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button variant="amber" size="lg" className="w-full sm:w-auto min-h-[44px]">
                <Home className="w-4 h-4 mr-2" /> Go Home
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" size="lg" className="w-full sm:w-auto min-h-[44px]">
                <Search className="w-4 h-4 mr-2" /> Browse Shop
              </Button>
            </Link>
          </div>
          <button onClick={() => window.history.back()} className="mt-4 text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Go back
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
