// Unified settings management system

import { getChatSettings, saveChatSettings, type ChatSettings } from "./chat-settings-storage"
import { getParameterSettings, saveParameterSettings, type ParameterSettings } from "./parameter-settings-storage"

export interface AppSettings {
  // User preferences
  user: {
    username: string
    avatar: string
    theme: "light" | "dark" | "auto"
    language: string
    timezone: string
  }

  // Privacy settings
  privacy: {
    profileVisibility: "public" | "friends" | "private"
    allowDirectMessages: boolean
    showOnlineStatus: boolean
    dataCollection: boolean
    analyticsOptIn: boolean
  }

  // Notification preferences
  notifications: {
    enabled: boolean
    email: boolean
    push: boolean
    sound: boolean
    categories: {
      messages: boolean
      followers: boolean
      likes: boolean
      comments: boolean
      system: boolean
    }
  }

  // Content preferences
  content: {
    nsfwFilter: "strict" | "moderate" | "off"
    languageFilter: boolean
    autoTranslate: boolean
    preferredLanguages: string[]
    contentWarnings: boolean
  }

  // Accessibility
  accessibility: {
    highContrast: boolean
    largeText: boolean
    reducedMotion: boolean
    screenReader: boolean
    keyboardNavigation: boolean
  }

  // Performance
  performance: {
    autoLoadImages: boolean
    enableAnimations: boolean
    preloadContent: boolean
    lowDataMode: boolean
    maxCacheSize: number
  }

  // Backup & Sync
  backup: {
    autoBackup: boolean
    backupFrequency: "daily" | "weekly" | "monthly"
    includeChats: boolean
    includeMemories: boolean
    includeSettings: boolean
    cloudSync: boolean
  }

  // Advanced
  advanced: {
    developerMode: boolean
    debugLogging: boolean
    experimentalFeatures: boolean
    betaUpdates: boolean
    customCSS: string
  }
}

export interface SettingsExport {
  version: string
  timestamp: number
  appSettings: AppSettings
  chatSettings: ChatSettings
  parameterSettings: ParameterSettings
  metadata: {
    platform: string
    userAgent: string
    exportedBy: string
  }
}

const DEFAULT_APP_SETTINGS: AppSettings = {
  user: {
    username: "User",
    avatar: "",
    theme: "auto",
    language: "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  privacy: {
    profileVisibility: "public",
    allowDirectMessages: true,
    showOnlineStatus: true,
    dataCollection: false,
    analyticsOptIn: false,
  },
  notifications: {
    enabled: true,
    email: false,
    push: true,
    sound: true,
    categories: {
      messages: true,
      followers: true,
      likes: true,
      comments: true,
      system: true,
    },
  },
  content: {
    nsfwFilter: "moderate",
    languageFilter: true,
    autoTranslate: false,
    preferredLanguages: ["en"],
    contentWarnings: true,
  },
  accessibility: {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: false,
  },
  performance: {
    autoLoadImages: true,
    enableAnimations: true,
    preloadContent: true,
    lowDataMode: false,
    maxCacheSize: 100, // MB
  },
  backup: {
    autoBackup: true,
    backupFrequency: "weekly",
    includeChats: true,
    includeMemories: true,
    includeSettings: true,
    cloudSync: false,
  },
  advanced: {
    developerMode: false,
    debugLogging: false,
    experimentalFeatures: false,
    betaUpdates: false,
    customCSS: "",
  },
}

// App settings management
export const getAppSettings = (): AppSettings => {
  if (typeof window === "undefined") return DEFAULT_APP_SETTINGS

  try {
    const stored = localStorage.getItem("appSettings")
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_APP_SETTINGS, ...parsed }
    }
    return DEFAULT_APP_SETTINGS
  } catch (error) {
    console.error("Error loading app settings:", error)
    return DEFAULT_APP_SETTINGS
  }
}

export const saveAppSettings = (settings: Partial<AppSettings>): void => {
  if (typeof window === "undefined") return

  try {
    const currentSettings = getAppSettings()
    const newSettings = { ...currentSettings, ...settings }
    localStorage.setItem("appSettings", JSON.stringify(newSettings))

    // Apply theme changes immediately
    if (settings.user?.theme) {
      applyTheme(settings.user.theme)
    }

    // Apply accessibility changes
    if (settings.accessibility) {
      applyAccessibilitySettings(settings.accessibility)
    }

    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent("appSettingsUpdated", { detail: newSettings }))
  } catch (error) {
    console.error("Error saving app settings:", error)
  }
}

