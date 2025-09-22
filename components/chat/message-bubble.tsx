"use client";

import type React from "react";
import { useState, useCallback, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import MessageContextMenu from "./message-context-menu";
import FormattedText from "./formatted-text";
import RegenerateButton from "./regenerate-button";
import type { Message } from "./hooks/use-chat-state";
import { parseAndLinkifyText } from "@/lib/utils";
import {
  getChatSettings,
  COLOR_SCHEMES,
  type ChatSettings,
} from "@/lib/chat-settings-storage";

interface MessageBubbleProps {
  message: Message;
  character: any;
  isEditing: boolean;
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
}

const MessageBubble = ({
  message,
  character,
  isEditing,
  editingText,
  onEditingTextChange,
  onSaveEdit,
  onCancelEdit,
  onMessageClick,
  onRegenerate,
}: MessageBubbleProps) => {
  const isUserMessage = message.isUserMessage;
  const senderName = isUserMessage ? "You" : character?.nickname || "Character";
  const senderAvatar = isUserMessage
    ? "/placeholder.svg"
    : character?.image || "/placeholder.svg";

  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [chatSettings, setChatSettings] =
    useState<ChatSettings>(getChatSettings);

  // Listen for settings changes
  useEffect(() => {
    const handleSettingsUpdate = (event: CustomEvent<ChatSettings>) => {
      setChatSettings(event.detail);
    };

    window.addEventListener("chatSettingsUpdated" as any, handleSettingsUpdate);
    return () =>
      window.removeEventListener(
        "chatSettingsUpdated" as any,
        handleSettingsUpdate,
      );
  }, []);

  // Get current color scheme
  const colorScheme =
    COLOR_SCHEMES[chatSettings.colorScheme] || COLOR_SCHEMES.default;

  const handleContextMenuOpenChange = useCallback((open: boolean) => {
    setIsContextMenuOpen(open);
  }, []);

  return (
    <div
      className={`flex items-start gap-3 ${isUserMessage ? "justify-end" : "justify-start"}`}
      onClick={(e) => onMessageClick(e, message.id, isUserMessage)}
    >
      {!isUserMessage && (
        <Avatar className="h-8 w-8 border">
          <AvatarImage
            src={senderAvatar || "/placeholder.svg"}
            alt={senderName}
          />
          <AvatarFallback>{senderName[0]}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={`flex flex-col gap-1 ${isUserMessage ? "items-end" : "items-start"} max-w-[70%] md:max-w-[60%]`}
      >
        <span className="text-xs font-semibold text-slate-500">
          {senderName}
        </span>
        <MessageContextMenu
          message={message}
          isUserMessage={isUserMessage}
          onOpenChange={handleContextMenuOpenChange}
        >
          <div
            className={`relative rounded-2xl px-4 py-3 shadow-lg max-w-full ${
              isUserMessage
                ? `${colorScheme.userMessage} rounded-br-md`
                : `${colorScheme.aiMessage} rounded-bl-md`
            }`}
          >
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <Textarea
                  value={editingText}
                  onChange={(e) => onEditingTextChange(e.target.value)}
                  className="min-h-[60px] bg-background border-border text-foreground"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={onCancelEdit}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={onSaveEdit}>
                    <Check className="h-4 w-4 mr-1" /> Save
                  </Button>
                </div>
              </div>
            ) : (
              <FormattedText
                content={message.content}
                isUserMessage={isUserMessage}
                className="min-h-[1.5rem]"
              />
            )}
          </div>
        </MessageContextMenu>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500 mt-1">
            {message.timestamp}
          </span>
          {!isUserMessage && onRegenerate && (
            <RegenerateButton
              onRegenerate={() => onRegenerate(message.id)}
              className="self-start"
            />
          )}
        </div>
      </div>
      {isUserMessage && (
        <Avatar className="h-8 w-8 border">
          <AvatarImage
            src={senderAvatar || "/placeholder.svg"}
            alt={senderName}
          />
          <AvatarFallback>{senderName[0]}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubble;
