"use client";

import { cn } from "@/lib/utils";
import {
  User,
  ImageIcon,
  UserCircle,
  LandmarkIcon as Landscape,
  Settings,
} from "lucide-react";

const SECTIONS = [
  { id: "basic", label: "Basic Information", icon: User },
  { id: "appearance", label: "Appearance", icon: ImageIcon },
  { id: "personality", label: "Personality", icon: UserCircle },
  { id: "scene", label: "Chat Scene", icon: Landscape },
  { id: "advanced", label: "Advanced Settings", icon: Settings },
];

interface CharacterNavigationProps {
  activeSection: string;
  scrollToSection: (section: string) => void;
}

export default function CharacterNavigation({
  activeSection,
  scrollToSection,
}: CharacterNavigationProps) {
  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:block p-4">
        <div className="space-y-1">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "flex items-center w-full px-3 py-2 rounded-md text-sm transition-colors",
                activeSection === section.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground",
              )}
            >
              <section.icon className="h-4 w-4 mr-2" />
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="flex lg:hidden overflow-x-auto p-2 border-b border-border scrollbar-hide bg-background">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className={cn(
              "flex flex-col items-center min-w-[80px] px-3 py-2 rounded-md text-sm transition-colors",
              activeSection === section.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <section.icon className="h-5 w-5 mb-1" />
            {section.label}
          </button>
        ))}
      </div>
    </>
  );
}
