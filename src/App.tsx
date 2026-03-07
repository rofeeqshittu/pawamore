import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Products from "./pages/Products";
import WhyPawamore from "./pages/WhyPawamore";
import Blog from "./pages/Blog";
import FAQs from "./pages/FAQs";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
};

const PageWrapper = ({ children, title }: { children: React.ReactNode; title: string }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return <>{children}<ScrollToTop /></>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PageWrapper title="PawaMore Systems — Solar & Battery Installation Nigeria"><Index /></PageWrapper>} />
          <Route path="/about" element={<PageWrapper title="About PawaMore Systems — Nigeria's Most Trusted Energy Company"><About /></PageWrapper>} />
          <Route path="/services" element={<PageWrapper title="Solar & Battery Installation Services — PawaMore Systems"><Services /></PageWrapper>} />
          <Route path="/products" element={<PageWrapper title="Solar Systems & Battery Products — PawaMore Systems Nigeria"><Products /></PageWrapper>} />
          <Route path="/why-pawamore" element={<PageWrapper title="Why Choose PawaMore Systems? — Nigeria's Most Trusted Solar Installer"><WhyPawamore /></PageWrapper>} />
          <Route path="/blog" element={<PageWrapper title="Energy Tips & Solar Guides — PawaMore Systems Blog"><Blog /></PageWrapper>} />
          <Route path="/faqs" element={<PageWrapper title="Frequently Asked Questions — PawaMore Systems"><FAQs /></PageWrapper>} />
          <Route path="/contact" element={<PageWrapper title="Contact PawaMore Systems — Solar Installation Enquiries"><Contact /></PageWrapper>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