// Get all settings in one object
export const getAllSettings = (): SettingsExport => {
  return {
    version: "1.0.0",
    timestamp: Date.now(),
    appSettings: getAppSettings(),
    chatSettings: getChatSettings(),
    parameterSettings: getParameterSettings(),
    metadata: {
      platform: typeof window !== "undefined" ? window.navigator.platform : "server",
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "server",
      exportedBy: getAppSettings().user.username,
    },
  }
}

// Export settings to JSON
export const exportSettings = (): string => {
  const settings = getAllSettings()
  return JSON.stringify(settings, null, 2)
}

// Import settings from JSON
export const importSettings = (jsonData: string): void => {
  if (typeof window === "undefined") return

  try {
    const imported: SettingsExport = JSON.parse(jsonData)

    // Validate the import
    if (!imported.version || !imported.appSettings) {
      throw new Error("Invalid settings format")
    }

    // Import each settings category
    if (imported.appSettings) {
      saveAppSettings(imported.appSettings)
    }

    if (imported.chatSettings) {
      saveChatSettings(imported.chatSettings)
    }

    if (imported.parameterSettings) {
      saveParameterSettings(imported.parameterSettings)
    }

    // Notify about successful import
    window.dispatchEvent(new CustomEvent("settingsImported", { detail: imported }))
  } catch (error) {
    console.error("Error importing settings:", error)
    throw new Error("Failed to import settings: Invalid format")
  }
}

// Reset all settings to defaults
export const resetAllSettings = (): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem("appSettings")
    localStorage.removeItem("chatSettings")
    localStorage.removeItem("parameterSettings")

    // Apply default theme
    applyTheme("auto")

    // Dispatch reset event
    window.dispatchEvent(new CustomEvent("settingsReset"))
  } catch (error) {
    console.error("Error resetting settings:", error)
  }
}

// Theme application
const applyTheme = (theme: "light" | "dark" | "auto"): void => {
  if (typeof window === "undefined") return

  const root = document.documentElement

  if (theme === "auto") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    theme = prefersDark ? "dark" : "light"
  }

  root.classList.remove("light", "dark")
  root.classList.add(theme)
}

// Accessibility settings application
const applyAccessibilitySettings = (accessibility: Partial<AppSettings["accessibility"]>): void => {
  if (typeof window === "undefined") return

  const root = document.documentElement

  if (accessibility.highContrast !== undefined) {
    root.classList.toggle("high-contrast", accessibility.highContrast)
  }

  if (accessibility.largeText !== undefined) {
    root.classList.toggle("large-text", accessibility.largeText)
  }

  if (accessibility.reducedMotion !== undefined) {
    root.classList.toggle("reduced-motion", accessibility.reducedMotion)
  }
}

// Auto-backup functionality
export const createAutoBackup = (): void => {
  if (typeof window === "undefined") return

  try {
    const settings = getAppSettings()
    if (!settings.backup.autoBackup) return

    const backup = {
      timestamp: Date.now(),
      settings: getAllSettings(),
      memories: localStorage.getItem("savedMemories"),
      recentChats: localStorage.getItem("recentChats"),
    }

    const backupKey = `backup_${new Date().toISOString().split("T")[0]}`
    localStorage.setItem(backupKey, JSON.stringify(backup))

    // Clean old backups (keep last 10)
    const allKeys = Object.keys(localStorage).filter((key) => key.startsWith("backup_"))
    if (allKeys.length > 10) {
      allKeys
        .sort()
        .slice(0, -10)
        .forEach((key) => localStorage.removeItem(key))
    }
  } catch (error) {
    console.error("Error creating auto backup:", error)
  }
}

// Initialize settings on app start
export const initializeSettings = (): void => {
  if (typeof window === "undefined") return

  try {
    const settings = getAppSettings()

    // Apply initial theme
    applyTheme(settings.user.theme)

    // Apply accessibility settings
    applyAccessibilitySettings(settings.accessibility)

    // Set up auto-backup
    if (settings.backup.autoBackup) {
      const interval =
        settings.backup.backupFrequency === "daily"
          ? 24 * 60 * 60 * 1000
          : settings.backup.backupFrequency === "weekly"
            ? 7 * 24 * 60 * 60 * 1000
            : 30 * 24 * 60 * 60 * 1000 // monthly

      setInterval(createAutoBackup, interval)
    }
  } catch (error) {
    console.error("Error initializing settings:", error)
  }
}
