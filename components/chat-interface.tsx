"use client";

import type React from "react";

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  memo,
  useLayoutEffect,
  startTransition,
} from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Pin,
  User,
  Settings,
  Heart,
  Plus,
  Send,
  X,
  MoreHorizontal,
} from "lucide-react";
import FormattedText from "./chat/formatted-text";
import RegenerateButton from "./chat/regenerate-button";
import ResponseNavigation from "./chat/response-navigation";
import {
  saveRecentChat,
  updateRecentChat,
  markChatAsRead,
  type RecentChat,
} from "@/lib/recent-chats-storage";
import { generateAIResponse, getDelayForMode } from "@/lib/ai-service";
import {
  getChatSettings,
  COLOR_SCHEMES,
  FONT_SIZES,
  FONT_FAMILIES,
  LINE_HEIGHTS,
  type ChatSettings,
} from "@/lib/chat-settings-storage";
import {
  getParameterSettings,
  type ParameterSettings,
} from "@/lib/parameter-settings-storage";
import PersonaSheet from "@/components/chat/persona-sheet";
import PersonaChangeSheet from "@/components/chat/persona-change-sheet";
import PersonaCreateSheet from "@/components/chat/persona-create-sheet";
import ModeSelectionSheet from "@/components/chat/mode-selection-sheet";
import ChatSettingsSheet from "@/components/chat/chat-settings-sheet";
import ChatOptionsModal from "@/components/chat/chat-options-modal";
import StartNewChatDialog from "@/components/start-new-chat-dialog";
import BotProfilePage from "@/components/bot-profile-page";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isPinned?: boolean;
  type?: "text" | "image" | "voice";
  imageUrl?: string;
  voiceUrl?: string;
  isGreeting?: boolean;
  variations?: string[];
  currentVariationIndex?: number;
}

interface ChatInterfaceProps {
  character: any;
  setSelectedCharacter: (character: any) => void;
  initialChatHistory?: RecentChat["chatHistory"];
  onViewCreatorProfile?: (creatorId: string) => void;
}

interface Persona {
  id: string;
  name: string;
  age: string;
  image?: string;
  likes: string;
  dislikes: string;
  additional: string;
  isDefault: boolean;
}

interface Model {
  id: string;
  name: string;
  provider: string;
  description?: string;
  capabilities?: string[];
}

// Advanced debounce hook with immediate execution option
function useAdvancedDebounce<T>(value: T, delay: number, immediate = false): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const immediateRef = useRef(immediate);

  useEffect(() => {
    if (immediateRef.current) {
      setDebouncedValue(value);
      immediateRef.current = false;
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

// Enhanced Intersection Observer hook with threshold options
function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {},
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: "50px", ...options },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, options]);

  return isIntersecting;
}

// Advanced Virtual Scrolling with dynamic heights
function useVirtualScrolling(
  items: Message[],
  containerHeight: number,
  estimatedItemHeight: number,
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const itemHeights = useRef<Map<string, number>>(new Map());

  const visibleRange = useMemo(() => {
    if (!containerRef || items.length === 0)
      return { start: 0, end: items.length };

    let accumulatedHeight = 0;
    let startIndex = 0;
    let endIndex = items.length;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      const height =
        itemHeights.current.get(items[i].id) || estimatedItemHeight;
      if (accumulatedHeight + height > scrollTop) {
        startIndex = Math.max(0, i - 2); // 2 item buffer above
        break;
      }
      accumulatedHeight += height;
    }

    // Find end index
    accumulatedHeight = 0;
    for (let i = startIndex; i < items.length; i++) {
      const height =
        itemHeights.current.get(items[i].id) || estimatedItemHeight;
      accumulatedHeight += height;
      if (accumulatedHeight > containerHeight + 200) {
        // 200px buffer below
        endIndex = Math.min(items.length, i + 2);
        break;
      }
    }

    return { start: startIndex, end: endIndex };
  }, [scrollTop, containerHeight, items, estimatedItemHeight]);

  const visibleItems = useMemo(() => {
    return items
      .slice(visibleRange.start, visibleRange.end)
      .map((item, index) => ({
        ...item,
        virtualIndex: visibleRange.start + index,
      }));
  }, [items, visibleRange]);

  const totalHeight = useMemo(() => {
    return items.reduce((total, item) => {
      return total + (itemHeights.current.get(item.id) || estimatedItemHeight);
    }, 0);
  }, [items, estimatedItemHeight]);

  const setItemHeight = useCallback((id: string, height: number) => {
    itemHeights.current.set(id, height);
  }, []);

  return {
    visibleItems,
    visibleRange,
    setScrollTop,
    setContainerRef,
    totalHeight,
    setItemHeight,
  };
}

// Ultra-optimized Audio Manager with advanced features
class UltraAudioManager {
  private static instance: UltraAudioManager;
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private isInitialized = false;
  private soundQueue: Array<() => void> = [];
  private isProcessing = false;

  static getInstance(): UltraAudioManager {
    if (!UltraAudioManager.instance) {
      UltraAudioManager.instance = new UltraAudioManager();
    }
    return UltraAudioManager.instance;
  }

  private async initializeAudioContext() {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Resume context if suspended (required by some browsers)
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      this.isInitialized = true;
    } catch (error) {
      console.warn("Audio context initialization failed:", error);
    }
  }

  async playSound(
    soundType: "message" | "notification",
    settings: ChatSettings,
  ) {
    if (!settings.enableSounds) return;
    if (soundType === "message" && !settings.messageSoundEnabled) return;
    if (soundType === "notification" && !settings.notificationSoundEnabled)
      return;

    const soundFunction = () => this.createAndPlayTone(soundType);
    this.soundQueue.push(soundFunction);

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.soundQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    await this.initializeAudioContext();

    if (this.audioContext && this.gainNode) {
      const soundFunction = this.soundQueue.shift();
      if (soundFunction) {
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            soundFunction();
            setTimeout(() => this.processQueue(), 50);
          });
        } else {
          setTimeout(() => {
            soundFunction();
            this.processQueue();
          }, 0);
        }
      }
    } else {
      this.isProcessing = false;
    }
  }

  private createAndPlayTone(soundType: "message" | "notification") {
    if (!this.audioContext || !this.gainNode) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const envelope = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(envelope);
      envelope.connect(this.gainNode);

      // Enhanced sound design
      oscillator.frequency.setValueAtTime(
        soundType === "message" ? 800 : 1000,
        this.audioContext.currentTime,
      );
      oscillator.type = "sine";

      // Add subtle filtering
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);

      // Smooth envelope with attack and release
      envelope.gain.setValueAtTime(0, this.audioContext.currentTime);
      envelope.gain.linearRampToValueAtTime(
        0.3,
        this.audioContext.currentTime + 0.02,
      );
      envelope.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + 0.2,
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn("Sound generation failed:", error);
    }
  }

  cleanup() {
    this.soundQueue = [];
    this.isProcessing = false;
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
    }
    this.audioContext = null;
    this.gainNode = null;
    this.isInitialized = false;
  }
}

