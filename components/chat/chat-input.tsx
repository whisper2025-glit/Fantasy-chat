"use client";

import type React from "react";
import { useRef, useCallback } from "react";
import { Plus, Send } from "lucide-react";

interface ChatInputProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onSend: () => void;
  onPlusClick: () => void;
  onInputFocus: () => void;
  character: any;
}

const ChatInput = ({
  inputText,
  onInputChange,
  onSend,
  onPlusClick,
  onInputFocus,
  character,
}: ChatInputProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();

  const autoResize = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, []);

  const debouncedAutoResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    resizeTimeoutRef.current = setTimeout(autoResize, 16); // ~60fps
  }, [autoResize]);

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, []);

  const handleInputContainerClick = useCallback(
    (e: React.MouseEvent) => {
      if (
        e.target === inputContainerRef.current ||
        e.target === inputRef.current
      ) {
        focusInput();
      }
    },
    [focusInput],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    },
    [onSend],
  );

  const handleSendClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSend();
    },
    [onSend],
  );

  const handlePlusClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onPlusClick();
    },
    [onPlusClick],
  );

  return (
    <div className="flex-shrink-0 p-2 z-20">
      <div className="w-full mx-auto max-w-4xl">
        <div
          ref={inputContainerRef}
          onClick={handleInputContainerClick}
          className="bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-slate-200/60 flex items-center min-h-[52px] w-full"
        >
          {/* Functional Plus Icon - triggers chat options menu */}
          <button
            onClick={handlePlusClick}
            className="flex-shrink-0 w-12 h-12 rounded-full text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80 flex items-center justify-center ml-2 transition-all duration-200 active:scale-95"
            aria-label="Open chat options menu"
            type="button"
          >
            <Plus className="w-6 h-6" />
          </button>

          {/* Textarea */}
          <div className="flex-1 min-w-0 px-3">
            <textarea
              ref={inputRef}
              defaultValue={inputText}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                onInputChange(target.value);
                debouncedAutoResize();
              }}
              onKeyDown={handleKeyDown}
              onFocus={onInputFocus}
              onTouchStart={(e) => e.currentTarget.focus()}
              onTouchEnd={(e) => e.currentTarget.focus()}
              placeholder="Type your message... (Use ![alt](url) for images)"
              rows={1}
              className="mobile-chat-input w-full bg-transparent border-none outline-none py-3 text-base placeholder:text-slate-400 resize-none max-h-[120px] min-h-[46px]"
              autoComplete="off"
              autoCorrect="on"
              autoCapitalize="sentences"
              spellCheck="true"
              inputMode="text"
              enterKeyHint="enter"
              style={{
                WebkitAppearance: "none",
                WebkitUserSelect: "text",
                userSelect: "text",
                WebkitTouchCallout: "default",
                touchAction: "manipulation",
              }}
            />
          </div>

          {/* Send Icon */}
          <button
            onClick={handleSendClick}
            disabled={!inputText.trim()}
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mr-2 transition-all duration-200 active:scale-95 ${
              inputText.trim()
                ? "text-indigo-600 hover:bg-indigo-50/80"
                : "text-slate-300 cursor-not-allowed"
            }`}
            aria-label="Send message"
            type="button"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-400 text-center mt-2">
          AI-generated content may be inaccurate.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
