"use client";
import { useState, useEffect } from "react";
import type React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Menu, Star } from "lucide-react";
import LazyImage from "@/components/ui/lazy-image";
import FormattedText from "./chat/formatted-text";
import type { Character } from "@/lib/types";

interface ExplorePageProps {
  onBack: () => void;
  onCharacterSelect: (character: Character) => void;
}

// No sample explore categories - will load from real data sources
const exploreCategories: any[] = [];

export default function ExplorePage({
  onBack,
  onCharacterSelect,
}: ExplorePageProps) {
  const [favoritedCharacters, setFavoritedCharacters] = useState<string[]>([]);

  // Load favorited characters on mount
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const stored = localStorage.getItem("favoritedCharacters");
        const favorites = stored ? JSON.parse(stored) : [];
        setFavoritedCharacters(favorites.map((fav: any) => fav.id));
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    };

    loadFavorites();

    // Listen for favorites changes from other components
    const handleFavoritesChange = () => {
      loadFavorites();
    };

    window.addEventListener("favoritesChanged", handleFavoritesChange);
    return () =>
      window.removeEventListener("favoritesChanged", handleFavoritesChange);
  }, []);

  const handleCharacterClick = (character: Character) => {
    onCharacterSelect(character);
  };

  const handleFavoriteClick = (e: React.MouseEvent, character: Character) => {
    e.stopPropagation(); // Prevent card click

    try {
      const stored = localStorage.getItem("favoritedCharacters");
      const favoritedCharacters = stored ? JSON.parse(stored) : [];
      const isFavorited = favoritedCharacters.some(
        (fav: any) => fav.id === character.id,
      );

      if (isFavorited) {
        // Remove from favorites
        const updatedFavorites = favoritedCharacters.filter(
          (fav: any) => fav.id !== character.id,
        );
        localStorage.setItem(
          "favoritedCharacters",
          JSON.stringify(updatedFavorites),
        );
        setFavoritedCharacters((prev) =>
          prev.filter((id) => id !== character.id),
        );
      } else {
        // Add to favorites
        const updatedFavorites = [...favoritedCharacters, character];
        localStorage.setItem(
          "favoritedCharacters",
          JSON.stringify(updatedFavorites),
        );
        setFavoritedCharacters((prev) => [...prev, character.id]);
      }

      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent("favoritesChanged"));
    } catch (error) {
      console.error("Error handling favorite:", error);
    }
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-sm px-4 py-4 z-30 shadow-xl border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-slate-300 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-sm font-semibold text-white">Explore</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8 ring-2 ring-cyan-400/30">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white">
                U
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pt-20 pb-4 px-4 overflow-y-auto scrollbar-hide">
        {exploreCategories.map((category) => (
          <div key={category.id} className="mb-8">
            {/* Category Header */}
            <div className="px-4 mb-4">
              <h2 className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">
                {category.title}
              </h2>
              {category.description && (
                <p className="text-slate-400 text-xs leading-relaxed">
                  {category.description}
                </p>
              )}
            </div>

            {/* Character Cards Grid - Same as Home Page */}
            <div className="px-4">
              {/* Character Cards - Horizontal Scrollable */}
              <div className="relative">
                <div className="flex space-x-4 overflow-x-auto scrollbar-hide px-4 pb-2">
                  {category.characters.map((character) => {
                    const isFavorited = favoritedCharacters.includes(
                      character.id,
                    );

                    return (
                      <Card
                        key={character.id}
                        className="flex-shrink-0 w-44 bg-card/60 backdrop-blur-sm border border-border overflow-hidden hover:bg-card/80 transition-all duration-300 cursor-pointer group shadow-xl hover:shadow-2xl hover:shadow-primary/10 hover:border-border"
                        onClick={() => handleCharacterClick(character)}
                      >
                        <div className="relative">
                          <LazyImage
                            src={character.image || "/placeholder.svg"}
                            alt={character.name}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            placeholder="/placeholder.svg"
                            fallback="/placeholder.svg"
                          />

                          {/* Interactive Star Button */}
                          <button
                            onClick={(e) => handleFavoriteClick(e, character)}
                            className="absolute top-3 right-3 transition-all duration-300 p-1 rounded-full hover:bg-black/20 backdrop-blur-sm"
                          >
                            <Star
                              className={`w-5 h-5 transition-all duration-300 hover:scale-110 drop-shadow-lg ${
                                isFavorited
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-white/80 hover:text-yellow-400"
                              }`}
                            />
                          </button>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-foreground font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                              {character.name}
                            </h3>
                          </div>
                          <div className="text-muted-foreground text-xs mb-4 leading-relaxed line-clamp-2">
                            <FormattedText content={character.description} />
                          </div>
                          <div className="grid grid-cols-2 gap-1 mb-2">
                            {character.tags.slice(0, 4).map((tag, index) => (
                              <Badge
                                key={`${tag}-${index}`}
                                className="text-xs px-2 py-0.5 border cursor-pointer hover:scale-105 transition-all duration-200 bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground text-center truncate"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-medium">
                              {character.creator}
                            </span>
                            <div className="flex items-center text-foreground">
                              <Star className="w-3 h-3 mr-1.5 text-yellow-400" />
                              <span className="font-medium">
                                {character.likes > 1000
                                  ? `${(character.likes / 1000).toFixed(1)}K`
                                  : character.likes}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
