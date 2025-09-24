"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Sidebar Component
const Sidebar = memo(
  ({
    isOpen,
    toggleSidebar,
    setActiveTab,
    activeTab,
    setSelectedCharacter,
  }) => {
    const items = ["Discover", "Recent Chats", "Create", "Adventure", "Sign Out"];

    return (
      <div
        className={`fixed top-0 left-0 w-4/5 h-full bg-card p-3 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 z-50 overflow-auto shadow-lg border-r border-border`}
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            {/* WhisperChat Logo with decorative dots */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              {/* Simple blue gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg"></div>

              {/* Icon container */}
              <div className="relative z-10 flex items-center justify-center w-full h-full">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-black"
                  fill="currentColor"
                >
                  {/* Smiley face icon */}
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </div>

              {/* Decorative dots outside the logo */}
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-70"></div>
              <div className="absolute -bottom-0.5 -left-0.5 w-1 h-1 bg-blue-400 rounded-full opacity-60"></div>
            </div>

            <span className="text-sm font-bold text-white">WhisperChat</span>
          </div>
          <Button onClick={toggleSidebar} variant="ghost" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <ul className="text-xs">
          {items.map((item) => (
            <li key={item}>
              <Button
                onClick={() => {
                  setActiveTab(item);
                  setSelectedCharacter(null);
                  toggleSidebar();
                }}
                variant={activeTab === item ? "default" : "ghost"}
                className="flex items-center mb-1 w-full text-left justify-start text-xs py-2"
              >
                <span>{item}</span>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    );
  },
);

Sidebar.displayName = "Sidebar";

export default Sidebar;
