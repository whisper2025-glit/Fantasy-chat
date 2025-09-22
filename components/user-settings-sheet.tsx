"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { X, Moon, ExternalLink, MessageCircle, Twitter } from "lucide-react";

interface UserSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserSettingsSheet({
  open,
  onOpenChange,
}: UserSettingsSheetProps) {
  const { theme, setTheme } = useTheme();
  const [allowUsersToFollow, setAllowUsersToFollow] = useState(true);

  const isDarkMode = theme === "dark";

  const handleThemeToggle = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  const handleExternalLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-card border-border text-card-foreground p-0 overflow-y-auto"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold text-card-foreground">
              Settings
            </SheetTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </SheetHeader>

        <div className="px-6 py-4 space-y-6">
          {/* Dark Mode Section */}
          <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-xl">
            <div className="flex items-center space-x-3">
              <Moon className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-card-foreground">
                Dark mode
              </span>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={handleThemeToggle}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
            />
          </div>

          {/* Account Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Account
            </h3>
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-xl">
                <span className="text-sm font-medium text-card-foreground">
                  Email
                </span>
                <span className="text-sm text-muted-foreground truncate max-w-[180px]">
                  matiureleeroy200804@gmail.com
                </span>
              </div>

              {/* Current Plan */}
              <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-xl">
                <span className="text-sm font-medium text-card-foreground">
                  Current Plan
                </span>
                <span className="text-sm text-muted-foreground">free</span>
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Privacy
            </h3>
            <div className="space-y-4">
              {/* Allow other users to follow me */}
              <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-xl">
                <span className="text-sm font-medium text-card-foreground">
                  Allow other users to follow me
                </span>
                <Switch
                  checked={allowUsersToFollow}
                  onCheckedChange={setAllowUsersToFollow}
                  className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                />
              </div>
            </div>
          </div>

          {/* Contact Us Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Contact Us
            </h3>
            <div className="space-y-2">
              {/* Discord */}
              <button
                className="flex items-center justify-between w-full py-3 px-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                onClick={() => handleExternalLink("https://discord.gg/joyland")}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-[#5865F2] rounded flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-card-foreground">
                    Discord
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Reddit */}
              <button
                className="flex items-center justify-between w-full py-3 px-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                onClick={() =>
                  handleExternalLink("https://reddit.com/r/joyland")
                }
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-[#FF4500] rounded flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <span className="text-[#FF4500] text-xs font-bold">
                        r
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-card-foreground">
                    Reddit
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* X (Twitter) */}
              <button
                className="flex items-center justify-between w-full py-3 px-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                onClick={() =>
                  handleExternalLink("https://twitter.com/joyland_ai")
                }
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                    <Twitter className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-card-foreground">
                    X
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
