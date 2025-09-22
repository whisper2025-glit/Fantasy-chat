"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, Users, Star, Heart, MessageSquare } from "lucide-react";
import type { Character } from "@/lib/types";
import {
  getFollowingCreators,
  getFavoritedCharacters,
  getLikedCharacters,
  type Creator,
  type FavoritedCharacter,
  type LikedCharacter,
} from "@/lib/personal-storage";
import CharacterCard from "@/components/character/character-card";

interface PersonalPageProps {
  onBack: () => void;
  onCharacterSelect: (character: Character) => void;
  onCreatorSelect?: (creatorId: string) => void;
}

export default function PersonalPage({
  onBack,
  onCharacterSelect,
  onCreatorSelect,
}: PersonalPageProps) {
  const [activeTab, setActiveTab] = useState("Following");

  // Real-time data states
  const [followingCreators, setFollowingCreators] = useState<Creator[]>([]);
  const [favoritedCharacters, setFavoritedCharacters] = useState<
    FavoritedCharacter[]
  >([]);
  const [likedCharacters, setLikedCharacters] = useState<LikedCharacter[]>([]);

  // Load initial data and set up real-time listeners
  useEffect(() => {
    // No sample data initialization needed

    const loadData = () => {
      setFollowingCreators(getFollowingCreators());
      setFavoritedCharacters(getFavoritedCharacters());
      setLikedCharacters(getLikedCharacters());
    };

    // Load initial data
    loadData();

    // Set up event listeners for real-time updates
    const handleFollowingUpdate = () =>
      setFollowingCreators(getFollowingCreators());
    const handleFavoritesUpdate = () => {
      setFavoritedCharacters(getFavoritedCharacters());
    };
    const handleLikesUpdate = () => {
      setLikedCharacters(getLikedCharacters());
    };

    window.addEventListener("followingUpdated", handleFollowingUpdate);
    window.addEventListener("favoritesChanged", handleFavoritesUpdate);
    window.addEventListener("likesUpdated", handleLikesUpdate);

    return () => {
      window.removeEventListener("followingUpdated", handleFollowingUpdate);
      window.removeEventListener("favoritesChanged", handleFavoritesUpdate);
      window.removeEventListener("likesUpdated", handleLikesUpdate);
    };
  }, []);

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-8">
        <div className="w-64 h-64 flex items-center justify-center opacity-60">
          <div className="text-6xl">🐻</div>
        </div>
      </div>
      <h3 className="text-muted-foreground text-lg font-semibold mb-2">
        Nothing here yet!
      </h3>
      <p className="text-muted-foreground/70 text-sm">
        Start exploring to see content here.
      </p>
    </div>
  );

  const renderFollowing = () => {
    if (followingCreators.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-6">
        {followingCreators.map((creator) => (
          <Card
            key={creator.id}
            className="bg-card/60 backdrop-blur-sm border border-border/50 p-6 shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-16 h-16 ring-2 ring-cyan-400/30 shadow-lg">
                    <AvatarImage src={creator.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold">
                      {creator.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {creator.badge && (
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                      {creator.badge === "RISING STAR CREATOR" ? "⭐" : "👑"}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold text-xs">
                    {creator.username.length > 15
                      ? creator.username.substring(0, 15) + "..."
                      : creator.username}
                  </h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1 text-cyan-400" />
                      <span className="text-cyan-400 text-xs font-medium">
                        {creator.followers}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="w-3 h-3 mr-1 text-pink-400" />
                      <span className="text-pink-400 text-xs font-medium">
                        {creator.messages}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs mt-1">
                    {creator.newCharacters} New
                  </p>
                </div>
              </div>
              <button
                onClick={() => onCreatorSelect?.(creator.id)}
                className="text-muted-foreground hover:text-foreground text-xs font-medium px-3 py-1.5 hover:bg-muted/50 rounded-lg transition-all duration-200"
              >
                View
              </button>
            </div>

            <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
              {creator.description.length > 80
                ? creator.description.substring(0, 80) + "..."
                : creator.description}
            </p>

            <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
              {creator.characters.map((char) => (
                <div
                  key={char.id}
                  className="flex-shrink-0 w-36 cursor-pointer hover:opacity-80 transition-all duration-200"
                  onClick={() => {
                    // Create a Character object from the creator character data
                    const characterForSelect: Character = {
                      id: char.id,
                      name: char.title || "Unknown Character",
                      description: char.subtitle || "No description available",
                      image: char.image,
                      tags: ["Featured"],
                      creator: char.creator || "Unknown Creator",
                      likes: 0,
                      gender: "unknown",
                      createdAt: Date.now(),
                      personality: "",
                      scenario: "",
                      intro: "",
                      messages: [],
                      age: "",
                      rating: "SFW",
                      greeting: "",
                      appearance: "",
                      visibility: "public",
                      publicDefinition: "",
                      race: "",
                      charClass: "",
                      location: "",
                      item: "",
                      customTokens: {},
                      avatar: char.image,
                      sceneCard: null,
                      sceneImage: "",
                      sceneDisplayMode: "cover",
                    };
                    onCharacterSelect(characterForSelect);
                  }}
                >
                  <div className="relative mb-3">
                    <img
                      src={char.image || "/placeholder.svg"}
                      alt={char.title}
                      className="w-full h-44 object-cover rounded-xl shadow-lg"
                    />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                      {char.creator}
                    </div>
                  </div>
                  <h4 className="text-white text-xs font-semibold leading-tight mb-1">
                    {char.title && char.title.length > 12
                      ? char.title.substring(0, 12) + "..."
                      : char.title}
                  </h4>
                  <p className="text-muted-foreground text-xs leading-tight">
                    {char.subtitle && char.subtitle.length > 20
                      ? char.subtitle.substring(0, 20) + "..."
                      : char.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderCollection = () => {
    const hasCharacters = favoritedCharacters.length > 0;

    if (!hasCharacters) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-8">
        {/* Favorited Characters Section */}
        {hasCharacters && (
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-400" />
              Favorited Characters
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {favoritedCharacters.map((item) => {
                // Map FavoritedCharacter to Character type for CharacterCard
                const characterForCard: Character = {
                  id: item.id,
                  name: item.title || "Unknown Character",
                  description: item.subtitle || "No description available",
                  image: item.image,
                  tags: item.tags || [],
                  creator: item.creator || "Unknown Creator",
                  likes: Number.parseInt(item.messageCount) || 0,
                  gender: "unknown",
                  createdAt: item.favoritedAt,
                  personality: "",
                  scenario: "",
                  intro: "",
                  messages: [],
                  age: "",
                  rating: "SFW",
                  greeting: "",
                  appearance: "",
                  visibility: "public",
                  publicDefinition: "",
                  race: "",
                  charClass: "",
                  location: "",
                  item: "",
                  customTokens: {},
                  avatar: item.image,
                  sceneCard: null,
                  sceneImage: "",
                  sceneDisplayMode: "cover",
                };
                return (
                  <CharacterCard
                    key={item.id}
                    character={characterForCard}
                    setSelectedCharacter={onCharacterSelect}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLikes = () => {
    const hasCharacters = likedCharacters.length > 0;

    if (!hasCharacters) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-8">
        {/* Liked Characters Section */}
        {hasCharacters && (
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-pink-400" />
              Liked Characters
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {likedCharacters.map((item) => {
                // Map LikedCharacter to Character type for CharacterCard
                const characterForCard: Character = {
                  id: item.id,
                  name: item.title || "Unknown Character",
                  description: item.subtitle || "No description available",
                  image: item.image,
                  tags: item.tags || [],
                  creator: item.creator || "Unknown Creator",
                  likes: Number.parseInt(item.messageCount) || 0,
                  gender: "unknown",
                  createdAt: item.likedAt,
                  personality: "",
                  scenario: "",
                  intro: "",
                  messages: [],
                  age: "",
                  rating: "SFW",
                  greeting: "",
                  appearance: "",
                  visibility: "public",
                  publicDefinition: "",
                  race: "",
                  charClass: "",
                  location: "",
                  item: "",
                  customTokens: {},
                  avatar: item.image,
                  sceneCard: null,
                  sceneImage: "",
                  sceneDisplayMode: "cover",
                };
                return (
                  <CharacterCard
                    key={item.id}
                    character={characterForCard}
                    setSelectedCharacter={onCharacterSelect}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Enhanced Header */}
      <div className="fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-xl px-4 py-4 z-30 shadow-2xl border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground transition-all duration-200 p-2 hover:bg-muted/50 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Personal
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 ring-2 ring-cyan-400/30 shadow-lg">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold">
                U
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 backdrop-blur-sm border border-border/50 h-10 shadow-lg">
            <TabsTrigger
              value="Following"
              className="flex items-center space-x-2 text-sm data-[state=active]:bg-muted data-[state=active]:text-foreground h-8 font-medium transition-all duration-200"
            >
              <Users className="w-4 h-4" />
              <span>Following</span>
            </TabsTrigger>
            <TabsTrigger
              value="Collection"
              className="flex items-center space-x-2 text-sm data-[state=active]:bg-muted data-[state=active]:text-foreground h-8 font-medium transition-all duration-200"
            >
              <Star className="w-4 h-4" />
              <span>Collection</span>
            </TabsTrigger>
            <TabsTrigger
              value="Likes"
              className="flex items-center space-x-2 text-sm data-[state=active]:bg-muted data-[state=active]:text-foreground h-8 font-medium transition-all duration-200"
            >
              <Heart className="w-4 h-4" />
              <span>Likes</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 pt-32 px-4 pb-4 overflow-y-auto scrollbar-hide">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="Following" className="mt-0">
            {renderFollowing()}
          </TabsContent>
          <TabsContent value="Collection" className="mt-0">
            {renderCollection()}
          </TabsContent>
          <TabsContent value="Likes" className="mt-0">
            {renderLikes()}
          </TabsContent>
        </Tabs>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
