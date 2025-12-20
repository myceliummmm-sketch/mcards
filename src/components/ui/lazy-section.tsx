import { useEffect, useRef, useState, ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  rootMargin?: string;
  minHeight?: string;
  className?: string;
}

export const LazySection = ({
  children,
  rootMargin = "200px",
  minHeight = "200px",
  className = "",
}: LazySectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ minHeight: !isVisible ? minHeight : undefined }}
    >
      {isVisible ? (
        children
      ) : (
        <div className="animate-pulse bg-muted/10 rounded-lg h-full w-full" style={{ minHeight }} />
      )}
    </div>
  );
};
