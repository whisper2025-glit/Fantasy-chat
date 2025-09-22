"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, Trophy, Star, Crown } from "lucide-react";
import {
  followCreator,
  unfollowCreator,
  isCreatorFollowed,
  type Creator,
} from "@/lib/personal-storage";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Character } from "@/lib/types";
import { getCharacters } from "@/lib/storage";

interface CreatorInfoPageProps {
  creatorId: string;
  onBack: () => void;
  onCharacterSelect: (character: Character) => void;
}

// Creator data will be fetched from real API/storage
const getCreatorData = (id: string): Creator | null => {
  // Return empty creator data - will be populated from real sources
  return {
    id: id,
    username: id,
    avatar: "/placeholder.svg?height=100&width=100",
    followers: "0",
    messages: "0",
    newCharacters: 0,
    description: "A talented creator.",
    characters: [],
    followedAt: Date.now(),
  };
};

export default function CreatorInfoPage({
  creatorId,
  onBack,
  onCharacterSelect,
}: CreatorInfoPageProps) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [creatorCharacters, setCreatorCharacters] = useState<Character[]>([]);
  const [creatorFavorites, setCreatorFavorites] = useState<Character[]>([]);
  const [activeTab, setActiveTab] = useState("publicBots");

  useEffect(() => {
    const fetchedCreator = getCreatorData(creatorId);
    if (fetchedCreator) {
      setCreator(fetchedCreator);
      setIsFollowing(isCreatorFollowed(creatorId));

      // Filter characters by this creator
      const allCharacters = getCharacters();
      const filtered = allCharacters.filter(
        (char) => char.creator === creatorId,
      );
      setCreatorCharacters(filtered);

      // No mock favorites - will fetch from real API
      setCreatorFavorites([]);
    }
  }, [creatorId]);

  const handleFollowToggle = () => {
    if (!creator) return;

    if (isFollowing) {
      unfollowCreator(creator.id);
      setIsFollowing(false);
    } else {
      followCreator(creator);
      setIsFollowing(true);
    }
  };

  if (!creator) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Creator Not Found</h2>
        <Button
          onClick={onBack}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 bg-card/95 backdrop-blur-xl border-b border-border z-10">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">
            Creator Profile
          </h1>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain creator-scroll-container"
        style={{ height: "calc(100vh - 73px)" }}
      >
        {/* Profile Header */}
        <div className="px-4 py-4">
          {/* Avatar and Basic Info */}
          <div className="flex items-start space-x-4 mb-4">
            <Avatar className="w-20 h-20 ring-4 ring-border">
              <AvatarImage
                src={creator.avatar || "/placeholder.svg?height=80&width=80"}
                alt={creator.username}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xl font-bold">
                {creator.username.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-sm font-bold text-foreground">
                  {creator.username}
                </h1>
                <Trophy className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-muted-foreground text-xs mb-3">
                {creator.description}
              </p>

              {/* Stats */}
              <div className="flex items-center space-x-6 mb-3">
                <div className="text-center">
                  <div className="text-sm font-bold text-foreground">
                    {creator.followers}
                  </div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-foreground">
                    {creator.messages}
                  </div>
                  <div className="text-xs text-muted-foreground">Messages</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-foreground">
                    {creatorCharacters.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Bots</div>
                </div>
              </div>
            </div>
          </div>

          {/* Follow Button */}
          <Button
            onClick={handleFollowToggle}
            className={`w-full mb-4 text-xs ${
              isFollowing
                ? "bg-muted hover:bg-muted/80 text-muted-foreground border border-border"
                : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            }`}
            variant={isFollowing ? "outline" : "default"}
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
        </div>

        {/* Content Tabs */}
        <div className="px-4 pb-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-transparent border-b border-border">
              <TabsTrigger
                value="publicBots"
                className="text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent pb-3 transition-all"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xs font-medium">Public Bots</span>
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center"
                  >
                    {creatorCharacters.length}
                  </Badge>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="favorites"
                className="text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent pb-3 transition-all"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xs font-medium">Favorites</span>
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center"
                  >
                    {creatorFavorites.length}
                  </Badge>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="publicBots" className="mt-4">
              {creatorCharacters.length === 0 ? (
                <EmptyState
                  title="No creations yet."
                  subtitle="This creator hasn't published any characters yet."
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {creatorCharacters.map((bot) => (
                    <BotCard
                      key={bot.id}
                      bot={bot}
                      onCharacterSelect={onCharacterSelect}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites" className="mt-4">
              {creatorFavorites.length === 0 ? (
                <EmptyState
                  title="No favorites yet."
                  subtitle="This creator hasn't favorited any characters yet."
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {creatorFavorites.map((bot) => (
                    <BotCard
                      key={bot.id}
                      bot={bot}
                      onCharacterSelect={onCharacterSelect}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Smooth scrolling for creator info page */
        .creator-scroll-container {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        /* Custom scrollbar for better UX */
        .creator-scroll-container::-webkit-scrollbar {
          width: 4px;
        }

        .creator-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .creator-scroll-container::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 2px;
        }

        .creator-scroll-container::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  onAction?: () => void;
  actionText?: string;
}

function EmptyState({
  title,
  subtitle,
  onAction,
  actionText,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Chat Bubble Illustration */}
      <div className="mb-6 relative">
        {/* Main chat bubble */}
        <div className="w-20 h-16 bg-muted/40 rounded-2xl flex items-center justify-center relative">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full"></div>
            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full"></div>
            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full"></div>
          </div>
        </div>

        {/* Smaller bubble */}
        <div className="absolute -bottom-1 left-6 w-8 h-6 bg-muted/30 rounded-xl flex items-center justify-center">
          <div className="flex space-x-0.5">
            <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
            <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
            <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
          </div>
        </div>

        {/* Dotted trail */}
        <div className="absolute -bottom-4 left-12">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-muted/50 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-muted/40 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-muted/30 rounded-full"></div>
          </div>
        </div>
      </div>

      <h3 className="text-muted-foreground text-sm font-normal mb-3 text-center">
        {title}
      </h3>

      {subtitle && (
        <p className="text-muted-foreground/80 text-xs text-center mb-6 max-w-xs">
          {subtitle}
        </p>
      )}

      {onAction && actionText && (
        <Button
          onClick={onAction}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-xs"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}

interface BotCardProps {
  bot: Character;
  onCharacterSelect: (character: Character) => void;
}

function BotCard({ bot, onCharacterSelect }: BotCardProps) {
  return (
    <div
      className="bg-card/60 backdrop-blur-sm border border-border rounded-xl overflow-hidden hover:bg-card/80 transition-all duration-300 cursor-pointer group shadow-xl hover:shadow-2xl"
      onClick={() => onCharacterSelect(bot)}
    >
      <div className="relative">
        <img
          src={bot.image || "/placeholder.svg"}
          alt={bot.name}
          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-3">
        <h4 className="text-foreground font-semibold text-sm mb-1 group-hover:text-cyan-400 transition-colors">
          {bot.name}
        </h4>
        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 mb-2">
          {bot.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {bot.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              className="text-xs px-2 py-0.5 bg-muted/50 text-muted-foreground border-border hover:bg-muted text-center"
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground/80 font-medium text-xs">
            {bot.creator}
          </span>
          <div className="flex items-center text-yellow-400">
            <Star className="w-3 h-3 mr-1" />
            <span className="font-medium text-xs">
              {bot.likes > 1000
                ? `${(bot.likes / 1000).toFixed(1)}K`
                : bot.likes}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
