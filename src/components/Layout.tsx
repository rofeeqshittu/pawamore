import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SEOHelmet from "./SEOHelmet";
import ErrorBoundary from "./ErrorBoundary";
import LiveChat from "./support/LiveChat";

interface LayoutProps {
  children: ReactNode;
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: string;
}

const Layout = ({ children, seoTitle, seoDescription, seoImage }: LayoutProps) => {
  return (
    <ErrorBoundary>
      <SEOHelmet 
        title={seoTitle}
        description={seoDescription}
        image={seoImage}
      />
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold">
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" role="main" className="flex-1 pt-[calc(6px+3.5rem)] xs:pt-[calc(6px+4rem)] md:pt-[calc(6px+5rem)]">
          {children}
        </main>
        <Footer />
        <LiveChat />
      </div>
    </ErrorBoundary>
  );
};

export default Layout;
