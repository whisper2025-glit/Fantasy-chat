"use client";

import { memo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, ChevronRight, Check, Edit } from "lucide-react";

interface PersonaChangeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onPersonaSelect: (persona: Persona) => void;
  onEdit?: (persona: Persona) => void;
  onCreate?: () => void;
}

interface Persona {
  id: string;
  name: string;
  age: string;
  image?: string;
  likes: string;
  dislikes: string;
  additional: string;
  isDefault: boolean;
}

const PersonaChangeSheet = memo(
  ({
    isOpen,
    onClose,
    onPersonaSelect,
    onEdit,
    onCreate,
  }: PersonaChangeSheetProps) => {
    // No mock personas - will load from storage or API
    const [personas] = useState<Persona[]>([]);

    const handleSelectPersona = (persona: Persona) => {
      onPersonaSelect(persona);
      onClose();
    };

    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent
          side="bottom"
          className="bg-slate-900/95 backdrop-blur-md text-white border-none h-[80vh] overflow-y-auto p-0 shadow-2xl rounded-t-3xl"
        >
          <SheetHeader>
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50 rounded-t-3xl">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-primary hover:text-primary/80 hover:bg-muted/50 transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
              <SheetTitle className="text-foreground text-sm font-semibold">
                Change Persona
              </SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCreate?.()}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-300"
                title="Create New Persona"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </SheetHeader>

          <div className="p-4">
            <div className="space-y-3">
              {personas.map((persona) => (
                <div
                  key={persona.id}
                  className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12 ring-2 ring-cyan-400/30">
                      <AvatarImage src={persona.image || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
                        {persona.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleSelectPersona(persona)}
                    >
                      <div className="flex items-center space-x-2">
                        <h4 className="text-white text-sm font-medium">
                          {persona.name}
                        </h4>
                        <span className="text-slate-400 text-xs">
                          ({persona.age})
                        </span>
                        {persona.isDefault && (
                          <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center shadow-lg shadow-emerald-400/20">
                            <Check className="w-2 h-2 mr-1" />
                            Active
                          </div>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mt-1">
                        Likes: {persona.likes}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">
                        {persona.additional}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(persona);
                        }}
                        className="text-slate-400 hover:text-white hover:bg-slate-600/50 transition-all duration-300 p-2"
                        title="Edit Persona"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  },
);

PersonaChangeSheet.displayName = "PersonaChangeSheet";
export default PersonaChangeSheet;
