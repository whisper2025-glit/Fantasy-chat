"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  fallback?: string;
  quality?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export default function LazyImage({
  src,
  alt,
  className,
  placeholder = "/placeholder.svg",
  fallback = "/placeholder.svg",
  quality = 75,
  priority = false,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(priority ? src : placeholder);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          setCurrentSrc(src);
          observerRef.current?.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      },
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [src, priority, isInView]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    setCurrentSrc(fallback);
    onError?.();
  };

  // Optimize image URL (basic version - you can enhance this)
  const getOptimizedSrc = (url: string) => {
    if (url.includes("placeholder.svg")) return url;

    // Add quality parameter if it's a supported service
    if (url.includes("cloudinary.com")) {
      return url.includes("q_")
        ? url
        : url.replace("/upload/", `/upload/q_${quality}/`);
    }

    return url;
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        ref={imgRef}
        src={getOptimizedSrc(currentSrc)}
        alt={alt}
        className={cn(
          "transition-all duration-300 ease-in-out",
          isLoaded ? "opacity-100" : "opacity-0",
          className,
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />

      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div
          className={cn(
            "absolute inset-0 bg-muted/50 animate-pulse flex items-center justify-center",
            className,
          )}
        >
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin opacity-60" />
        </div>
      )}

      {/* Blur-to-focus effect for lazy loaded images */}
      {isInView && !priority && !isLoaded && (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/60 backdrop-blur-sm",
            "transition-opacity duration-500",
            isLoaded ? "opacity-0" : "opacity-100",
          )}
        />
      )}
    </div>
  );
}

// Additional utility component for responsive images
export function ResponsiveLazyImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 50vw, 25vw",
  ...props
}: LazyImageProps & { sizes?: string }) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      className={cn("w-full h-auto", className)}
      {...props}
    />
  );
}