// Ultra-optimized Message Component with advanced features
const UltraMessageBubble = memo(
  ({
    message,
    isUserMessage,
    character,
    currentPersona,
    settings,
    colorScheme,
    fontSize,
    fontFamily,
    lineHeight,
    editingMessageId,
    editingText,
    onEditingTextChange,
    onSaveEdit,
    onCancelEdit,
    onMessageClick,
    onRegenerate,
    handlePreviousVariation,
    handleNextVariation,
    virtualIndex,
    onHeightChange,
  }: {
    message: Message;
    isUserMessage: boolean;
    character: any;
    currentPersona: Persona;
    settings: ChatSettings;
    colorScheme: any;
    fontSize: any;
    fontFamily: string;
    lineHeight: string;
    editingMessageId: string | null;
    editingText: string;
    onEditingTextChange: (text: string) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onMessageClick: (
      e: React.MouseEvent,
      messageId: string,
      isUserMessage: boolean,
    ) => void;
    onRegenerate?: (messageId: string) => void;
    handlePreviousVariation?: (messageId: string) => void;
    handleNextVariation?: (messageId: string) => void;
    virtualIndex?: number;
    onHeightChange?: (id: string, height: number) => void;
  }) => {
    const messageRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isVisible = useIntersectionObserver(messageRef, {
      threshold: 0.1,
      rootMargin: "100px",
    });
    const resizeObserverRef = useRef<ResizeObserver>();

    // Auto-resize textarea to fit content
    const autoResizeTextarea = useCallback(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, []);

    // Auto-resize when editing starts or text changes
    useEffect(() => {
      if (editingMessageId === message.id && textareaRef.current) {
        autoResizeTextarea();
        textareaRef.current.focus();
        // Set cursor to end of text
        textareaRef.current.setSelectionRange(
          textareaRef.current.value.length,
          textareaRef.current.value.length,
        );
      }
    }, [editingMessageId, message.id, autoResizeTextarea]);

    // Measure height changes for virtual scrolling
    useEffect(() => {
      if (!messageRef.current || !onHeightChange) return;

      const measureHeight = () => {
        if (messageRef.current) {
          const height = messageRef.current.getBoundingClientRect().height;
          onHeightChange(message.id, height);
        }
      };

      // Initial measurement
      measureHeight();

      // Set up resize observer for dynamic height changes
      if (window.ResizeObserver) {
        resizeObserverRef.current = new ResizeObserver(() => {
          measureHeight();
        });
        resizeObserverRef.current.observe(messageRef.current);
      }

      return () => {
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }
      };
    }, [message.id, onHeightChange]);

    // Memoize expensive calculations
    const hasBackgroundImage = useMemo(() => {
      return (
        (character.sceneImage &&
          character.sceneImage !== "/placeholder.svg?height=400&width=600") ||
        (settings.backgroundType === "character" &&
          character.image &&
          character.image !== "/placeholder.svg?height=400&width=300") ||
        (settings.backgroundType === "image" && settings.backgroundImage)
      );
    }, [
      character.sceneImage,
      character.image,
      settings.backgroundType,
      settings.backgroundImage,
    ]);

    const messageClasses = useMemo(() => {
      const baseClasses = `cursor-pointer transition-all duration-300 shadow-lg transform-gpu will-change-transform ${
        settings.compactMode ? "p-2 text-sm" : "p-3"
      }`;

      const styleClasses =
        settings.messageStyle === "bubble"
          ? isUserMessage
            ? "rounded-2xl rounded-br-md"
            : "rounded-2xl rounded-bl-md"
          : settings.messageStyle === "flat"
            ? "rounded-none border-l-4"
            : settings.messageStyle === "minimal"
              ? "rounded-lg border border-slate-600/50 bg-transparent"
              : isUserMessage
                ? "rounded-2xl rounded-br-md"
                : "rounded-2xl rounded-bl-md";

      const colorClasses = isUserMessage
        ? `${colorScheme.userMessage} border border-white/10`
        : settings.messageStyle === "minimal"
          ? `bg-slate-800/30 text-white border border-slate-700/30`
          : `${colorScheme.aiMessage} border border-slate-700/30`;

      const blurClass = hasBackgroundImage
        ? "backdrop-blur-sm"
        : "backdrop-blur-md";

      return `${baseClasses} ${styleClasses} ${colorClasses} ${blurClass}`;
    }, [settings, colorScheme, isUserMessage, hasBackgroundImage]);

    return (
      <div
        ref={messageRef}
        className={`flex flex-col ${isUserMessage ? "items-end" : "items-start"} ${
          settings.compactMode ? "mb-2" : "mb-4"
        } will-change-transform`}
      >
        {/* Avatar and Name Row */}
        <div
          className={`flex items-center ${isUserMessage ? "flex-row-reverse" : ""} mb-2`}
        >
          <Avatar
            className={`w-10 h-10 ring-2 ring-${colorScheme.accent.replace("text-", "")}/30 shadow-lg will-change-transform`}
          >
            <AvatarImage
              src={
                isUserMessage
                  ? currentPersona.image ||
                    "/placeholder.svg?height=32&width=32"
                  : character.avatar ||
                    character.image ||
                    "/placeholder.svg?height=32&width=32"
              }
              alt={isUserMessage ? currentPersona.name : character.name}
              className="object-cover"
              loading="lazy"
            />
            <AvatarFallback
              className={`bg-gradient-to-br ${isUserMessage ? "from-indigo-500 to-purple-600" : colorScheme.primary} text-white text-xs font-medium`}
            >
              {isUserMessage
                ? currentPersona.name?.charAt(0) || "U"
                : message.sender.charAt(0) || "AI"}
            </AvatarFallback>
          </Avatar>
          {!isUserMessage && (
            <p
              className="font-medium text-slate-300 ml-2"
              style={{ fontSize: "var(--chat-name-size)" }}
            >
              {message.sender}
            </p>
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={`${messageClasses} ${fontFamily} ${
            message.isPinned
              ? `ring-2 ring-yellow-400/50 shadow-yellow-400/20`
              : ""
          } max-w-[85%] relative ${isUserMessage ? "mr-12" : "ml-12"}`}
          style={{
            opacity: settings.bubbleOpacity,
          }}
          onClick={(e) => onMessageClick(e, message.id, isUserMessage)}
        >
          {/* Message Content */}
          {editingMessageId === message.id ? (
            <div className="space-y-3">
              <Textarea
                ref={textareaRef}
                defaultValue={editingText}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  onEditingTextChange(target.value);
                  // Debounce auto-resize for performance
                  requestAnimationFrame(autoResizeTextarea);
                }}
                className={`bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-${colorScheme.accent.replace("text-", "")} focus:ring-${colorScheme.accent.replace("text-", "")}/20 resize-none overflow-hidden`}
                style={{
                  minHeight: "80px",
                  lineHeight: lineHeight,
                  fontFamily: fontFamily,
                  fontSize: "var(--chat-font-size)",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSaveEdit();
                  } else if (e.key === "Escape") {
                    onCancelEdit();
                  }
                }}
                placeholder="Edit your message..."
              />
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={onSaveEdit}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    style={{ fontSize: "var(--chat-timestamp-size)" }}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCancelEdit}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                    style={{ fontSize: "var(--chat-timestamp-size)" }}
                  >
                    Cancel
                  </Button>
                </div>
                <div className="text-xs text-slate-400">
                  <span className="mr-3">escape to cancel</span>
                  <span>enter to save</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Image content */}
              {message.type === "image" && message.imageUrl && (
                <img
                  src={message.imageUrl || "/placeholder.svg"}
                  alt="Shared image"
                  className="max-w-full h-auto rounded-lg mb-2 shadow-md"
                  loading="lazy"
                  decoding="async"
                />
              )}

              {/* Text content */}
              <div
                className={`${lineHeight} ${fontFamily}`}
                style={{ fontSize: "var(--chat-font-size)" }}
              >
                <FormattedText
                  content={message.text}
                  isUserMessage={message.sender === "You"}
                />
              </div>
            </div>
          )}

          {/* Timestamp */}
          {settings.showTimestamps && (
            <div
              className={`mt-2 opacity-60 ${isUserMessage ? "text-right" : "text-left"}`}
              style={{ fontSize: "var(--chat-timestamp-size)" }}
            >
              <span>
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}

          {/* Pin indicator */}
          {message.isPinned && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <Pin className="w-2 h-2 text-yellow-800" />
            </div>
          )}
        </div>

        {/* Response Navigation or Regenerate Button - positioned below message bubble */}
        {!isUserMessage && onRegenerate && !message.isGreeting && (
          <div className="mt-1 ml-12">
            <div className="px-4">
              {message.variations && message.variations.length > 1 ? (
                <ResponseNavigation
                  currentIndex={message.currentVariationIndex || 1}
                  totalVariations={message.variations.length}
                  onPrevious={() => handlePreviousVariation(message.id)}
                  onNext={() => handleNextVariation(message.id)}
                  className="opacity-60 hover:opacity-100"
                />
              ) : (
                <RegenerateButton
                  onRegenerate={() => onRegenerate(message.id)}
                  className="opacity-60 hover:opacity-100"
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Enhanced comparison for optimal re-rendering
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.text === nextProps.message.text &&
      prevProps.message.isPinned === nextProps.message.isPinned &&
      prevProps.editingMessageId === nextProps.editingMessageId &&
      prevProps.editingText === nextProps.editingText &&
      prevProps.settings.messageStyle === nextProps.settings.messageStyle &&
      prevProps.settings.compactMode === nextProps.settings.compactMode &&
      prevProps.settings.showTimestamps === nextProps.settings.showTimestamps &&
      JSON.stringify(prevProps.colorScheme) ===
        JSON.stringify(nextProps.colorScheme)
    );
  },
);

UltraMessageBubble.displayName = "UltraMessageBubble";

// Advanced settings manager with real-time CSS injection
class AdvancedSettingsManager {
  private static instance: AdvancedSettingsManager;
  private styleElement: HTMLStyleElement | null = null;
  private cssRules = new Map<string, string>();

  static getInstance(): AdvancedSettingsManager {
    if (!AdvancedSettingsManager.instance) {
      AdvancedSettingsManager.instance = new AdvancedSettingsManager();
    }
    return AdvancedSettingsManager.instance; // Fixed: was returning UltraAudioManager.instance
  }

  constructor() {
    this.initializeStyleElement();
  }

  private initializeStyleElement() {
    if (typeof document === "undefined") return;

    this.styleElement = document.createElement("style");
    this.styleElement.id = "chat-dynamic-styles";
    document.head.appendChild(this.styleElement);
  }

  applySettings(settings: ChatSettings) {
    if (!this.styleElement) return;

    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      this.updateCSSVariables(settings);
      this.updateDynamicStyles(settings);
      this.injectCSS();
    });
  }

  private updateCSSVariables(settings: ChatSettings) {
    const root = document.documentElement;

    // Font size variables with smooth scaling
    const fontSizeMap = {
      small: { base: "0.875rem", timestamp: "0.75rem", name: "0.875rem" },
      medium: { base: "1rem", timestamp: "0.875rem", name: "1rem" },
      large: { base: "1.125rem", timestamp: "1rem", name: "1.125rem" },
    };

    const sizes = fontSizeMap[settings.fontSize];
    root.style.setProperty("--chat-font-size", sizes.base);
    root.style.setProperty("--chat-timestamp-size", sizes.timestamp);
    root.style.setProperty("--chat-name-size", sizes.name);

    // Line height with smooth transitions
    const lineHeightMap = {
      compact: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    };
    root.style.setProperty(
      "--chat-line-height",
      lineHeightMap[settings.lineHeight],
    );

    // Background and opacity
    root.style.setProperty(
      "--chat-bg-opacity",
      settings.backgroundOpacity.toString(),
    );

    if (settings.backgroundType === "solid") {
      root.style.setProperty("--chat-bg-color", settings.backgroundColor);
    }

    // Font family with fallbacks
    const fontFamilyMap = {
      default:
        "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      serif: "ui-serif, Georgia, 'Times New Roman', Times, serif",
      mono: "ui-monospace, 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace",
      rounded: "'SF Pro Rounded', ui-rounded, system-ui, sans-serif",
    };
    root.style.setProperty(
      "--chat-font-family",
      fontFamilyMap[settings.fontFamily],
    );

    // Animation settings
    root.style.setProperty(
      "--chat-animation-duration",
      settings.enableAnimations ? "0.3s" : "0s",
    );
    root.style.setProperty(
      "--chat-animation-easing",
      "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    );
  }

  private updateDynamicStyles(settings: ChatSettings) {
    const scheme = COLOR_SCHEMES[settings.colorScheme] || COLOR_SCHEMES.default;

    // Clear existing rules
    this.cssRules.clear();

    // Message styles based on settings
    if (settings.messageStyle === "bubble") {
      this.cssRules.set(
        "message-style",
        `
        .message-bubble {
          border-radius: 1rem;
          backdrop-filter: blur(8px);
        }
      `,
      );
    } else if (settings.messageStyle === "flat") {
      this.cssRules.set(
        "message-style",
        `
        .message-bubble {
          border-radius: 0;
          border-left: 4px solid ${scheme.accent};
        }
      `,
      );
    } else if (settings.messageStyle === "minimal") {
      this.cssRules.set(
        "message-style",
        `
        .message-bubble {
          border-radius: 0.5rem;
          background: transparent !important;
          border: 1px solid rgba(148, 163, 184, 0.3);
        }
      `,
      );
    }

    // Compact mode styles
    if (settings.compactMode) {
      this.cssRules.set(
        "compact-mode",
        `
        .message-container {
          margin-bottom: 0.5rem;
        }
        .message-bubble {
          padding: 0.5rem;
          font-size: 0.875rem;
        }
      `,
      );
    }

    // Animation styles
    if (settings.enableAnimations) {
      this.cssRules.set(
        "animations",
        `
        .message-bubble {
          transition: all var(--chat-animation-duration) var(--chat-animation-easing);
        }
        .message-bubble:hover {
          transform: scale(1.01);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
      `,
      );
    }

    // Scrollbar styling
    this.cssRules.set(
      "scrollbar",
      `
      .chat-messages::-webkit-scrollbar {
        width: 6px;
      }
      .chat-messages::-webkit-scrollbar-track {
        background: rgba(148, 163, 184, 0.1);
        border-radius: 3px;
      }
      .chat-messages::-webkit-scrollbar-thumb {
        background: rgba(148, 163, 184, 0.3);
        border-radius: 3px;
      }
      .chat-messages::-webkit-scrollbar-thumb:hover {
        background: rgba(148, 163, 184, 0.5);
      }
    `,
    );
  }

  private injectCSS() {
    if (!this.styleElement) return;

    const cssText = Array.from(this.cssRules.values()).join("\n");
    this.styleElement.textContent = cssText;
  }
}

