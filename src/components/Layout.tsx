import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SEOHelmet from "./SEOHelmet";
import ErrorBoundary from "./ErrorBoundary";

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
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 pt-[calc(6px+3.5rem)] xs:pt-[calc(6px+4rem)] md:pt-[calc(6px+5rem)]">
          {children}
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default Layout;
