// Storage utilities for chat interface settings

export interface ChatSettings {
  // Appearance
  fontSize: "small" | "medium" | "large";
  colorScheme:
    | "default"
    | "dark"
    | "blackpink"
    | "seasalt"
    | "ocean"
    | "sunset"
    | "forest"
    | "purple"
    | "rosegold"
    | "midnight";
  messageStyle: "bubble" | "flat" | "minimal";

  // Chat behavior
  autoScroll: boolean;
  showTimestamps: boolean;
  showAvatars: boolean;
  compactMode: boolean;

  // Background
  backgroundType: "gradient" | "solid" | "image" | "character";
  backgroundColor: string;
  backgroundImage: string | null;
  backgroundOpacity: number;

  // Chat bubbles
  bubbleOpacity: number;

  // Typography
  fontFamily: "default" | "serif" | "mono" | "rounded";
  lineHeight: "compact" | "normal" | "relaxed";

  // Animation
  enableAnimations: boolean;
  messageAnimation: "slide" | "fade" | "none";

  // Sound
  enableSounds: boolean;
  messageSoundEnabled: boolean;
  notificationSoundEnabled: boolean;
}

const DEFAULT_SETTINGS: ChatSettings = {
  fontSize: "medium",
  colorScheme: "default",
  messageStyle: "bubble",
  autoScroll: true,
  showTimestamps: true,
  showAvatars: true,
  compactMode: false,
  backgroundType: "gradient",
  backgroundColor: "#0f172a",
  backgroundImage: null,
  backgroundOpacity: 0.8,
  bubbleOpacity: 1.0,
  fontFamily: "default",
  lineHeight: "normal",
  enableAnimations: true,
  messageAnimation: "slide",
  enableSounds: false,
  messageSoundEnabled: false,
  notificationSoundEnabled: false,
};

export const getChatSettings = (): ChatSettings => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  try {
    const stored = localStorage.getItem("chatSettings");
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Error loading chat settings:", error);
    return DEFAULT_SETTINGS;
  }
};

export const saveChatSettings = (settings: Partial<ChatSettings>): void => {
  if (typeof window === "undefined") return;

  try {
    const currentSettings = getChatSettings();
    const newSettings = { ...currentSettings, ...settings };
    localStorage.setItem("chatSettings", JSON.stringify(newSettings));

    // Dispatch event for real-time updates
    window.dispatchEvent(
      new CustomEvent("chatSettingsUpdated", {
        detail: newSettings,
      }),
    );
  } catch (error) {
    console.error("Error saving chat settings:", error);
  }
};

export const resetChatSettings = (): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("chatSettings");
    window.dispatchEvent(
      new CustomEvent("chatSettingsUpdated", {
        detail: DEFAULT_SETTINGS,
      }),
    );
  } catch (error) {
    console.error("Error resetting chat settings:", error);
  }
};

// Color scheme definitions - solid colors only
export const COLOR_SCHEMES = {
  default: {
    name: "Default Theme",
    primary: "from-slate-600 to-slate-700",
    secondary: "from-slate-700 to-slate-800",
    accent: "text-slate-400",
    userMessage: "bg-slate-600 text-white",
    aiMessage: "bg-slate-700 text-gray-100",
    background: "bg-slate-900",
  },
  dark: {
    name: "Dark",
    primary: "from-slate-600 to-slate-700",
    secondary: "from-slate-700 to-slate-800",
    accent: "text-slate-400",
    userMessage: "bg-slate-600 text-white",
    aiMessage: "bg-slate-700 text-white",
    background: "bg-slate-900",
  },
  blackpink: {
    name: "Cyan Slate",
    primary: "from-cyan-400 to-cyan-500",
    secondary: "from-slate-600 to-slate-700",
    accent: "text-cyan-400",
    userMessage: "bg-cyan-400 text-black",
    aiMessage: "bg-slate-600 text-white",
    background: "bg-slate-900",
  },
  seasalt: {
    name: "Sea Salt Cheese",
    primary: "from-cyan-400 to-cyan-500",
    secondary: "from-yellow-200 to-yellow-300",
    accent: "text-cyan-400",
    userMessage: "bg-cyan-400 text-black",
    aiMessage: "bg-yellow-200 text-black",
    background: "bg-slate-900",
  },
  ocean: {
    name: "Ocean Breeze",
    primary: "from-blue-400 to-blue-500",
    secondary: "from-teal-500 to-teal-600",
    accent: "text-blue-400",
    userMessage: "bg-blue-500 text-white",
    aiMessage: "bg-teal-500 text-white",
    background: "bg-slate-900",
  },
  sunset: {
    name: "Sunset Glow",
    primary: "from-orange-400 to-orange-500",
    secondary: "from-pink-400 to-pink-500",
    accent: "text-orange-400",
    userMessage: "bg-orange-500 text-white",
    aiMessage: "bg-pink-400 text-white",
    background: "bg-slate-900",
  },
  forest: {
    name: "Forest Green",
    primary: "from-green-500 to-green-600",
    secondary: "from-emerald-500 to-emerald-600",
    accent: "text-green-400",
    userMessage: "bg-green-600 text-white",
    aiMessage: "bg-emerald-500 text-white",
    background: "bg-slate-900",
  },
  purple: {
    name: "Purple Haze",
    primary: "from-purple-500 to-purple-600",
    secondary: "from-violet-500 to-violet-600",
    accent: "text-purple-400",
    userMessage: "bg-purple-600 text-white",
    aiMessage: "bg-violet-500 text-white",
    background: "bg-slate-900",
  },
  rosegold: {
    name: "Rose Gold",
    primary: "from-rose-400 to-rose-500",
    secondary: "from-amber-300 to-amber-400",
    accent: "text-rose-400",
    userMessage: "bg-rose-500 text-white",
    aiMessage: "bg-amber-300 text-black",
    background: "bg-slate-900",
  },
  midnight: {
    name: "Midnight Blue",
    primary: "from-indigo-600 to-indigo-700",
    secondary: "from-blue-800 to-blue-900",
    accent: "text-indigo-400",
    userMessage: "bg-indigo-700 text-white",
    aiMessage: "bg-blue-800 text-white",
    background: "bg-slate-900",
  },
};

// Font size mappings
export const FONT_SIZES = {
  small: {
    message: "text-xs",
    timestamp: "text-xs",
    name: "text-xs",
  },
  medium: {
    message: "text-sm",
    timestamp: "text-xs",
    name: "text-sm",
  },
  large: {
    message: "text-base",
    timestamp: "text-sm",
    name: "text-base",
  },
};

// Font family mappings
export const FONT_FAMILIES = {
  default: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
  rounded: "font-sans", // Would need custom font
};

// Line height mappings
export const LINE_HEIGHTS = {
  compact: "leading-tight",
  normal: "leading-normal",
  relaxed: "leading-relaxed",
};
