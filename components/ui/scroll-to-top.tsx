"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollToTopProps {
  threshold?: number;
  className?: string;
  containerRef?: React.RefObject<HTMLElement>;
}

export default function ScrollToTop({
  threshold = 400,
  className,
  containerRef,
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef?.current || window;

    const toggleVisibility = () => {
      const scrollY = containerRef?.current?.scrollTop || window.scrollY;
      setIsVisible(scrollY > threshold);
    };

    const handleScroll = () => {
      requestAnimationFrame(toggleVisibility);
    };

    if (containerRef?.current) {
      containerRef.current.addEventListener("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (containerRef?.current) {
        containerRef.current.removeEventListener("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [threshold, containerRef]);

  const scrollToTop = () => {
    const container = containerRef?.current || window;

    if (containerRef?.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      size="sm"
      className={cn(
        "fixed bottom-20 right-4 z-40 rounded-full w-12 h-12 p-0 shadow-lg",
        "bg-primary/90 backdrop-blur-sm hover:bg-primary",
        "transition-all duration-300 hover:scale-110",
        "border border-primary/20",
        className,
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-5 h-5" />
    </Button>
  );
}

// Hook for programmatic scroll control
export function useScrollControl(containerRef?: React.RefObject<HTMLElement>) {
  const scrollToTop = () => {
    const container = containerRef?.current || window;

    if (containerRef?.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const scrollToBottom = () => {
    const container = containerRef?.current;

    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const scrollToElement = (elementId: string, offset: number = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
      const container = containerRef?.current;

      if (container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const scrollTop =
          container.scrollTop + elementRect.top - containerRect.top - offset;

        container.scrollTo({
          top: scrollTop,
          behavior: "smooth",
        });
      } else {
        const top = element.offsetTop - offset;
        window.scrollTo({
          top,
          behavior: "smooth",
        });
      }
    }
  };

  return {
    scrollToTop,
    scrollToBottom,
    scrollToElement,
  };
}
