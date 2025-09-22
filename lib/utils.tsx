import type { CharacterFormData, FormErrors } from "./types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import React, { useState } from "react";

// Utility function to combine class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a unique ID
export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

// Validate character form data
export function validateCharacterForm(formData: CharacterFormData): FormErrors {
  const errors: FormErrors = {};

  // Basic validation
  if (!formData.nickname) errors.nickname = "Nickname is required";
  if (!formData.age) errors.age = "Age is required";
  if (!formData.introduction) errors.introduction = "Introduction is required";
  if (!formData.greeting) errors.greeting = "Greeting is required";

  // Length validation
  if (formData.nickname && formData.nickname.length > 40) {
    errors.nickname = "Nickname must be 40 characters or less";
  }

  if (formData.age && formData.age.length > 8) {
    errors.age = "Age must be 8 characters or less";
  }

  return errors;
}

// Format date for display
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Truncate text to a specific length
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Function to check if URL is a valid image URL
function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    // Check if it's a valid HTTP/HTTPS URL
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return false;
    }
    // Allow common image domains and file extensions
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i;
    const imageDomains = [
      "imgur.com",
      "i.imgur.com",
      "cdn.discordapp.com",
      "media.discordapp.net",
      "i.redd.it",
      "preview.redd.it",
      "cdn.builder.io",
      "images.unsplash.com",
    ];

    return (
      imageExtensions.test(parsedUrl.pathname) ||
      imageDomains.some((domain) => parsedUrl.hostname.includes(domain))
    );
  } catch {
    return false;
  }
}

// Image component for markdown images
function MarkdownImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  if (imageError) {
    return (
      <div className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm">
        <span className="mr-2">🖼️</span>
        <span>Failed to load image: {alt || "Image"}</span>
      </div>
    );
  }

  return (
    <div className={cn("markdown-image-container relative", className)}>
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-700 rounded-lg min-h-[100px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt || "Markdown Image"}
        className={cn(
          "max-w-full h-auto rounded-lg shadow-lg cursor-pointer transition-transform",
          imageLoading ? "opacity-0" : "opacity-100",
        )}
        onError={handleImageError}
        onLoad={handleImageLoad}
        onClick={() => window.open(src, "_blank")}
        style={{ maxHeight: "400px", maxWidth: "100%" }}
      />
    </div>
  );
}

// Function to parse markdown images and links
export function parseMarkdownText(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;
  let keyCounter = 0;

  // Combined regex for markdown images and URLs
  // Matches: ![alt text](image_url) and bare URLs
  const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Find all markdown images and URLs with their positions
  const matches: Array<{
    type: "image" | "link";
    match: string;
    alt?: string;
    url: string;
    index: number;
    length: number;
  }> = [];

  // Find markdown images
  let imageMatch;
  while ((imageMatch = markdownImageRegex.exec(text)) !== null) {
    const [fullMatch, alt, url] = imageMatch;
    if (isValidImageUrl(url)) {
      matches.push({
        type: "image",
        match: fullMatch,
        alt,
        url,
        index: imageMatch.index,
        length: fullMatch.length,
      });
    }
  }

  // Find URLs (but exclude those already part of markdown images)
  let urlMatch;
  while ((urlMatch = urlRegex.exec(text)) !== null) {
    const url = urlMatch[0];
    const index = urlMatch.index;

    // Check if this URL is part of a markdown image
    const isPartOfImage = matches.some(
      (m) =>
        m.type === "image" && index >= m.index && index < m.index + m.length,
    );

    if (!isPartOfImage) {
      matches.push({
        type: "link",
        match: url,
        url,
        index,
        length: url.length,
      });
    }
  }

  // Sort matches by position
  matches.sort((a, b) => a.index - b.index);

  // Process matches and build result
  matches.forEach((match, i) => {
    // Add text before this match
    if (match.index > currentIndex) {
      const textBefore = text.substring(currentIndex, match.index);
      if (textBefore) {
        parts.push(textBefore);
      }
    }

    // Add the match
    if (match.type === "image") {
      parts.push(
        <MarkdownImage
          key={`img-${keyCounter++}`}
          src={match.url}
          alt={match.alt || ""}
          className="my-2"
        />,
      );
    } else {
      parts.push(
        <a
          key={`link-${keyCounter++}`}
          href={match.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
        >
          {match.url}
        </a>,
      );
    }

    currentIndex = match.index + match.length;
  });

  // Add any remaining text
  if (currentIndex < text.length) {
    const remainingText = text.substring(currentIndex);
    if (remainingText) {
      parts.push(remainingText);
    }
  }

  // If no matches found, return the original text
  return parts.length > 0 ? parts : [text];
}

// Function to parse text and convert URLs into clickable links (legacy support)
export function parseAndLinkifyText(text: string): React.ReactNode[] {
  return parseMarkdownText(text);
}

// Utility function to validate markdown image syntax
export function isValidMarkdownImage(text: string): boolean {
  const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/;
  return markdownImageRegex.test(text);
}

// Helper function to get markdown image help text
export function getMarkdownImageHelp(): string {
  return `To display an image, use markdown syntax: ![Alt text](image_url)

Examples:
• ![My Image](https://example.com/image.jpg)
• ![](https://i.imgur.com/example.png)
• ![Cool Picture](https://cdn.example.com/pic.webp)

Supported formats: JPG, PNG, GIF, WebP, SVG
Supported domains: Imgur, Discord CDN, Reddit, Unsplash, Builder.io`;
}
