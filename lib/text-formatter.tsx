import React from "react";

export interface TextSegment {
  type: "dialogue" | "action" | "narrative" | "character-name" | "thought";
  content: string;
  isItalic?: boolean;
  characterName?: string;
}

export function parseRoleplayText(
  text: string,
  characterName: string,
): TextSegment[] {
  const segments: TextSegment[] = [];

  // Enhanced regex patterns for different text types
  const patterns = {
    // Actions in *text*, **text**, [text], (text)
    action: /(\*{1,2}[^*]+\*{1,2}|\[[^\]]+\]|\([^)]+\))/g,
    // Character name at start of dialogue
    characterName: new RegExp(`^(${characterName})\\s*:?\\s*`, "i"),
    // Dialogue in quotes
    dialogue: /"([^"]+)"/g,
    // Thoughts in italics or special markers
    thought: /\*(thinking|thought):?\s*([^*]+)\*/gi,
  };

  let remaining = text;
  let position = 0;

  while (position < text.length) {
    let nextMatch: {
      start: number;
      end: number;
      type: string;
      content: string;
    } | null = null;

    // Find the earliest match among all patterns
    for (const [type, pattern] of Object.entries(patterns)) {
      pattern.lastIndex = position;
      const match = pattern.exec(text);

      if (match && (nextMatch === null || match.index < nextMatch.start)) {
        nextMatch = {
          start: match.index,
          end: match.index + match[0].length,
          type,
          content: match[0],
        };
      }
    }

    if (nextMatch) {
      // Add any text before the match as narrative
      if (nextMatch.start > position) {
        const narrativeText = text.slice(position, nextMatch.start).trim();
        if (narrativeText) {
          segments.push({
            type: "narrative",
            content: narrativeText,
            isItalic: true,
          });
        }
      }

      // Add the matched segment
      segments.push(
        createSegment(nextMatch.type, nextMatch.content, characterName),
      );
      position = nextMatch.end;
    } else {
      // Add remaining text as narrative
      const remainingText = text.slice(position).trim();
      if (remainingText) {
        segments.push({
          type: "narrative",
          content: remainingText,
          isItalic: true,
        });
      }
      break;
    }
  }

  return segments.filter((segment) => segment.content.length > 0);
}

function createSegment(
  type: string,
  content: string,
  characterName: string,
): TextSegment {
  switch (type) {
    case "action":
      // Remove action markers but preserve content
      const cleanAction = content
        .replace(/^\*{1,2}/, "")
        .replace(/\*{1,2}$/, "")
        .replace(/^\[/, "")
        .replace(/\]$/, "")
        .replace(/^\(/, "")
        .replace(/\)$/, "")
        .trim();

      return {
        type: "action",
        content: cleanAction,
        isItalic: true,
      };

    case "characterName":
      return {
        type: "character-name",
        content: characterName,
        characterName,
      };

    case "dialogue":
      // Remove quotes from dialogue
      const cleanDialogue = content.replace(/"/g, "").trim();
      return {
        type: "dialogue",
        content: cleanDialogue,
      };

    case "thought":
      return {
        type: "thought",
        content: content
          .replace(/\*(thinking|thought):?\s*/gi, "")
          .replace(/\*$/, "")
          .trim(),
        isItalic: true,
      };

    default:
      return {
        type: "narrative",
        content: content.trim(),
        isItalic: true,
      };
  }
}

// Enhanced parser that handles mixed content better
export function smartParseRoleplayText(
  text: string,
  characterName: string,
): TextSegment[] {
  const segments: TextSegment[] = [];

  // Split by sentences and paragraphs
  const sentences = text.split(/(?<=[.!?])\s+|\n\s*\n/);

  for (const sentence of sentences) {
    if (!sentence.trim()) continue;

    // Check if sentence starts with character name
    const characterNameMatch = sentence.match(
      new RegExp(`^(${characterName})\\s*:?\\s*(.*)`, "i"),
    );
    if (characterNameMatch) {
      // Add character name
      segments.push({
        type: "character-name",
        content: characterNameMatch[1],
        characterName,
      });

      // Parse the rest
      const rest = characterNameMatch[2];
      if (rest) {
        segments.push(...parseRoleplayText(rest, characterName));
      }
      continue;
    }

    // Check if it's an action (starts with * or [ or ()
    if (/^\s*[\*\[\(]/.test(sentence)) {
      segments.push({
        type: "action",
        content: sentence
          .replace(/^\s*[\*\[\(]/, "")
          .replace(/[\*\]\)]\s*$/, "")
          .trim(),
        isItalic: true,
      });
      continue;
    }

    // Check if it's dialogue (contains quotes)
    if (/"/.test(sentence)) {
      const parts = sentence.split(/"([^"]+)"/);
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        if (!part) continue;

        if (i % 2 === 1) {
          // Inside quotes - dialogue
          segments.push({
            type: "dialogue",
            content: part,
          });
        } else {
          // Outside quotes - narrative
          segments.push({
            type: "narrative",
            content: part,
            isItalic: true,
          });
        }
      }
      continue;
    }

    // Default to narrative
    segments.push({
      type: "narrative",
      content: sentence.trim(),
      isItalic: true,
    });
  }

  return segments.filter((segment) => segment.content.length > 0);
}

// Component to render formatted text
export interface FormattedTextProps {
  text: string;
  characterName: string;
  className?: string;
}

export const FormattedRoleplayText: React.FC<FormattedTextProps> = ({
  text,
  characterName,
  className = "",
}) => {
  const segments = smartParseRoleplayText(text, characterName);

  return (
    <div className={`roleplay-text ${className}`}>
      {segments.map((segment, index) => (
        <TextSegmentComponent key={index} segment={segment} />
      ))}
    </div>
  );
};

const TextSegmentComponent: React.FC<{ segment: TextSegment }> = ({
  segment,
}) => {
  const getSegmentStyles = () => {
    switch (segment.type) {
      case "character-name":
        return "text-pink-400 font-semibold mr-2"; // Pink like in the image

      case "dialogue":
        return "text-white"; // Regular white text for speech

      case "action":
        return "text-slate-300 italic"; // Lighter, italicized for actions

      case "narrative":
        return "text-slate-400 italic"; // Muted italic for narrative

      case "thought":
        return "text-slate-300 italic opacity-90"; // Subtle for thoughts

      default:
        return "text-slate-300";
    }
  };

  const styles = getSegmentStyles();

  return (
    <span className={`${styles} ${segment.isItalic ? "italic" : ""}`}>
      {segment.content}
      {segment.type === "character-name" && ": "}
      {segment.type !== "character-name" && " "}
    </span>
  );
};

export default FormattedRoleplayText;
