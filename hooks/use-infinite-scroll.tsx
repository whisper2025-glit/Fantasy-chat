"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
  hasMore?: boolean;
  isLoading?: boolean;
}

interface UseInfiniteScrollReturn {
  targetRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

export default function useInfiniteScroll(
  onLoadMore: () => Promise<void> | void,
  {
    threshold = 0.1,
    rootMargin = "100px",
    enabled = true,
    hasMore = true,
    isLoading = false,
  }: UseInfiniteScrollOptions = {},
): UseInfiniteScrollReturn {
  const targetRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [loading, setLoading] = useState(isLoading);
  const [hasMoreItems, setHasMoreItems] = useState(hasMore);

  const loadMore = useCallback(async () => {
    if (loading || !hasMoreItems || !enabled) return;

    setLoading(true);
    try {
      await onLoadMore();
    } catch (error) {
      console.error("Error loading more content:", error);
    } finally {
      setLoading(false);
    }
  }, [onLoadMore, loading, hasMoreItems, enabled]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    setHasMoreItems(hasMore);
  }, [hasMore]);

  useEffect(() => {
    if (!enabled || !targetRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loading && hasMoreItems) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observerRef.current = observer;
    observer.observe(targetRef.current);

    return () => {
      observer.disconnect();
    };
  }, [enabled, loading, hasMoreItems, loadMore, threshold, rootMargin]);

  return {
    targetRef,
    isLoading: loading,
    hasMore: hasMoreItems,
    loadMore,
  };
}

// Virtualized scroll hook for better performance with large lists
export function useVirtualizedScroll<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  overscan: number = 5,
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1,
  );

  const paddingTop = visibleStart * itemHeight;
  const paddingBottom = (items.length - visibleEnd - 1) * itemHeight;

  const visibleItems = items.slice(
    Math.max(0, visibleStart - overscan),
    Math.min(items.length, visibleEnd + 1 + overscan),
  );

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    containerRef: setContainerRef,
    visibleItems,
    paddingTop,
    paddingBottom,
    onScroll,
    scrollTop,
  };
}

// Smooth scroll utilities
export const scrollUtils = {
  scrollToTop: (element?: HTMLElement) => {
    const target = element || window;
    if ("scrollTo" in target) {
      target.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  },

  scrollToElement: (elementId: string, offset: number = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
      const top = element.offsetTop - offset;
      window.scrollTo({
        top,
        behavior: "smooth",
      });
    }
  },

  scrollToBottom: (element?: HTMLElement) => {
    const target = element || document.documentElement;
    target.scrollTo({
      top: target.scrollHeight,
      behavior: "smooth",
    });
  },

  // Prevent scroll during loading
  lockScroll: () => {
    document.body.style.overflow = "hidden";
  },

  unlockScroll: () => {
    document.body.style.overflow = "unset";
  },

  // Get scroll position
  getScrollPosition: (element?: HTMLElement) => {
    const target = element || window;
    if ("scrollY" in target) {
      return { x: target.scrollX, y: target.scrollY };
    }
    return { x: target.scrollLeft, y: target.scrollTop };
  },

  // Restore scroll position
  restoreScrollPosition: (
    position: { x: number; y: number },
    element?: HTMLElement,
  ) => {
    const target = element || window;
    if ("scrollTo" in target) {
      target.scrollTo(position.x, position.y);
    }
  },
};
