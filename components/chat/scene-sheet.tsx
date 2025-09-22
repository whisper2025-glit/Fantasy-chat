"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ChevronRight, MapPin, Check, Plus } from "lucide-react";

interface Scene {
  id: string;
  name: string;
  description: string;
  mood: string;
  setting: string;
  imageUrl?: string;
}

interface SceneSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSceneSelect: (scene: Scene | null) => void;
  currentScene: Scene | null;
}

export default function SceneSheet({
  isOpen,
  onClose,
  onSceneSelect,
  currentScene,
}: SceneSheetProps) {
  const scenes: Scene[] = [
    {
      id: "none",
      name: "No Scene",
      description: "Default conversation without specific setting",
      mood: "neutral",
      setting: "general",
    },
    {
      id: "cafe",
      name: "Cozy Café",
      description: "A warm, intimate coffee shop atmosphere",
      mood: "relaxed",
      setting: "indoor",
    },
    {
      id: "library",
      name: "Quiet Library",
      description: "Peaceful study environment with books",
      mood: "focused",
      setting: "indoor",
    },
    {
      id: "park",
      name: "Sunny Park",
      description: "Beautiful outdoor setting with nature",
      mood: "cheerful",
      setting: "outdoor",
    },
    {
      id: "beach",
      name: "Sunset Beach",
      description: "Romantic beachside with ocean waves",
      mood: "romantic",
      setting: "outdoor",
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl p-0 bg-card/95 backdrop-blur-md border-l border-border/50 shadow-2xl overflow-y-auto"
      >
        <SheetHeader className="border-b border-border/50 p-6 bg-card/50">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 mr-2 text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all duration-300"
              onClick={onClose}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30">
              <MapPin className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <SheetTitle className="text-foreground text-lg">
                Scene Selection
              </SheetTitle>
              <p className="text-muted-foreground text-sm">
                Choose a setting for your conversation
              </p>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            <span className="opacity-60 text-muted-foreground">Settings</span>
            <ChevronRight className="h-3 w-3 inline mx-1" />
            <span>Scene Selection</span>
          </div>
        </SheetHeader>

        <div className="p-6 space-y-4">
          {scenes.map((scene) => (
            <Card
              key={scene.id}
              className={`cursor-pointer transition-all duration-300 ${
                currentScene?.id === scene.id
                  ? "bg-green-600/20 border-green-500/50 ring-1 ring-green-500/30"
                  : "bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50"
              }`}
              onClick={() => onSceneSelect(scene.id === "none" ? null : scene)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-white font-medium">{scene.name}</h3>
                      {currentScene?.id === scene.id && (
                        <div className="p-1 rounded-full bg-green-500">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed mb-3">
                      {scene.description}
                    </p>
                    <div className="flex space-x-2">
                      <Badge className="bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs">
                        {scene.mood}
                      </Badge>
                      <Badge className="bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs">
                        {scene.setting}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-slate-700/20 border-slate-600/30 border-dashed">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2 text-slate-400">
                <Plus className="h-4 w-4" />
                <span className="text-sm">Create Custom Scene</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
