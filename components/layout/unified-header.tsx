"use client";

import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, ArrowLeft, Settings, Search } from "lucide-react";

// Default tags if TAGS import fails
const DEFAULT_TAGS = [
  "All",
  "Fantasy",
  "Sci-Fi",
  "Romance",
  "Adventure",
  "Comedy",
  "Drama",
  "Horror",
  "Mystery",
  "Slice of Life",
];

interface UnifiedHeaderProps {
  state?: any;
  updateState?: (updates: any) => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  title?: string;
  showChatSettings?: boolean;
  onChatSettingsClick?: () => void;
  character?: any;
}

const UnifiedHeader = memo(
  ({
    state = {},
    updateState = () => {},
    showBackButton = false,
    onBackClick = null,
    title = "WhisperChat",
    showChatSettings = false,
    onChatSettingsClick = null,
    character = null,
  }: UnifiedHeaderProps) => {
    const [showSearch, setShowSearch] = useState(false);

    // Provide default values for state properties
    const {
      isSidebarOpen = false,
      activeTab = "Discover",
      selectedTag = "All",
      selectedGender = "Gender ALL",
      characterFilter = "Popular",
      isUnfiltered = false,
      searchQuery = "",
    } = state;

    // Get tags with fallback
    let TAGS = DEFAULT_TAGS;
    try {
      const { TAGS: importedTags } = require("@/lib/data");
      if (importedTags && Array.isArray(importedTags)) {
        TAGS = importedTags;
      }
    } catch (error) {
      console.warn("Could not import TAGS from lib/data, using defaults");
    }

    return (
      <div className="bg-card border-b border-border">
        {/* Main Header Row */}
        <div className="flex items-center justify-between px-3 py-2">
          {/* Left Section */}
          <div className="flex items-center space-x-2">
            {showBackButton ? (
              <Button
                onClick={onBackClick}
                variant="ghost"
                size="sm"
                className="p-1 text-foreground hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={() => updateState({ isSidebarOpen: !isSidebarOpen })}
                variant="ghost"
                size="sm"
                className="p-1 text-foreground hover:bg-muted"
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}

            {character && (
              <>
                <Avatar className="w-6 h-6">
                  <AvatarImage
                    src={
                      character.image || "/placeholder.svg?height=32&width=32"
                    }
                  />
                  <AvatarFallback className="bg-muted text-xs text-foreground">
                    {character.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <h2 className="text-xs font-semibold text-foreground">
                    {character.name || "Unknown"}
                  </h2>
                  <p className="text-[10px] text-gray-400">
                    {character.creator || "@Unknown"}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Center Section - Title */}
          <div className="flex-1 text-center">
            <h1 className="text-sm font-semibold text-foreground">{title}</h1>
            {character && (
              <div className="sm:hidden">
                <p className="text-xs text-foreground">
                  {character.name || "Unknown"}
                </p>
                <p className="text-[10px] text-gray-400">
                  {character.creator || "@Unknown"}
                </p>
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-1">
            {!showBackButton && (
              <>
                <Button
                  onClick={() => setShowSearch(!showSearch)}
                  variant="ghost"
                  size="sm"
                  className="p-1 sm:hidden text-foreground hover:bg-muted"
                >
                  <Search className="w-4 h-4" />
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs py-1 px-2">
                  Sign In
                </Button>
              </>
            )}

            {showChatSettings && (
              <Button
                onClick={onChatSettingsClick}
                variant="ghost"
                size="sm"
                className="p-1 text-foreground hover:bg-muted"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Tabs Row */}
        {!showBackButton && (
          <div className="px-3 py-1">
            {/* Tab Navigation with NSFW Toggle */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex space-x-2 flex-1">
                {["Discover", "Memories", "Adventures"].map((tab) => (
                  <Button
                    key={tab}
                    onClick={() => updateState({ activeTab: tab })}
                    variant="ghost"
                    className={`text-sm font-semibold py-0.5 px-2 hover:bg-gray-800 ${
                      activeTab === tab
                        ? "text-blue-500 border-b border-blue-500"
                        : "text-foreground"
                    }`}
                  >
                    {tab}
                  </Button>
                ))}
              </div>

              {/* NSFW Toggle */}
              <div className="flex items-center space-x-1">
                <span className="text-xs text-foreground">NSFW</span>
                <Button
                  onClick={() => updateState({ isUnfiltered: !isUnfiltered })}
                  variant="ghost"
                  size="sm"
                  className={`w-7 h-3 rounded-full p-0 ${isUnfiltered ? "bg-blue-500" : "bg-gray-600"}`}
                >
                  <div
                    className={`w-2.5 h-2.5 bg-background rounded-full transform transition-transform ${
                      isUnfiltered ? "translate-x-1.5" : "translate-x-0"
                    }`}
                  />
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className={`${showSearch ? "block" : "hidden sm:block"}`}>
              <Input
                value={searchQuery}
                onChange={(e) => updateState({ searchQuery: e.target.value })}
                placeholder="Search characters..."
                className="bg-background border-border text-foreground text-xs w-full h-6 mt-1 placeholder-muted-foreground"
              />
            </div>
          </div>
        )}

        {/* Filters Row - Only for Discover tab */}
        {!showBackButton && activeTab === "Discover" && (
          <div className="px-3 py-1">
            <div className="flex gap-2">
              <Select
                value={characterFilter}
                onValueChange={(value) =>
                  updateState({ characterFilter: value })
                }
              >
                <SelectTrigger className="bg-background border-border text-foreground text-xs h-6 w-24 px-3 rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Popular">Popular</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedTag}
                onValueChange={(value) => updateState({ selectedTag: value })}
              >
                <SelectTrigger className="bg-background border-border text-foreground text-xs h-6 w-20 px-3 rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAGS.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedGender}
                onValueChange={(value) =>
                  updateState({ selectedGender: value })
                }
              >
                <SelectTrigger className="bg-background border-border text-foreground text-xs h-6 w-28 px-3 rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gender ALL">All</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Non-Binary">Non-Binary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    );
  },
);

UnifiedHeader.displayName = "UnifiedHeader";
export default UnifiedHeader;
