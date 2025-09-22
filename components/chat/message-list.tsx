"use client";

import type React from "react";
import { useRef, useEffect, useCallback } from "react";
import CharacterIntroCard from "./character-intro-card";
import MessageBubble from "./message-bubble";
import type { Message } from "./hooks/use-chat-state";

interface MessageListProps {
  messages: Message[];
  character: any;
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
}

const MessageList = ({
  messages,
  character,
  editingMessageId,
  editingText,
  onEditingTextChange,
  onSaveEdit,
  onCancelEdit,
  onMessageClick,
  onRegenerate,
}: MessageListProps) => {
  const messagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div
      ref={messagesRef}
      className="flex-1 overflow-y-auto px-4 py-6 min-h-0 chat-messages"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <CharacterIntroCard character={character} />

      <div className="space-y-4 max-w-4xl mx-auto">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            character={character}
            isEditing={editingMessageId === message.id}
            editingText={editingText}
            onEditingTextChange={onEditingTextChange}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
            onMessageClick={onMessageClick}
            onRegenerate={onRegenerate}
          />
        ))}
      </div>
    </div>
  );
};

export default MessageList;
