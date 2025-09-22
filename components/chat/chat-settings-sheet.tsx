"use client";

import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plus,
  Settings,
  User,
  Paintbrush,
  ChevronRight,
} from "lucide-react";

interface ChatSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (settingId: string) => void;
}

export default function ChatSettingsSheet({
  isOpen,
  onClose,
  onNavigate,
}: ChatSettingsSheetProps) {
  const [navigationStack, setNavigationStack] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<string>("main");

  const handleNavigate = (settingId: string) => {
    setNavigationStack([...navigationStack, currentView]);
    setCurrentView(settingId);
    onNavigate(settingId);
  };

  const handleBack = () => {
    if (navigationStack.length > 0) {
      const previousView = navigationStack[navigationStack.length - 1];
      setNavigationStack(navigationStack.slice(0, -1));
      setCurrentView(previousView);
    }
  };

  const handleClose = () => {
    setNavigationStack([]);
    setCurrentView("main");
    onClose();
  };

  const settings = [
    {
      id: "start-new-chat",
      name: "Start New Chat",
      description: "Begin a fresh conversation",
      icon: <Plus className="h-4 w-4 text-cyan-400" />,
    },
    {
      id: "chat-setting",
      name: "Chat Settings",
      description: "Adjust parameters and preferences",
      icon: <Settings className="h-4 w-4 text-cyan-400" />,
    },
    {
      id: "customize-chat",
      name: "Customize Chat",
      description: "Change appearance and behavior",
      icon: <Paintbrush className="h-4 w-4 text-emerald-400" />,
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 bg-card/95 backdrop-blur-md border-l border-border/50 shadow-2xl"
      >
        <div className="flex flex-col h-full">
          <div className="border-b border-border/50 p-3 bg-card/50">
            <div className="flex items-center">
              {navigationStack.length > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 mr-2 text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all duration-300"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 mr-2 text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all duration-300"
                  onClick={handleClose}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <h2 className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Chat Settings
              </h2>
            </div>
            {/* Removed breadcrumb navigation for a cleaner look */}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-3 space-y-2">
              {settings.map((setting) => (
                <Button
                  key={setting.id}
                  variant="ghost"
                  className="w-full justify-start bg-muted/30 hover:bg-muted/50 border border-border/30 h-auto py-3 px-3 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                  onClick={() => handleNavigate(setting.id)}
                >
                  <div className="flex items-start w-full">
                    <div className="mr-3 mt-0.5 p-1 rounded-md bg-muted/50">
                      {setting.icon}
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-sm font-medium text-foreground">
                        {setting.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {setting.description}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-2" />
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t border-border/50 p-3 bg-card/50">
            <p className="text-xs text-muted-foreground text-center">
              Some features may require a premium subscription.
              <br />
              <span className="text-primary hover:text-primary/80 cursor-pointer transition-colors duration-300">
                Upgrade your plan
              </span>{" "}
              for full access.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
