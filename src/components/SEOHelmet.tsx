import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOHelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

const SEOHelmet = ({ 
  title = "PawaMore Systems — Solar & Battery Energy Solutions Nigeria",
  description = "Leading solar and battery energy solutions in Nigeria. From ₦380,000 home battery systems to premium solar installations. EcoFlow, Itel Energy, Felicity Solar products.",
  keywords = "solar panels Nigeria, battery systems Lagos, solar energy, power solutions, inverters, EcoFlow Nigeria, solar installation",
  image = "/placeholder.svg",
  url
}: SEOHelmetProps) => {
  const location = useLocation();
  const currentUrl = url || `https://pawamore.lovable.app${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:site_name', 'PawaMore Systems', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Additional SEO tags
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('author', 'PawaMore Systems');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // JSON-LD Structured Data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "PawaMore Systems",
      "description": description,
      "url": "https://pawamore.lovable.app",
      "logo": "https://pawamore.lovable.app/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+234-706-271-6154",
        "contactType": "customer service"
      },
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "NG"
      },
      "sameAs": [
        "https://wa.me/2347062716154"
      ]
    };

    let jsonLd = document.querySelector('script[type="application/ld+json"]');
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.setAttribute('type', 'application/ld+json');
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify(structuredData);

  }, [title, description, keywords, image, currentUrl]);

  return null;
};

export default SEOHelmet;