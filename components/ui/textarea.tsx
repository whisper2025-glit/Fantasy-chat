import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        // Performance optimizations for ultra-fast typing
        "transform-gpu will-change-contents",
        className,
      )}
      ref={ref}
      style={{
        // Critical performance optimizations
        transition: "none",
        transform: "translateZ(0)",
        contain: "layout style",
        resize: "none",
        ...((props.style as any) || {}),
      }}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
