"use client";

import type React from "react";
import { memo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import LazyImage from "@/components/ui/lazy-image";
import FormattedText from "../chat/formatted-text";

interface CharacterCardProps {
  character: any;
  setSelectedCharacter: (character: any) => void;
}

const CharacterCard = memo(
  ({ character, setSelectedCharacter }: CharacterCardProps) => {
    const [isFavorited, setIsFavorited] = useState(false);

    // Check if character is favorited on mount
    useEffect(() => {
      const favoritedCharacters = JSON.parse(
        localStorage.getItem("favoritedCharacters") || "[]",
      );
      setIsFavorited(
        favoritedCharacters.some((fav: any) => fav.id === character.id),
      );
    }, [character.id]);

    const handleFavoriteClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click

      const favoritedCharacters = JSON.parse(
        localStorage.getItem("favoritedCharacters") || "[]",
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
        setIsFavorited(false);
      } else {
        // Add to favorites
        const updatedFavorites = [...favoritedCharacters, character];
        localStorage.setItem(
          "favoritedCharacters",
          JSON.stringify(updatedFavorites),
        );
        setIsFavorited(true);
      }

      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent("favoritesChanged"));
    };

    return (
      <Card
        onClick={() => setSelectedCharacter(character)}
        className="bg-card/60 backdrop-blur-sm border border-border overflow-hidden hover:bg-card/80 transition-all duration-300 cursor-pointer group shadow-xl hover:shadow-2xl hover:shadow-primary/10 hover:border-border"
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
            onClick={handleFavoriteClick}
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
            <h3 className="text-white font-semibold text-sm leading-tight group-hover:text-cyan-400 transition-colors">
              {character.name}
            </h3>
          </div>
          <div className="text-slate-300 text-xs mb-4 leading-relaxed line-clamp-2">
            <FormattedText content={character.description} />
          </div>
          <div className="grid grid-cols-2 gap-1 mb-2">
            {character.tags.slice(0, 4).map((tag: string) => (
              <Badge
                key={tag}
                className="text-xs px-2 py-0.5 border cursor-pointer hover:scale-105 transition-all duration-200 bg-slate-700/50 text-slate-300 border-slate-600/50 hover:bg-slate-600/50 hover:text-white text-center truncate"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              {character.creator}
            </span>
            <div className="flex items-center text-white">
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
  },
);

CharacterCard.displayName = "CharacterCard";
export default CharacterCard;

// Add CSS for line-clamp
const styles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

// Inject styles if not already present
if (
  typeof document !== "undefined" &&
  !document.querySelector("#character-card-styles")
) {
  const styleElement = document.createElement("style");
  styleElement.id = "character-card-styles";
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