export default function ChatInterface({
  character,
  setSelectedCharacter,
  initialChatHistory,
  onViewCreatorProfile,
}: ChatInterfaceProps) {
  // Consolidated state with better organization
  const [uiState, setUiState] = useState({
    isChatSettingsOpen: false,
    isStartNewChatOpen: false,
    isPersonaEditOpen: false,
    isPersonaChangeOpen: false,
    isPersonaCreateOpen: false,
    isModeSelectionOpen: false,
    isChatOptionsOpen: false,
    isBotProfileOpen: false,
    showChatOptions: false,
  });

  // Chat mode state
  const [currentChatMode, setCurrentChatMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentChatMode") || "free";
    }
    return "free";
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Add refs for debouncing
  const inputUpdateTimeoutRef = useRef<NodeJS.Timeout>();
  const lastInputValueRef = useRef(inputText);

  // Ultra-optimized settings with immediate application
  const [settings, setSettings] = useState<ChatSettings>(() => {
    const initialSettings = getChatSettings();
    // Apply settings immediately on load
    if (typeof window !== "undefined") {
      AdvancedSettingsManager.getInstance().applySettings(initialSettings);
    }
    return initialSettings;
  });

  const [parameters, setParameters] = useState<ParameterSettings>(() =>
    getParameterSettings(),
  );

  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    messageId: string;
    isUserMessage: boolean;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    messageId: "",
    isUserMessage: false,
  });

  // Ref for the context menu div
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [adjustedContextMenuPosition, setAdjustedContextMenuPosition] =
    useState({ x: 0, y: 0 });

  // Optimized persona state with immediate persistence
  const [currentPersona, setCurrentPersona] = useState<Persona>(() => {
    if (typeof window === "undefined") {
      return {
        id: "default",
        name: "You",
        age: "",
        likes: "",
        dislikes: "",
        additional: "",
        isDefault: true,
        image: "/placeholder.svg?height=40&width=40",
      };
    }

    try {
      const saved = localStorage.getItem("currentPersona");
      return saved
        ? JSON.parse(saved)
        : {
            id: "default",
            name: "You",
            age: "",
            likes: "",
            dislikes: "",
            additional: "",
            isDefault: true,
            image: "/placeholder.svg?height=40&width=40",
          };
    } catch {
      return {
        id: "default",
        name: "You",
        age: "",
        likes: "",
        dislikes: "",
        additional: "",
        isDefault: true,
        image: "/placeholder.svg?height=40&width=40",
      };
    }
  });

  const [currentModel, setCurrentModel] = useState<Model>(() => {
    if (typeof window === "undefined") {
      return {
        id: "mistral-7b",
        name: "Mistral 7B",
        provider: "Mistral AI",
        description: "Fast and efficient language model",
        capabilities: ["text-generation", "conversation"],
      };
    }

    try {
      const saved = localStorage.getItem("currentChatModel");
      return saved
        ? JSON.parse(saved)
        : {
            id: "mistral-7b",
            name: "Mistral 7B",
            provider: "Mistral AI",
            description: "Fast and efficient language model",
            capabilities: ["text-generation", "conversation"],
          };
    } catch {
      return {
        id: "mistral-7b",
        name: "Mistral 7B",
        provider: "Mistral AI",
        description: "Fast and efficient language model",
        capabilities: ["text-generation", "conversation"],
      };
    }
  });

  // Advanced refs for performance optimization
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const audioManagerRef = useRef<UltraAudioManager>(
    UltraAudioManager.getInstance(),
  );
  const settingsManagerRef = useRef<AdvancedSettingsManager>(
    AdvancedSettingsManager.getInstance(),
  );
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const resizeObserverRef = useRef<ResizeObserver>();
  const lastScrollTopRef = useRef(0);
  const isScrollingRef = useRef(false);
  const isUserScrollingRef = useRef(false);

  // Advanced debounced values
  const debouncedSettings = useAdvancedDebounce(settings, 100);

  // Ultra-optimized computed values with deep memoization
  const colorScheme = useMemo(
    () => COLOR_SCHEMES[settings.colorScheme] || COLOR_SCHEMES.default,
    [settings.colorScheme],
  );

  const fontSize = useMemo(
    () => FONT_SIZES[settings.fontSize],
    [settings.fontSize],
  );
  const fontFamily = useMemo(
    () => FONT_FAMILIES[settings.fontFamily],
    [settings.fontFamily],
  );
  const lineHeight = useMemo(
    () => LINE_HEIGHTS[settings.lineHeight],
    [settings.lineHeight],
  );

  const hasBackgroundImage = useMemo(() => {
    return (
      (character.sceneImage &&
        character.sceneImage !== "/placeholder.svg?height=400&width=600") ||
      (settings.backgroundType === "character" &&
        character.image &&
        character.image !== "/placeholder.svg?height=400&width=300") ||
      (settings.backgroundType === "image" && settings.backgroundImage)
    );
  }, [
    character.sceneImage,
    character.image,
    settings.backgroundType,
    settings.backgroundImage,
  ]);

  const backgroundStyle = useMemo(() => {
    if (
      character.sceneImage &&
      character.sceneImage !== "/placeholder.svg?height=400&width=600"
    ) {
      return {
        backgroundImage: `url('${character.sceneImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        willChange: "transform",
      };
    }

    if (
      settings.backgroundType === "character" &&
      character.image &&
      character.image !== "/placeholder.svg?height=400&width=300"
    ) {
      return {
        backgroundImage: `url('${character.image}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        willChange: "transform",
      };
    } else if (settings.backgroundType === "solid") {
      return {
        backgroundColor: settings.backgroundColor,
      };
    } else if (
      settings.backgroundType === "image" &&
      settings.backgroundImage
    ) {
      return {
        backgroundImage: `url('${settings.backgroundImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        willChange: "transform",
      };
    } else {
      return {
        background: `linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)`,
      };
    }
  }, [
    character.sceneImage,
    character.image,
    settings.backgroundType,
    settings.backgroundColor,
    settings.backgroundImage,
  ]);

  const elementStyling = useMemo(() => {
    return hasBackgroundImage
      ? {
          textShadow: "0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)",
          willChange: "transform",
        }
      : { willChange: "transform" };
  }, [hasBackgroundImage]);

  // Chat options with memoization
  const chatOptions = useMemo(
    () => [
      {
        id: "mode",
        label: "Mode",
        icon: <User className="w-4 h-4" />,
        color: "hover:text-blue-400 hover:bg-blue-500/10",
      },
      {
        id: "persona",
        label: "Persona",
        icon: <User className="w-4 h-4" />,
        color: "hover:text-purple-400 hover:bg-purple-500/10",
      },
    ],
    [],
  );

  // Enhanced virtual scrolling for large message lists
  const {
    visibleItems,
    visibleRange,
    setScrollTop,
    setContainerRef,
    totalHeight,
    setItemHeight,
  } = useVirtualScrolling(
    messages,
    600, // Approximate container height
    100, // Estimated message height
  );

  // Function to create greeting message
  const createGreetingMessage = useCallback((): Message => {
    const greetingText =
      character.greeting ||
      character.messages?.[0]?.text ||
      character.intro ||
      `Hello! I'm ${character.name}. How are you today?`;

    return {
      id: `greeting-${character.id}-${Date.now()}`,
      sender: character.name || "AI Assistant",
      text: greetingText,
      timestamp: new Date(),
      isPinned: false,
      type: "text",
      isGreeting: true, // Mark as greeting message
    };
  }, [character]);

  // Ultra-smooth settings application with immediate effect
  const applySettingsImmediately = useCallback((newSettings: ChatSettings) => {
    startTransition(() => {
      setSettings(newSettings);
      settingsManagerRef.current.applySettings(newSettings);
    });
  }, []);

  // Advanced settings listeners with immediate application
  useLayoutEffect(() => {
    const handleSettingsUpdate = (event: CustomEvent<ChatSettings>) => {
      applySettingsImmediately(event.detail);
    };

    const handleParametersUpdate = (event: CustomEvent<ParameterSettings>) => {
      startTransition(() => {
        setParameters(event.detail);
      });
    };

    window.addEventListener(
      "chatSettingsUpdated",
      handleSettingsUpdate as EventListener,
    );
    window.addEventListener(
      "parameterSettingsUpdated",
      handleParametersUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        "chatSettingsUpdated",
        handleSettingsUpdate as EventListener,
      );
      window.removeEventListener(
        "parameterSettingsUpdated",
        handleParametersUpdate as EventListener,
      );
    };
  }, [applySettingsImmediately]);

  // Apply debounced settings
  useEffect(() => {
    settingsManagerRef.current.applySettings(debouncedSettings);
  }, [debouncedSettings]);

  // Ultra-optimized localStorage persistence with batching
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (typeof window !== "undefined") {
        try {
          const batch = [
            { key: "currentPersona", value: JSON.stringify(currentPersona) },
            { key: "currentChatModel", value: JSON.stringify(currentModel) },
          ];

          // Batch localStorage operations
          requestIdleCallback
            ? requestIdleCallback(() => {
                batch.forEach(({ key, value }) =>
                  localStorage.setItem(key, value),
                );
              })
            : batch.forEach(({ key, value }) =>
                localStorage.setItem(key, value),
              );
        } catch (error) {
          console.warn("Failed to save to localStorage:", error);
        }
      }
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [currentPersona, currentModel]);

  // Ultra-smooth message initialization
  useEffect(() => {
    const initializeMessages = async () => {
      try {
        if (initialChatHistory && initialChatHistory.length > 0) {
          const validHistory = initialChatHistory.filter(
            (msg) => msg && msg.id && msg.sender && msg.text && msg.timestamp,
          );

          const historyMessages: Message[] = validHistory.map((msg) => ({
            id: msg.id,
            sender: msg.sender,
            text: msg.text,
            timestamp: new Date(msg.timestamp),
            type: msg.type || "text",
            imageUrl: msg.imageUrl,
            isGreeting:
              msg.sender === character.name && validHistory.indexOf(msg) === 0, // Mark first character message as greeting
          }));

          // Use startTransition for smooth updates
          startTransition(() => {
            setMessages(historyMessages);
          });

          markChatAsRead(character.id);
        } else {
          const greetingMessage = createGreetingMessage();

          startTransition(() => {
            setMessages([greetingMessage]);
          });

          const initialChat: RecentChat = {
            id: character.id,
            character,
            lastMessage: greetingMessage.text,
            lastMessageTime: greetingMessage.timestamp.getTime(),
            messageCount: 1,
            isUnread: false,
            chatHistory: [
              {
                id: greetingMessage.id,
                sender: greetingMessage.sender,
                text: greetingMessage.text,
                timestamp: greetingMessage.timestamp.getTime(),
                type: greetingMessage.type,
              },
            ],
          };

          saveRecentChat(initialChat);
        }
      } catch (error) {
        console.error("Failed to initialize chat messages:", error);

        const errorMessage: Message = {
          id: "error-1",
          sender: "System",
          text: "Sorry, there was an issue loading the chat. Please try refreshing or starting a new conversation.",
          timestamp: new Date(),
          isPinned: false,
          type: "text",
        };

        startTransition(() => {
          setMessages([errorMessage]);
        });
      }
    };

    initializeMessages();
  }, [character, initialChatHistory, createGreetingMessage]);

  // Ultra-smooth scrolling with enhanced momentum and easing
  const scrollToBottom = useCallback(() => {
    if (
      !settings.autoScroll ||
      isScrollingRef.current ||
      isUserScrollingRef.current
    )
      return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (messagesEndRef.current && messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        const targetScrollTop = container.scrollHeight - container.clientHeight;

        if (settings.enableAnimations) {
          // Smooth animated scroll
          const startScrollTop = container.scrollTop;
          const distance = targetScrollTop - startScrollTop;
          const duration = Math.min(Math.abs(distance) * 0.5, 500); // Max 500ms
          const startTime = performance.now();

          const animateScroll = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);

            container.scrollTop = startScrollTop + distance * easeOutCubic;

            if (progress < 1) {
              requestAnimationFrame(animateScroll);
            }
          };

          requestAnimationFrame(animateScroll);
        } else {
          // Instant scroll
          container.scrollTop = targetScrollTop;
        }
      }
    }, 50);
  }, [settings.autoScroll, settings.enableAnimations]);

  // Enhanced scroll handling with user interaction detection
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;
    let userScrollTimeout: NodeJS.Timeout;

    const handleScroll = (e: Event) => {
      isScrollingRef.current = true;
      const currentScrollTop = container.scrollTop;
      const maxScrollTop = container.scrollHeight - container.clientHeight;

      // Detect user scrolling (not programmatic)
      if (e.isTrusted) {
        isUserScrollingRef.current = true;

        // Clear user scrolling flag after inactivity
        if (userScrollTimeout) {
          clearTimeout(userScrollTimeout);
        }
        userScrollTimeout = setTimeout(() => {
          isUserScrollingRef.current = false;
        }, 1000);
      }

      // Update virtual scrolling
      setScrollTop(currentScrollTop);

      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Set scroll end detection
      scrollTimeout = setTimeout(() => {
        isScrollingRef.current = false;
        lastScrollTopRef.current = currentScrollTop;
      }, 100);
    };

    const handleWheel = () => {
      isUserScrollingRef.current = true;
      if (userScrollTimeout) {
        clearTimeout(userScrollTimeout);
      }
      userScrollTimeout = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 1000);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("wheel", handleWheel, { passive: true });
    container.addEventListener("touchstart", handleWheel, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleWheel);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      if (userScrollTimeout) {
        clearTimeout(userScrollTimeout);
      }
    };
  }, [setScrollTop]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Optimized chat history saving with intelligent batching
  useEffect(() => {
    if (messages.length === 0) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const lastMessage = messages[messages.length - 1];
        const chatHistory = messages.map((msg) => ({
          id: msg.id,
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp.getTime(),
          type: msg.type,
          imageUrl: msg.imageUrl,
        }));

        // Use requestIdleCallback for non-critical operations
        const saveOperation = () => {
          updateRecentChat(character.id, {
            lastMessage: lastMessage.text,
            lastMessageTime: lastMessage.timestamp.getTime(),
            messageCount: messages.length,
            chatHistory,
            isUnread: false,
          });
        };

        if (window.requestIdleCallback) {
          window.requestIdleCallback(saveOperation);
        } else {
          setTimeout(saveOperation, 0);
        }
      } catch (error) {
        console.warn("Failed to save chat history:", error);
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [messages, character.id]);

  // Ultra-optimized sound system
  const playSound = useCallback(
    async (soundType: "message" | "notification") => {
      try {
        await audioManagerRef.current.playSound(soundType, settings);
      } catch (error) {
        console.warn("Sound playback failed:", error);
      }
    },
    [settings],
  );

  // Optimized message operations with batching
  const addMessage = useCallback(
    (message: Message) => {
      startTransition(() => {
        setMessages((prev) => [...prev, message]);
      });
      playSound(
        message.sender === "You" || message.sender === currentPersona.name
          ? "message"
          : "notification",
      );
    },
    [playSound, currentPersona.name],
  );

  const updateMessage = useCallback(
    (messageId: string, updates: Partial<Message>) => {
      startTransition(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, ...updates } : msg,
          ),
        );
      });
    },
    [],
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!messageId) return;

      startTransition(() => {
        setMessages((prev) => {
          const messageExists = prev.some((msg) => msg.id === messageId);
          if (!messageExists) {
            console.warn(`Message with ID ${messageId} not found`);
            return prev;
          }

          // Filter out the message with the given ID
          const updatedMessages = prev.filter((msg) => msg.id !== messageId);

          // Ensure we don't delete all messages - keep at least one greeting
          if (updatedMessages.length === 0) {
            console.log("Cannot delete last message - restoring greeting");
            return [createGreetingMessage()];
          }

          return updatedMessages;
        });
      });
    },
    [createGreetingMessage],
  );

  // Ultra-optimized context menu handling
  const openContextMenu = useCallback(
    (
      position: { x: number; y: number },
      messageId: string,
      isUserMessage: boolean,
    ) => {
      setContextMenu({ isOpen: true, position, messageId, isUserMessage });
    },
    [],
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu({
      isOpen: false,
      position: { x: 0, y: 0 },
      messageId: "",
      isUserMessage: false,
    });
  }, []);

  // Effect to adjust context menu position
  useLayoutEffect(() => {
    if (!contextMenu.isOpen || !contextMenuRef.current) return;

    const menuElement = contextMenuRef.current;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const menuRect = menuElement.getBoundingClientRect();

    let newX = contextMenu.position.x;
    let newY = contextMenu.position.y;

    // Adjust X position
    if (newX + menuRect.width > viewportWidth - 10) {
      // 10px padding from right edge
      newX = viewportWidth - menuRect.width - 10;
    }
    if (newX < 10) {
      // 10px padding from left edge
      newX = 10;
    }

    // Adjust Y position
    if (newY + menuRect.height > viewportHeight - 10) {
      // 10px padding from bottom edge
      newY = viewportHeight - menuRect.height - 10;
    }
    if (newY < 10) {
      // 10px padding from top edge
      newY = 10;
    }

    // Ensure the menu is not completely off-screen if initial position is extreme
    newX = Math.max(10, Math.min(newX, viewportWidth - menuRect.width - 10));
    newY = Math.max(10, Math.min(newY, viewportHeight - menuRect.height - 10));

    setAdjustedContextMenuPosition({ x: newX, y: newY });

    const handleResize = () => {
      // Recalculate position on resize
      const currentMenuRect = menuElement.getBoundingClientRect();
      let resizedX = contextMenu.position.x;
      let resizedY = contextMenu.position.y;

      const currentViewportWidth = window.innerWidth;
      const currentViewportHeight = window.innerHeight;

      if (resizedX + currentMenuRect.width > currentViewportWidth - 10) {
        resizedX = currentViewportWidth - currentMenuRect.width - 10;
      }
      if (resizedX < 10) {
        resizedX = 10;
      }

      if (resizedY + currentMenuRect.height > currentViewportHeight - 10) {
        resizedY = currentViewportHeight - currentMenuRect.height - 10;
      }
      if (resizedY < 10) {
        resizedY = 10;
      }

      resizedX = Math.max(
        10,
        Math.min(resizedX, currentViewportWidth - currentMenuRect.width - 10),
      );
      resizedY = Math.max(
        10,
        Math.min(resizedY, currentViewportHeight - currentMenuRect.height - 10),
      );

      setAdjustedContextMenuPosition({ x: resizedX, y: resizedY });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [contextMenu.isOpen, contextMenu.position.x, contextMenu.position.y]); // Re-run if position changes

  // Optimized editing functions
  const startEditing = useCallback(
    (messageId: string, text: string) => {
      setEditingMessageId(messageId);
      setEditingText(text);
      closeContextMenu();
    },
    [closeContextMenu],
  );

  const saveEdit = useCallback(() => {
    if (editingMessageId && editingText.trim()) {
      updateMessage(editingMessageId, { text: editingText.trim() });
      setEditingMessageId(null);
      setEditingText("");
    }
  }, [editingMessageId, editingText, updateMessage]);

  const cancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setEditingText("");
  }, []);

  // Ultra-optimized message click handler
  const handleMessageClick = useCallback(
    (e: React.MouseEvent, messageId: string, isUserMessage: boolean) => {
      e.preventDefault();
      e.stopPropagation();

      // Use exact click coordinates
      const position = { x: e.clientX, y: e.clientY };

      openContextMenu(position, messageId, isUserMessage);
    },
    [openContextMenu],
  );

  // Context menu handlers with optimized performance
  const handleEditMessage = useCallback(() => {
    const message = messages.find((m) => m.id === contextMenu.messageId);
    if (message) {
      startEditing(message.id, message.text);
    }
  }, [messages, contextMenu.messageId, startEditing]);

  const handleCopyMessage = useCallback(async () => {
    const message = messages.find((m) => m.id === contextMenu.messageId);
    if (!message) {
      closeContextMenu();
      return;
    }

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(message.text);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = message.text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      // Optional: Add a brief visual feedback (you can remove this if not needed)
      console.log("Message copied to clipboard");
    } catch (error) {
      console.error("Failed to copy message:", error);
      // Fallback: try the older method
      try {
        const textArea = document.createElement("textarea");
        textArea.value = message.text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      } catch (fallbackError) {
        console.error("Copy fallback also failed:", fallbackError);
      }
    } finally {
      closeContextMenu();
    }
  }, [messages, contextMenu.messageId, closeContextMenu]);

  const handleDeleteMessage = useCallback(() => {
    if (!contextMenu.messageId) {
      closeContextMenu();
      return;
    }

    const message = messages.find((m) => m.id === contextMenu.messageId);
    if (!message) {
      closeContextMenu();
      return;
    }

    // Prevent deletion of greeting messages to maintain conversation flow
    if (message.isGreeting) {
      console.log("Cannot delete greeting message");
      closeContextMenu();
      return;
    }

    // Delete the message
    deleteMessage(contextMenu.messageId);

    // Update recent chat history if this affects the conversation
    try {
      const updatedMessages = messages.filter(
        (msg) => msg.id !== contextMenu.messageId,
      );
      const recentChat: RecentChat = {
        id: character.id,
        character: character,
        chatHistory: updatedMessages,
        lastMessage: updatedMessages[updatedMessages.length - 1]?.text || "",
        timestamp: Date.now(),
        isRead: true,
      };
      updateRecentChat(recentChat);
    } catch (error) {
      console.error("Failed to update recent chat after deletion:", error);
    }

    closeContextMenu();
  }, [
    contextMenu.messageId,
    messages,
    deleteMessage,
    closeContextMenu,
    character,
  ]);

  // Ultra-optimized new chat handlers with greeting restoration
  const handleDeleteAndStart = useCallback(() => {
    const greetingMessage = createGreetingMessage();

    startTransition(() => {
      setMessages([greetingMessage]);
    });

    const newChat: RecentChat = {
      id: character.id,
      character,
      lastMessage: greetingMessage.text,
      lastMessageTime: greetingMessage.timestamp.getTime(),
      messageCount: 1,
      isUnread: false,
      chatHistory: [
        {
          id: greetingMessage.id,
          sender: greetingMessage.sender,
          text: greetingMessage.text,
          timestamp: greetingMessage.timestamp.getTime(),
          type: greetingMessage.type,
        },
      ],
    };

    saveRecentChat(newChat);
    setUiState((prev) => ({ ...prev, isStartNewChatOpen: false }));
  }, [character, createGreetingMessage]);

  const handleSaveAndStart = useCallback(() => {
    setUiState((prev) => ({ ...prev, isStartNewChatOpen: false }));
  }, []);

  // AI response generation with real API for Free mode
  const simulateAIResponse = useCallback(
    async (userMessage: string, conversationContext: Message[] = []) => {
      // Use real AI service for all modes
      if (
        currentChatMode === "free" ||
        currentChatMode === "roleplay" ||
        currentChatMode === "storystream"
      ) {
        try {
          const aiMessage = await generateAIResponse(
            userMessage,
            {
              name: character.name,
              description: character.description,
              personality: character.personality,
              scenario: character.scenario,
              appearance: character.appearance,
              intro: character.intro,
              rating: character.rating,
            },
            conversationContext,
            currentChatMode,
            character.rating || "filtered",
            currentPersona.id !== "default" ? currentPersona : undefined,
          );

          return {
            ...aiMessage,
            delay: getDelayForMode(currentChatMode),
          };
        } catch (error) {
          console.error(
            "AI response generation failed, falling back to simulated:",
            error,
          );
          // Fall back to simulated response if API fails
        }
      }

      // Fallback to simulated response for other modes or if API fails
      return new Promise<{
        id: string;
        sender: string;
        text: string;
        timestamp: Date;
        isPinned: boolean;
        type: "text";
        delay: number;
      }>((resolve) => {
        // Use requestIdleCallback for non-critical processing
        const processResponse = () => {
          const recentMessages = conversationContext.slice(
            -Math.floor(parameters.contextLength / 100),
          );

          let baseResponses: string[] = [];

          if (parameters.temperature > 0.8) {
            baseResponses = [
              "What a fascinating perspective! I'm genuinely intrigued by your thoughts on this.",
              "That's such an interesting way to look at it! Tell me more about what sparked that idea.",
              "Wow, I hadn't considered that angle before. Your insight really makes me think differently.",
              "That's beautifully put! There's something profound in what you're saying.",
              "I love how your mind works! That connection you made is really creative.",
            ];
          } else if (parameters.temperature < 0.4) {
            baseResponses = [
              "I understand. Can you provide more details?",
              "That's clear. What would you like to discuss next?",
              "I see your point. How can I help you further?",
              "Understood. Please continue.",
              "That makes sense. What else would you like to know?",
            ];
          } else {
            baseResponses = [
              "That's interesting! Tell me more about that.",
              "I see what you mean. How does that make you feel?",
              "Hmm, that's a fascinating perspective.",
              "I'd love to hear more about your thoughts on this.",
              "That sounds really intriguing!",
            ];
          }

          let selectedResponse =
            baseResponses[Math.floor(Math.random() * baseResponses.length)];

          if (
            currentPersona.id !== "default" &&
            currentPersona.name !== "You"
          ) {
            selectedResponse = selectedResponse.replace(
              /you/gi,
              currentPersona.name,
            );
          }

          if (character.personality) {
            const personalityTraits = character.personality.toLowerCase();
            if (personalityTraits.includes("friendly")) {
              selectedResponse = selectedResponse.replace(/\./g, "! 😊");
            } else if (personalityTraits.includes("serious")) {
              selectedResponse = selectedResponse.replace(/!/g, ".");
            }
          }

          const streamingDelay = parameters.enableStreaming
            ? parameters.streamingSpeed === "fast"
              ? 200
              : parameters.streamingSpeed === "medium"
                ? 600
                : 1200
            : 0;

          const responseSpeedDelay =
            parameters.responseSpeed === "fast"
              ? 150
              : parameters.responseSpeed === "thoughtful"
                ? 1500
                : 800;

          const totalDelay = streamingDelay + responseSpeedDelay;

          resolve({
            id: `msg-${Date.now()}`,
            sender: character.name,
            text: selectedResponse,
            timestamp: new Date(),
            isPinned: false,
            type: "text" as const,
            delay: totalDelay,
          });
        };

        if (window.requestIdleCallback) {
          window.requestIdleCallback(processResponse);
        } else {
          setTimeout(processResponse, 0);
        }
      });
    },
    [character, parameters, currentPersona, currentChatMode],
  );

  // Ultra-optimized send handler with batching
  const handleSend = useCallback(async () => {
    const currentValue = inputRef.current?.value || lastInputValueRef.current;
    if (!currentValue.trim()) return;

    try {
      if (!character || !character.name) {
        throw new Error("Character data is missing");
      }

      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        sender: currentPersona.name || "You",
        text: currentValue.trim(),
        timestamp: new Date(),
        isPinned: false,
        type: "text",
      };

      addMessage(newMessage);
      const userInput = currentValue.trim();

      // Clear input immediately
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      lastInputValueRef.current = "";
      setInputText("");
      setUiState((prev) => ({ ...prev, showChatOptions: false }));

      // Show typing indicator immediately
      setIsTyping(true);

      try {
        const aiResponse = await simulateAIResponse(userInput, messages);

        // Hide typing indicator and add response immediately
        setIsTyping(false);
        addMessage({
          id: aiResponse.id,
          sender: aiResponse.sender,
          text: aiResponse.text,
          timestamp: aiResponse.timestamp,
          isPinned: aiResponse.isPinned,
          type: aiResponse.type,
        });
      } catch (responseError) {
        console.error("Failed to add AI response:", responseError);
        setIsTyping(false);

        addMessage({
          id: `error-${Date.now()}`,
          sender: character.name || "AI Assistant",
          text: "I'm sorry, I'm having trouble responding right now. Please try again.",
          timestamp: new Date(),
          isPinned: false,
          type: "text",
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [
    inputText,
    addMessage,
    simulateAIResponse,
    messages,
    currentPersona,
    character,
  ]);

  // Regenerate message handler
  const handleRegenerate = useCallback(
    async (messageId: string) => {
      const messageIndex = messages.findIndex((msg) => msg.id === messageId);
      if (messageIndex === -1) return;

      // Get the previous user message to regenerate from
      let userMessage = "";
      for (let i = messageIndex - 1; i >= 0; i--) {
        if (
          messages[i].sender === "You" ||
          messages[i].sender === currentPersona.name
        ) {
          userMessage = messages[i].text;
          break;
        }
      }

      if (!userMessage) return;

      // Get conversation context up to the message being regenerated
      const conversationContext = messages.slice(0, messageIndex);

      try {
        // Generate new AI response
        const aiResponse = await simulateAIResponse(
          userMessage,
          conversationContext,
        );
        const currentMessage = messages[messageIndex];

        // Create variations array with current and new response
        const variations = currentMessage.variations || [currentMessage.text];
        variations.push(aiResponse.text);

        // Update the message with new variation
        updateMessage(messageId, {
          variations,
          currentVariationIndex: variations.length,
          text: aiResponse.text,
        });
      } catch (error) {
        console.error("Failed to regenerate message:", error);
      }
    },
    [messages, currentPersona, simulateAIResponse, updateMessage],
  );

  // Handle previous variation navigation (go back one response at a time)
  const handlePreviousVariation = useCallback(
    (messageId: string) => {
      const message = messages.find((msg) => msg.id === messageId);
      if (!message || !message.variations) return;

      const currentIndex = message.currentVariationIndex || 1;

      // Go back one response if not at the first
      if (currentIndex > 1) {
        const newIndex = currentIndex - 1;
        updateMessage(messageId, {
          currentVariationIndex: newIndex,
          text: message.variations[newIndex - 1],
        });
      }
    },
    [messages, updateMessage],
  );

  // Handle next variation navigation (move forward or regenerate at end)
  const handleNextVariation = useCallback(
    async (messageId: string) => {
      const message = messages.find((msg) => msg.id === messageId);
      if (!message || !message.variations) return;

      const currentIndex = message.currentVariationIndex || 1;
      const totalVariations = message.variations.length;

      // If not at the end, navigate to next existing variation
      if (currentIndex < totalVariations) {
        const newIndex = currentIndex + 1;
        updateMessage(messageId, {
          currentVariationIndex: newIndex,
          text: message.variations[newIndex - 1],
        });
      } else {
        // At the end, generate a new variation
        await handleRegenerate(messageId);
      }
    },
    [messages, updateMessage, handleRegenerate],
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // Ultra-optimized UI state handlers
  const handleSettingsNavigation = useCallback((settingId: string) => {
    startTransition(() => {
      setUiState((prev) => ({ ...prev, isChatSettingsOpen: false }));

      switch (settingId) {
        case "start-new-chat":
          setUiState((prev) => ({ ...prev, isStartNewChatOpen: true }));
          break;

        default:
          break;
      }
    });
  }, []);

  const handleChatOptionSelect = useCallback((optionId: string) => {
    startTransition(() => {
      setUiState((prev) => ({ ...prev, showChatOptions: false }));

      switch (optionId) {
        case "mode":
          setUiState((prev) => ({ ...prev, isModeSelectionOpen: true }));
          break;
        case "persona":
          setUiState((prev) => ({ ...prev, isPersonaChangeOpen: true }));
          break;
        default:
          break;
      }
    });
  }, []);

  const handlePlusClick = useCallback(() => {
    startTransition(() => {
      setUiState((prev) => ({
        ...prev,
        showChatOptions: !prev.showChatOptions,
      }));
    });
  }, []);

  // Model and persona handlers with optimized updates
  const handleModelSelect = useCallback((model: Model) => {
    startTransition(() => {
      setCurrentModel(model);
    });
  }, []);

  const handlePersonaEdit = useCallback(() => {
    setUiState((prev) => ({ ...prev, isPersonaEditOpen: true }));
  }, []);

  const handlePersonaChange = useCallback(() => {
    setUiState((prev) => ({ ...prev, isPersonaChangeOpen: true }));
  }, []);

  const handlePersonaRemove = useCallback(() => {
    startTransition(() => {
      setCurrentPersona({
        id: "default",
        name: "You",
        age: "",
        likes: "",
        dislikes: "",
        additional: "",
        isDefault: true,
        image: "/placeholder.svg?height=40&width=40",
      });
    });
  }, []);

  const handlePersonaSelect = useCallback((persona: Persona) => {
    startTransition(() => {
      setCurrentPersona(persona);
    });
  }, []);

  const handlePersonaUpdated = useCallback(
    (persona: Persona) => {
      if (persona.id === currentPersona.id || persona.isDefault) {
        startTransition(() => {
          setCurrentPersona(persona);
        });
      }
    },
    [currentPersona],
  );

  // Ultra-optimized file handlers
  const onImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          return;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
          return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
          const imageUrl = event.target?.result as string;
          const newMessage: Message = {
            id: `msg-${Date.now()}`,
            sender: currentPersona.name || "You",
            text: "Shared an image",
            timestamp: new Date(),
            isPinned: false,
            type: "image",
            imageUrl,
          };
          addMessage(newMessage);

          const aiResponse = await simulateAIResponse("image shared", messages);
          setTimeout(() => {
            addMessage({
              id: `msg-${Date.now()}`,
              sender: character.name,
              text: "That's a great image! What would you like to talk about regarding it?",
              timestamp: new Date(),
              isPinned: false,
              type: "text",
            });
          }, aiResponse.delay || 800);
        };
        reader.readAsDataURL(file);
      }
    },
    [addMessage, character.name, simulateAIResponse, messages, currentPersona],
  );

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          return;
        }

        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          sender: currentPersona.name || "You",
          text: `Shared a file: ${file.name}`,
          timestamp: new Date(),
          isPinned: false,
          type: "text",
        };
        addMessage(newMessage);

        simulateAIResponse(`file shared: ${file.name}`, messages).then(
          (aiResponse) => {
            setTimeout(
              () =>
                addMessage({
                  id: `msg-${Date.now()}`,
                  sender: aiResponse.sender,
                  text: aiResponse.text,
                  timestamp: aiResponse.timestamp,
                  type: aiResponse.type,
                }),
              aiResponse.delay || 800,
            );
          },
        );
      }
    },
    [addMessage, simulateAIResponse, messages, currentPersona],
  );

  // Ultra-fast input handler - minimal state updates
  const handleInputChange = useCallback((value: string) => {
    // Store value in ref for immediate access
    lastInputValueRef.current = value;

    // Skip state updates entirely during rapid typing
    if (inputUpdateTimeoutRef.current) {
      clearTimeout(inputUpdateTimeoutRef.current);
    }

    // Only update state when user pauses typing (300ms)
    inputUpdateTimeoutRef.current = setTimeout(() => {
      setInputText(value);
    }, 300);
  }, []);

  // Ultra-optimized auto-resize with RAF
  const autoResize = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, []);

  // Ultra-optimized class generators with memoization
  const getHeaderClasses = useCallback(() => {
    const baseClasses =
      "px-4 py-3 transition-all duration-300 will-change-transform";

    if (hasBackgroundImage) {
      return `${baseClasses} bg-transparent border-transparent`;
    } else {
      return `${baseClasses} bg-slate-800/80 border-b border-slate-700/50 shadow-lg`;
    }
  }, [hasBackgroundImage]);

  const getInputAreaClasses = useCallback(() => {
    const baseClasses =
      "flex-shrink-0 transition-all duration-300 will-change-transform";

    if (hasBackgroundImage) {
      return `${baseClasses} bg-transparent border-transparent`;
    } else {
      return `${baseClasses} bg-slate-800/80 border-t border-slate-700/50 shadow-lg`;
    }
  }, [hasBackgroundImage]);

  const getIntroCardClasses = useCallback(() => {
    const baseClasses =
      "bg-slate-800/60 border-slate-700/50 shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 will-change-transform";

    const blurClass = hasBackgroundImage
      ? "backdrop-blur-sm"
      : "backdrop-blur-md";

    return `${baseClasses} ${blurClass}`;
  }, [hasBackgroundImage]);

  // Cleanup with comprehensive resource management
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      audioManagerRef.current.cleanup();
    };
  }, []);

  // Set container ref for virtual scrolling
  useEffect(() => {
    if (messagesContainerRef.current) {
      setContainerRef(messagesContainerRef.current);
    }
  }, [setContainerRef]);

  // Handle bot profile view
  if (uiState.isBotProfileOpen) {
    return (
      <BotProfilePage
        character={character}
        onBack={() =>
          setUiState((prev) => ({ ...prev, isBotProfileOpen: false }))
        }
        onStartChat={() =>
          setUiState((prev) => ({ ...prev, isBotProfileOpen: false }))
        }
        onViewCreatorProfile={onViewCreatorProfile}
      />
    );
  }

  return (
    <div
      className={`flex flex-col h-screen ${colorScheme.background} relative ${fontFamily} will-change-transform`}
      style={{
        ...backgroundStyle,
        opacity: settings.backgroundOpacity,
        fontFamily: "var(--chat-font-family)",
      }}
    >
      {hasBackgroundImage && (
        <div
          className="absolute inset-0 bg-black/20 will-change-transform"
          style={{ opacity: 1 - settings.backgroundOpacity }}
        />
      )}

      <div className="relative z-10 flex flex-col h-screen will-change-transform">
        {/* Header */}
        <div className={getHeaderClasses()}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setSelectedCharacter(null)}
                variant="ghost"
                size="sm"
                className={`text-white transition-all duration-300 will-change-transform ${
                  hasBackgroundImage
                    ? "hover:bg-black/20 border border-transparent hover:border-white/20"
                    : `hover:bg-slate-700/50 hover:${colorScheme.accent}`
                }`}
                style={elementStyling}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              {settings.showAvatars && (
                <Avatar
                  className={`w-8 h-8 shadow-lg will-change-transform cursor-pointer hover:scale-105 transition-transform duration-200 ${
                    hasBackgroundImage
                      ? "ring-2 ring-white/40 hover:ring-white/60"
                      : `ring-2 ring-${colorScheme.accent.replace("text-", "")}/30 hover:ring-${colorScheme.accent.replace("text-", "")}/50`
                  }`}
                  onClick={() =>
                    setUiState((prev) => ({ ...prev, isBotProfileOpen: true }))
                  }
                >
                  <AvatarImage
                    src={
                      character.avatar ||
                      character.image ||
                      "/placeholder.svg?height=32&width=32" ||
                      "/placeholder.svg"
                    }
                    className="object-cover"
                    loading="lazy"
                  />
                  <AvatarFallback
                    className={`bg-gradient-to-br ${colorScheme.primary} text-white text-xs`}
                  >
                    {character.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <h2
                  className="font-semibold text-white"
                  style={{
                    fontSize: "var(--chat-name-size)",
                    ...elementStyling,
                  }}
                >
                  {character.name || "Unknown"}
                </h2>
                <p
                  className="text-white/90"
                  style={{
                    fontSize: "var(--chat-timestamp-size)",
                    ...elementStyling,
                  }}
                >
                  {character.creator || "@Unknown"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2"></div>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-white transition-all duration-300 p-2 rounded-full will-change-transform ${
                      hasBackgroundImage
                        ? "hover:bg-white/10 bg-black/10 border border-white/20 hover:border-white/40 backdrop-blur-sm"
                        : `hover:bg-slate-700/70 bg-slate-800/50 hover:${colorScheme.accent} border border-slate-600/30 hover:border-slate-500/50`
                    } shadow-lg hover:shadow-xl`}
                    style={elementStyling}
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-slate-800/95 backdrop-blur-md border-slate-700/50"
                >
                  <DropdownMenuLabel className="text-cyan-400">
                    Chat Settings
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      setUiState((prev) => ({
                        ...prev,
                        isBotProfileOpen: true,
                      }))
                    }
                    className="cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2 text-purple-400" />
                    Bot Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      setUiState((prev) => ({
                        ...prev,
                        isStartNewChatOpen: true,
                      }))
                    }
                    className="cursor-pointer"
                  >
                    <Plus className="w-4 h-4 mr-2 text-blue-400" />
                    Start New Chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto scroll-smooth will-change-scroll chat-messages"
          style={{
            scrollBehavior: settings.enableAnimations ? "smooth" : "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(148, 163, 184, 0.3) transparent",
          }}
        >
          <div
            className={`${settings.compactMode ? "space-y-2" : "space-y-4"} will-change-transform p-4`}
          >
            {/* Character Intro Card */}
            <div className="pb-4">
              <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-slate-700/30 relative">
                {/* Large avatar positioned at the absolute top edge */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
                  <Avatar className="w-20 h-20 ring-4 ring-slate-800 shadow-2xl">
                    <AvatarImage
                      src={
                        character.avatar ||
                        character.image ||
                        "/placeholder.svg?height=80&width=80" ||
                        "/placeholder.svg"
                      }
                      className="object-cover"
                      loading="lazy"
                    />
                    <AvatarFallback
                      className={`bg-gradient-to-br ${colorScheme.primary} text-white text-xl font-bold`}
                    >
                      {character.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Character Info */}
                <div className="pt-16 px-6 pb-4">
                  <div className="mb-8 text-center">
                    <div className="mb-6"></div>
                    <h2 className="text-xs font-medium text-white mb-1">
                      {character.name}
                    </h2>
                    <p className="text-xs text-cyan-400 font-medium">
                      @{character.creator || "Unknown"}
                    </p>
                  </div>

                  {/* Intro Section */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-semibold text-sm">
                        Intro
                      </h3>
                    </div>
                    <div className="text-slate-300 text-xs leading-relaxed">
                      <FormattedText
                        content={
                          character.intro ||
                          character.description ||
                          `Hello! I'm ${character.name}. How are you today?`
                        }
                      />
                    </div>

                    {/* Tags */}
                    {character.tags && character.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {character.tags.slice(0, 4).map((tag: string) => (
                          <span
                            key={tag}
                            className="bg-slate-600/40 text-slate-200 px-3 py-1 rounded-full text-xs border border-slate-500/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="pb-4">
              {messages.map((message, index) => {
                const isUserMessage =
                  message.sender === "You" ||
                  message.sender === currentPersona.name;

                return (
                  <UltraMessageBubble
                    key={message.id}
                    message={message}
                    isUserMessage={isUserMessage}
                    character={character}
                    currentPersona={currentPersona}
                    settings={settings}
                    colorScheme={colorScheme}
                    fontSize={fontSize}
                    fontFamily={fontFamily}
                    lineHeight={lineHeight}
                    editingMessageId={editingMessageId}
                    editingText={editingText}
                    onEditingTextChange={setEditingText}
                    onSaveEdit={saveEdit}
                    onCancelEdit={cancelEdit}
                    onMessageClick={handleMessageClick}
                    onRegenerate={handleRegenerate}
                    handlePreviousVariation={handlePreviousVariation}
                    handleNextVariation={handleNextVariation}
                    virtualIndex={index}
                    onHeightChange={setItemHeight}
                  />
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start space-x-3 mb-4 animate-fadeIn">
                  <Avatar className="w-8 h-8 ring-2 ring-slate-600/30 flex-shrink-0">
                    <AvatarImage
                      src={
                        character.avatar ||
                        character.image ||
                        "/placeholder.svg"
                      }
                      className="object-cover"
                    />
                    <AvatarFallback
                      className={`bg-gradient-to-br ${colorScheme.primary} text-white text-sm font-medium`}
                    >
                      {character.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 max-w-4xl">
                    <div className="bg-slate-700/60 border border-slate-600/30 rounded-2xl rounded-tl-md px-4 py-3 shadow-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                        <span className="text-slate-400 text-sm italic">
                          {character.name} is thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Chat Options Context Menu */}
        {uiState.showChatOptions && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() =>
                setUiState((prev) => ({ ...prev, showChatOptions: false }))
              }
            />

            {/* Square Context Menu */}
            <div className="absolute bottom-16 left-4 z-50 bg-slate-900/95 rounded-lg shadow-2xl border border-slate-700 w-48">
              <div className="p-2">
                {/* Header */}
                <div className="flex items-center justify-between mb-3 px-2 pt-1">
                  <h3 className="text-sm font-medium text-white">Options</h3>
                  <button
                    onClick={() =>
                      setUiState((prev) => ({
                        ...prev,
                        showChatOptions: false,
                      }))
                    }
                    className="w-6 h-6 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
                  >
                    <X className="w-3 h-3 text-slate-300" />
                  </button>
                </div>

                {/* Options List */}
                <div className="space-y-1">
                  {chatOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleChatOptionSelect(option.id)}
                      className="w-full flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700/50 transition-colors text-left"
                    >
                      <div className="w-6 h-6 flex items-center justify-center text-slate-300">
                        {option.icon}
                      </div>
                      <span className="text-sm font-medium text-white">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Input Area */}
        <div className={getInputAreaClasses()}>
          {/* Mode Indicators */}
          {currentChatMode === "free" && (
            <div className="px-3 pt-2 pb-1">
              <div className="text-center"></div>
            </div>
          )}
          {currentChatMode === "roleplay" && (
            <div className="px-3 pt-2 pb-1">
              <div className="text-center">
                <span className="text-xs text-purple-400 bg-slate-800/50 px-2 py-1 rounded-md">
                  🎭 Premium Roleplay • DeepSeek R1
                </span>
              </div>
            </div>
          )}
          {currentChatMode === "storystream" && (
            <div className="px-3 pt-2 pb-1">
              <div className="text-center">
                <span className="text-xs text-amber-400 bg-slate-800/50 px-2 py-1 rounded-md">
                  📚 Ultimate StoryStream • DeepSeek Chat V3
                </span>
              </div>
            </div>
          )}

          {/* Input Row */}
          <div className="p-3">
            <div className="w-full mx-auto max-w-4xl">
              <div
                className={`${
                  hasBackgroundImage
                    ? "bg-slate-700/40 border-slate-600/40"
                    : "bg-slate-700/90 border-slate-600/50"
                } rounded-2xl shadow-lg border flex items-center min-h-[48px] w-full will-change-transform`}
              >
                {/* Plus Icon */}
                <button
                  onClick={handlePlusClick}
                  className={`plus-button flex-shrink-0 w-10 h-10 rounded-full text-slate-300 hover:text-white hover:bg-slate-600/60 flex items-center justify-center ml-2 transition-all duration-200 active:scale-95 will-change-transform ${
                    uiState.showChatOptions ? "text-white bg-slate-600/60" : ""
                  }`}
                  aria-label="Open chat options menu"
                  type="button"
                >
                  <Plus
                    className={`w-5 h-5 transition-transform duration-300 will-change-transform ${uiState.showChatOptions ? "rotate-45" : ""}`}
                  />
                </button>

                {/* Textarea */}
                <div className="flex-1 min-w-0 px-3">
                  <textarea
                    ref={inputRef}
                    defaultValue={inputText}
                    onChange={(e) => {
                      handleInputChange(e.target.value);
                    }}
                    onKeyDown={handleKeyPress}
                    placeholder={`Type your message as ${currentPersona.name}...`}
                    rows={1}
                    className="w-full bg-transparent border-none outline-none py-2 text-white placeholder:text-slate-400 resize-none max-h-[120px] min-h-[32px] will-change-contents"
                    style={{ fontSize: "var(--chat-font-size)" }}
                    autoComplete="off"
                    autoCorrect="on"
                    autoCapitalize="sentences"
                    spellCheck
                  />
                </div>

                {/* Send Icon */}
                <button
                  onClick={handleSend}
                  disabled={false}
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-2 text-emerald-400 hover:text-emerald-300 transform-gpu"
                  aria-label="Send message"
                  type="button"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p
                className="text-xs text-slate-400 text-center mt-2"
                style={elementStyling}
              >
                AI-generated content may be inaccurate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={onImageSelect}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        onChange={onFileSelect}
        className="hidden"
      />

      {/* Context Menu */}
      {contextMenu.isOpen && (
        <div
          ref={contextMenuRef}
          className="absolute z-50 bg-slate-900/95 border border-slate-700 rounded shadow-lg py-0.5 w-[90px] will-change-transform"
          style={{
            left: contextMenu.position.x,
            top: contextMenu.position.y,
            fontSize: "11px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleEditMessage}
            className="w-full px-2 py-1 text-left text-slate-200 hover:bg-slate-700 transition-colors"
            style={{ fontSize: "11px" }}
          >
            Edit
          </button>
          <button
            onClick={handleCopyMessage}
            className="w-full px-2 py-1 text-left text-slate-200 hover:bg-slate-700 transition-colors"
            style={{ fontSize: "11px" }}
          >
            Copy
          </button>
          <button
            onClick={handleDeleteMessage}
            className="w-full px-2 py-1 text-left text-red-400 hover:bg-slate-700 transition-colors"
            style={{ fontSize: "11px" }}
          >
            Delete
          </button>
        </div>
      )}

      {/* Click outside to close context menu */}
      {contextMenu.isOpen && (
        <div className="fixed inset-0 z-40" onClick={closeContextMenu} />
      )}

      {/* Modals / Sheets */}
      <PersonaSheet
        isOpen={uiState.isPersonaEditOpen}
        onClose={() =>
          setUiState((prev) => ({ ...prev, isPersonaEditOpen: false }))
        }
        initialPersonaToEdit={currentPersona}
        onPersonaUpdated={handlePersonaUpdated}
      />

      <PersonaChangeSheet
        isOpen={uiState.isPersonaChangeOpen}
        onClose={() =>
          setUiState((prev) => ({ ...prev, isPersonaChangeOpen: false }))
        }
        onPersonaSelect={handlePersonaSelect}
        onEdit={(persona) => {
          setUiState((prev) => ({
            ...prev,
            isPersonaChangeOpen: false,
            isPersonaEditOpen: true,
          }));
        }}
        onCreate={() => {
          setUiState((prev) => ({
            ...prev,
            isPersonaChangeOpen: false,
            isPersonaCreateOpen: true,
          }));
        }}
      />

      <PersonaCreateSheet
        isOpen={uiState.isPersonaCreateOpen}
        onClose={() =>
          setUiState((prev) => ({ ...prev, isPersonaCreateOpen: false }))
        }
        onPersonaCreated={(persona) => {
          console.log("New persona created:", persona);
          // Handle the created persona
          setUiState((prev) => ({ ...prev, isPersonaCreateOpen: false }));
        }}
      />

      <ModeSelectionSheet
        isOpen={uiState.isModeSelectionOpen}
        onClose={() =>
          setUiState((prev) => ({ ...prev, isModeSelectionOpen: false }))
        }
        onModeSelect={(mode) => {
          setCurrentChatMode(mode);
          localStorage.setItem("currentChatMode", mode);
          setUiState((prev) => ({ ...prev, isModeSelectionOpen: false }));
        }}
      />

      <StartNewChatDialog
        isOpen={uiState.isStartNewChatOpen}
        onClose={() =>
          setUiState((prev) => ({ ...prev, isStartNewChatOpen: false }))
        }
        onDeleteAndStart={handleDeleteAndStart}
        onSaveAndStart={handleSaveAndStart}
        character={character}
      />

      <ChatSettingsSheet
        isOpen={uiState.isChatSettingsOpen}
        onClose={() =>
          setUiState((prev) => ({ ...prev, isChatSettingsOpen: false }))
        }
        onNavigate={handleSettingsNavigation}
      />

      <ChatOptionsModal
        isOpen={uiState.isChatOptionsOpen}
        onClose={() =>
          setUiState((prev) => ({ ...prev, isChatOptionsOpen: false }))
        }
        onOptionSelect={handleChatOptionSelect}
      />
    </div>
  );
}
