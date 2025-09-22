"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Menu, MoreVertical, Search, Trash2 } from "lucide-react";
import {
  getRecentChats,
  deleteRecentChat,
  formatTimestamp,
  type RecentChat,
} from "@/lib/recent-chats-storage";

interface RecentChatsProps {
  onBack: () => void;
  onChatSelect: (chat: RecentChat) => void;
}

export default function RecentChats({
  onBack,
  onChatSelect,
}: RecentChatsProps) {
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    chatId: string;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    chatId: "",
  });

  // Load recent chats on mount
  useEffect(() => {
    const loadRecentChats = () => {
      const chats = getRecentChats();
      setRecentChats(chats);
    };

    loadRecentChats();

    // Listen for updates
    const handleStorageChange = () => {
      loadRecentChats();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("recentChatsUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("recentChatsUpdated", handleStorageChange);
    };
  }, []);

  // Filter chats based on search query
  const filteredChats = recentChats.filter((chat) =>
    chat.character.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleChatClick = (chat: RecentChat) => {
    onChatSelect(chat);
  };

  const handleContextMenu = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      isOpen: true,
      position: { x: rect.right - 120, y: rect.top },
      chatId,
    });
  };

  const handleDeleteChat = () => {
    if (contextMenu.chatId) {
      deleteRecentChat(contextMenu.chatId);
      setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, chatId: "" });
    }
  };

  const closeContextMenu = () => {
    setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, chatId: "" });
  };

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.isOpen) {
        closeContextMenu();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [contextMenu.isOpen]);

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-sm px-4 py-4 z-30 shadow-xl border-b border-border">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-sm font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Recent Chats
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-10 bg-muted/50 border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary/20 text-xs"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 pt-32 px-4 pb-4 overflow-y-auto scrollbar-hide">
        {filteredChats.length > 0 ? (
          <div className="space-y-3">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat)}
                className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-4 hover:bg-card/70 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-primary/10 group relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="relative">
                      <Avatar className="w-14 h-14 ring-2 ring-cyan-400/30">
                        <AvatarImage
                          src={
                            chat.character.avatar ||
                            chat.character.image ||
                            "/placeholder.svg"
                          }
                          alt={chat.character.name}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-cyan-400 to-blue-500 text-primary-foreground font-semibold text-xs">
                          {chat.character.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {chat.isUnread && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-foreground font-medium text-xs leading-tight group-hover:text-primary transition-colors truncate">
                          {chat.character.name}
                        </h3>
                        <span className="text-muted-foreground text-xs whitespace-nowrap ml-2">
                          {formatTimestamp(chat.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs truncate">
                        {chat.lastMessage}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-muted-foreground/70 text-xs">
                          {chat.messageCount} messages
                        </span>
                        {chat.isUnread && (
                          <div className="bg-emerald-400 text-background text-xs px-2 py-0.5 rounded-full font-medium">
                            New
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleContextMenu(e, chat.character.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-2 ml-2"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-xs">
              {searchQuery ? (
                <>
                  <p>No chats found for "{searchQuery}"</p>
                  <p className="mt-2">Try a different search term</p>
                </>
              ) : (
                <>
                  <p>No recent chats found</p>
                  <p className="mt-2">
                    Start a conversation with a character to see them here
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu.isOpen && (
        <div
          className="fixed bg-popover/95 backdrop-blur-md border border-border rounded-md shadow-2xl z-50 py-1 min-w-[120px]"
          style={{
            left: contextMenu.position.x,
            top: contextMenu.position.y,
          }}
        >
          <button
            onClick={handleDeleteChat}
            className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/20 hover:text-red-300 flex items-center space-x-2 transition-all duration-300"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
