"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ResponseNavigationProps {
  currentIndex: number;
  totalVariations: number;
  onPrevious: () => void;
  onNext: () => void;
  disabled?: boolean;
  className?: string;
}

const ResponseNavigation = ({
  currentIndex,
  totalVariations,
  onPrevious,
  onNext,
  disabled = false,
  className = "",
}: ResponseNavigationProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Previous variation button (go to first response) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        disabled={disabled || currentIndex === 1}
        className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-3 w-3" />
      </Button>

      {/* Current/Total counter */}
      <span className="text-xs text-muted-foreground font-medium">
        {currentIndex}/{totalVariations}
      </span>

      {/* Navigate to next or generate new variation button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={disabled}
        className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronRight className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default ResponseNavigation;
