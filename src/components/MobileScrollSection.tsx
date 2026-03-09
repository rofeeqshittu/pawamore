import { useRef, useState, useEffect, ReactNode, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileScrollSectionProps {
  children: ReactNode[];
  className?: string;
  showArrows?: boolean;
  showDots?: boolean;
  showSwipeHint?: boolean;
}

const MobileScrollSection = ({
  children,
  className = "",
  showArrows = true,
  showDots = true,
  showSwipeHint = true,
}: MobileScrollSectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const isMobile = useIsMobile();
  const totalItems = children.length;

  const updateActiveIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const childWidth = el.scrollWidth / totalItems;
    const index = Math.round(scrollLeft / childWidth);
    setActiveIndex(Math.min(index, totalItems - 1));
    if (scrollLeft > 10) setHasScrolled(true);
  }, [totalItems]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateActiveIndex, { passive: true });
    return () => el.removeEventListener("scroll", updateActiveIndex);
  }, [updateActiveIndex]);

  const scrollTo = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const childWidth = el.scrollWidth / totalItems;
    const newIndex = direction === "left"
      ? Math.max(0, activeIndex - 1)
      : Math.min(totalItems - 1, activeIndex + 1);
    el.scrollTo({ left: childWidth * newIndex, behavior: "smooth" });
  };

  const scrollToDot = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const childWidth = el.scrollWidth / totalItems;
    el.scrollTo({ left: childWidth * index, behavior: "smooth" });
  };

  if (!isMobile) {
    // Desktop: just render children in a grid-like wrapper (parent handles grid)
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-6 px-6"
      >
        {children.map((child, i) => (
          <div key={i} className="min-w-[280px] max-w-[85vw] snap-center flex-shrink-0">
            {child}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {showArrows && totalItems > 1 && (
        <>
          {activeIndex > 0 && (
            <button
              onClick={() => scrollTo("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-card/90 shadow-md border border-border flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
          )}
          {activeIndex < totalItems - 1 && (
            <button
              onClick={() => scrollTo("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-card/90 shadow-md border border-border flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
          )}
        </>
      )}

      {/* Dot indicators */}
      {showDots && totalItems > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: totalItems }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToDot(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-6 h-2 bg-accent"
                  : "w-2 h-2 bg-muted-foreground/30"
              }`}
              aria-label={`Go to item ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Swipe hint — only shows once */}
      {showSwipeHint && !hasScrolled && (
        <div className="flex items-center justify-center gap-1.5 mt-3 animate-pulse">
          <ChevronLeft className="w-3 h-3 text-muted-foreground/50" />
          <span className="text-[11px] text-muted-foreground/60 font-medium">Swipe to explore</span>
          <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
        </div>
      )}
    </div>
  );
};

export default MobileScrollSection;
