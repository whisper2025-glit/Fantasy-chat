"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles } from "lucide-react";
import FormattedText from "./formatted-text";

interface CharacterIntroCardProps {
  character: any;
}

const CharacterIntroCard = ({ character }: CharacterIntroCardProps) => {
  return (
    <div className="mb-8 flex justify-center">
      <div className="bg-card/90 backdrop-blur-sm rounded-2xl shadow-lg border border-border/50 p-6 mx-auto max-w-md">
        <div className="flex justify-center mb-4">
          <Avatar className="w-12 h-12 ring-2 ring-indigo-100">
            <AvatarImage src={character.image || "/placeholder.svg"} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-primary-foreground font-medium">
              {character.name?.charAt(0) || "C"}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="text-center mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            {character.name}
          </h3>
          <p className="text-xs text-muted-foreground">AI Character</p>
        </div>
        <div className="text-sm text-muted-foreground leading-relaxed">
          <FormattedText content={character.intro} />
        </div>
      </div>
    </div>
  );
};

export default CharacterIntroCard;
