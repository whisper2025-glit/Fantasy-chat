"use client";

import { memo, useMemo } from "react";
import { cn, parseMarkdownText } from "@/lib/utils";

interface FormattedTextProps {
  content: string | undefined | null;
  className?: string;
  isUserMessage?: boolean;
}

interface TextSegment {
  type: "action" | "dialogue" | "thought" | "narration";
  content: string;
  original: string;
}

/**
 * Parses message content and identifies different text types:
 * - **text** or *text* = Actions/descriptions (italic, muted)
 * - "text" = Dialogue (normal, emphasized)
 * - Regular text = Narration (normal)
 * - (text) = Thoughts (italic, smaller)
 */
function parseMessageContent(content: string): TextSegment[] {
  // Handle undefined or null content
  if (!content || typeof content !== "string") {
    return [];
  }

  const segments: TextSegment[] = [];
  let currentIndex = 0;

  // Enhanced regex patterns for different text types
  const patterns = [
    // Double asterisks for strong actions: **text**
    {
      regex: /\*\*(.*?)\*\*/g,
      type: "action" as const,
    },
    // Single asterisks for actions: *text*
    {
      regex: /\*([^*]+?)\*/g,
      type: "action" as const,
    },
    // Quoted dialogue: "text"
    {
      regex: /"([^"]+?)"/g,
      type: "dialogue" as const,
    },
    // Alternative quotes: 'text'
    {
      regex: /'([^']+?)'/g,
      type: "dialogue" as const,
    },
    // Thoughts in parentheses: (text)
    {
      regex: /\(([^)]+?)\)/g,
      type: "thought" as const,
    },
  ];

  // Find all matches for all patterns
  const allMatches: Array<{
    match: RegExpMatchArray;
    type: TextSegment["type"];
  }> = [];

  patterns.forEach(({ regex, type }) => {
    let match;
    regex.lastIndex = 0; // Reset regex
    while ((match = regex.exec(content)) !== null) {
      allMatches.push({ match, type });
    }
  });

  // Sort matches by position
  allMatches.sort((a, b) => a.match.index! - b.match.index!);

  // Process content with all matches
  allMatches.forEach(({ match, type }) => {
    const matchStart = match.index!;
    const matchEnd = matchStart + match[0].length;

    // Add any text before this match as narration
    if (currentIndex < matchStart) {
      const beforeText = content.slice(currentIndex, matchStart).trim();
      if (beforeText) {
        segments.push({
          type: "narration",
          content: beforeText,
          original: beforeText,
        });
      }
    }

    // Add the matched content with its type
    const innerContent = match[1].trim();
    if (innerContent) {
      segments.push({
        type,
        content: innerContent,
        original: match[0],
      });
    }

    currentIndex = matchEnd;
  });

  // Add any remaining text as narration
  if (currentIndex < content.length) {
    const remainingText = content.slice(currentIndex).trim();
    if (remainingText) {
      segments.push({
        type: "narration",
        content: remainingText,
        original: remainingText,
      });
    }
  }

  // If no special formatting found, treat entire content as narration
  if (segments.length === 0 && content.trim()) {
    segments.push({
      type: "narration",
      content: content.trim(),
      original: content.trim(),
    });
  }

  return segments;
}

const FormattedText = memo(
  ({ content, className, isUserMessage = false }: FormattedTextProps) => {
    // First check if content contains markdown images/links
    const markdownParsedContent = useMemo(
      () => parseMarkdownText(content || ""),
      [content],
    );

    // Check if content contains markdown elements (non-string React nodes)
    const hasMarkdownElements = useMemo(
      () =>
        Array.isArray(markdownParsedContent) &&
        markdownParsedContent.some((item) => typeof item !== "string"),
      [markdownParsedContent],
    );

    // If content contains markdown images/links, render them directly without text formatting
    if (hasMarkdownElements) {
      return (
        <div
          className={cn(
            "text-sm leading-relaxed whitespace-pre-wrap break-words",
            isUserMessage ? "text-inherit" : "text-foreground/95",
            className,
          )}
        >
          {markdownParsedContent}
        </div>
      );
    }

    // Otherwise, use the existing text segmentation for rich text formatting
    const segments = useMemo(
      () => parseMessageContent(content || ""),
      [content],
    );

    const getSegmentStyle = (type: TextSegment["type"]) => {
      const baseClasses = "transition-colors duration-200";

      switch (type) {
        case "action":
          return cn(
            baseClasses,
            "italic font-normal leading-relaxed",
            // More prominent styling for actions
            "text-muted-foreground/90 dark:text-muted-foreground/80",
            // Ensure visibility in both themes
            "opacity-90 dark:opacity-85",
          );
        case "dialogue":
          return cn(
            baseClasses,
            isUserMessage
              ? "text-inherit font-medium"
              : "text-foreground font-medium",
            "leading-normal",
          );
        case "thought":
          return cn(
            baseClasses,
            "italic text-muted-foreground/80 text-sm",
            "leading-relaxed",
          );
        case "narration":
        default:
          return cn(
            baseClasses,
            isUserMessage ? "text-inherit" : "text-foreground/95",
            "leading-normal",
          );
      }
    };

    const renderSegment = (segment: TextSegment, index: number) => {
      const style = getSegmentStyle(segment.type);

      // Add appropriate spacing and formatting
      const needsSpacing =
        index > 0 && segments[index - 1]?.type !== segment.type;
      const spacingClass = needsSpacing ? "ml-1" : "";

      return (
        <span
          key={`${segment.type}-${index}`}
          className={cn(style, spacingClass)}
          data-text-type={segment.type}
        >
          {segment.content}
        </span>
      );
    };

    return (
      <div
        className={cn(
          "text-sm leading-relaxed whitespace-pre-wrap break-words",
          className,
        )}
      >
        {segments.length > 0 ? segments.map(renderSegment) : content || ""}
      </div>
    );
  },
  // Only re-render if content, className, or isUserMessage actually changes
  (prevProps, nextProps) => {
    return (
      prevProps.content === nextProps.content &&
      prevProps.className === nextProps.className &&
      prevProps.isUserMessage === nextProps.isUserMessage
    );
  },
);

FormattedText.displayName = "FormattedText";

export default FormattedText;

// Hook for testing the formatter (useful for development)
export function useTextFormatter() {
  return {
    parseMessageContent,
    testFormat: (content: string) => {
      console.log("Original:", content);
      console.log("Parsed:", parseMessageContent(content));
    },
  };
}

// Example usage and test cases for development
export const EXAMPLE_MESSAGES = [
  `*She leaned closer, her eyes sparkling with mischief.* "Don't think you can have me so easily," *she whispered, her fingers trailing along your arm.* "I'm not some easy target, you know."`,

  `Her voice was soft and breathless. *Mmm...* *She leaned into you, her hands finding their way to your neck.* But something held her back. *With a sudden move, she broke the kiss, pushing you away slightly.*`,

  `**Luna's magical energy crackles around her as she prepares a spell.** "The stars are aligning perfectly tonight," **she says while weaving intricate patterns in the air.** (I wonder if this spell will work...) **Her eyes glow with ethereal light.**`,

  `"Hello there, traveler!" *waves enthusiastically* "Welcome to my magical library!" *gestures around the enchanted room filled with floating books* (I hope they're not here to cause trouble...)`,
];
