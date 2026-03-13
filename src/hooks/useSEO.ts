import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

const useSEO = ({ title, description, image, url, type = "website" }: SEOProps) => {
  useEffect(() => {
    document.title = title;

    const updateMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    updateMeta("name", "description", description);
    updateMeta("property", "og:title", title);
    updateMeta("property", "og:description", description);
    updateMeta("property", "og:type", type);
    updateMeta("property", "og:site_name", "PawaMore Systems");
    updateMeta("name", "twitter:card", "summary_large_image");
    updateMeta("name", "twitter:title", title);
    updateMeta("name", "twitter:description", description);

    if (image) {
      // Ensure absolute URL for OG image
      const absoluteImage = image.startsWith("http") ? image : `${window.location.origin}${image}`;
      updateMeta("property", "og:image", absoluteImage);
      updateMeta("name", "twitter:image", absoluteImage);
    }

    if (url) {
      const absoluteUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
      updateMeta("property", "og:url", absoluteUrl);
    } else {
      updateMeta("property", "og:url", window.location.href);
    }
  }, [title, description, image, url, type]);
};

export default useSEO;
