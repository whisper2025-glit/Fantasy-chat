"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseOptimizedInputOptions {
  debounceMs?: number;
  onValueChange?: (value: string) => void;
}

/**
 * Optimized input hook that prevents lag during typing by:
 * - Using refs for immediate updates
 * - Debouncing state updates
 * - Using RAF for smooth updates
 */
export function useOptimizedInput(
  initialValue: string = "",
  options: UseOptimizedInputOptions = {},
) {
  const { debounceMs = 0, onValueChange } = options;

  const [value, setValue] = useState(initialValue);
  const [isTyping, setIsTyping] = useState(false);

  const currentValueRef = useRef(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Reset value when initialValue changes
  useEffect(() => {
    setValue(initialValue);
    currentValueRef.current = initialValue;
  }, [initialValue]);

  const updateValue = useCallback(
    (newValue: string) => {
      // Update ref immediately for responsive UI
      currentValueRef.current = newValue;

      // Mark as typing
      setIsTyping(true);

      // Clear existing timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Update state based on debounce setting
      if (debounceMs > 0) {
        timeoutRef.current = setTimeout(() => {
          setValue(newValue);
          onValueChange?.(newValue);
        }, debounceMs);
      } else {
        // Use RAF for smooth updates without debouncing
        requestAnimationFrame(() => {
          setValue(newValue);
          onValueChange?.(newValue);
        });
      }

      // Reset typing state after user stops typing
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 300);
    },
    [debounceMs, onValueChange],
  );

  const reset = useCallback(() => {
    setValue("");
    currentValueRef.current = "";
    setIsTyping(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    value,
    currentValue: currentValueRef.current,
    updateValue,
    reset,
    isTyping,
  };
}
