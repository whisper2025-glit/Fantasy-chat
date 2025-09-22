"use client";

import type React from "react";

import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card"; // Import CardContent
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lock, MessageCircle, Ellipsis, WavesIcon as Wave } from "lucide-react";
import type { SavedMemory } from "@/lib/memory-storage";
import { getMemoryStats } from "@/lib/memory-storage"; // Corrected import

interface DetailedMemoryCardProps {
  memory: SavedMemory;
  formatDate: (timestamp: number) => string;
  onSetAccess: (memoryId: string) => void;
  onLoadMemory: (memoryId: string) => void;
  onTitleChange: (memoryId: string, newTitle: string) => void;
}

export default function DetailedMemoryCard({
  memory,
  formatDate,
  onSetAccess,
  onLoadMemory,
  onTitleChange,
}: DetailedMemoryCardProps) {
  const [title, setTitle] = useState(memory.title);

  const handleTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    onTitleChange(memory.id, e.target.value);
  };

  // Default data for second character and stats - will be replaced with real data
  const defaultSecondCharacter = {
    name: "Unknown",
    avatar: "/placeholder.svg?height=32&width=32",
  };
  const defaultInteractions = 0;
  const defaultViews = 0;

  return (
    <Card className="bg-slate-800/70 border border-slate-700/50 shadow-lg rounded-xl p-6 space-y-6">
      <CardContent className="p-0">
        {" "}
        {/* Wrap content in CardContent */}
        {/* Title and Options */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Input
              value={title}
              onChange={handleTitleInputChange}
              placeholder="You can give a title to this memory"
              className="bg-transparent border-none text-white text-sm font-semibold p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white"
          >
            <Ellipsis className="h-5 w-5" />
          </Button>
        </div>
        {/* Character Info and Stats */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-center">
              <Avatar className="w-12 h-12 ring-2 ring-cyan-400/30">
                <AvatarImage
                  src={memory.characterAvatar || "/placeholder.svg"}
                />
                <AvatarFallback className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-sm">
                  {memory.characterName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p className="text-white text-xs mt-2">
                {memory.characterName} | Shortstack
              </p>
            </div>
            <Wave className="h-6 w-6 text-slate-500" />
            <div className="flex flex-col items-center">
              <Avatar className="w-12 h-12 ring-2 ring-purple-400/30">
                <AvatarImage
                  src={defaultSecondCharacter.avatar || "/placeholder.svg"}
                />
                <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-500 text-white text-sm">
                  {defaultSecondCharacter.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p className="text-white text-xs mt-2">
                {defaultSecondCharacter.name}
              </p>
            </div>
          </div>
          <div className="flex justify-around w-full max-w-md text-slate-400 text-xs">
            <div className="flex flex-col items-center">
              <span className="text-white text-sm font-bold">
                {defaultInteractions}
              </span>
              <span>Interactions</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white text-sm font-bold">
                {getMemoryStats().total}
              </span>
              <span>Total Memories</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white text-sm font-bold">
                {defaultViews}
              </span>
              <span>Views</span>
            </div>
          </div>
        </div>
        {/* Message Content Preview */}
        <div className="relative bg-gradient-to-br from-purple-800/30 to-pink-800/30 border border-purple-700/50 rounded-xl p-4 text-white text-xs leading-relaxed overflow-hidden">
          {memory.isPrivate && (
            <Badge className="absolute top-3 left-3 bg-purple-600/50 text-purple-200 border border-purple-500/50 text-xs px-2 py-1 rounded-full">
              <Lock className="h-3 w-3 mr-1" /> Private
            </Badge>
          )}
          <p className="line-clamp-4 mt-6">{memory.content.split("\n\n")[0]}</p>{" "}
          {/* Show first message as preview */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-800/70 to-transparent rounded-b-xl" />
        </div>
        {/* Metadata and Buttons */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <MessageCircle className="h-3 w-3" />
              <span>Last talk: {formatDate(memory.createdAt)}</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>{memory.messageCount} Messages &gt;&gt;</span>
            </span>
          </div>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => onSetAccess(memory.id)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full py-2 text-sm"
            >
              Set Access
            </Button>
            <Button
              onClick={() => onLoadMemory(memory.id)}
              className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white rounded-full py-2 text-sm"
            >
              Load Memory
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
