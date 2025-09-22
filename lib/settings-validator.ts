// Comprehensive settings validation and application utilities

import type { ChatSettings } from "./chat-settings-storage"
import type { ParameterSettings } from "./parameter-settings-storage"

export interface SettingsValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export const validateChatSettings = (settings: Partial<ChatSettings>): SettingsValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate fontSize
  if (settings.fontSize && !["small", "medium", "large"].includes(settings.fontSize)) {
    errors.push("Invalid fontSize. Must be 'small', 'medium', or 'large'")
  }

  // Validate colorScheme
  if (
    settings.colorScheme &&
    ![
      "default",
      "dark",
      "blackpink",
      "seasalt",
      "ocean",
      "sunset",
      "forest",
      "purple",
      "rosegold",
      "midnight",
    ].includes(settings.colorScheme)
  ) {
    errors.push("Invalid colorScheme")
  }

  // Validate messageStyle
  if (settings.messageStyle && !["bubble", "flat", "minimal"].includes(settings.messageStyle)) {
    errors.push("Invalid messageStyle")
  }

  // Validate backgroundOpacity
  if (settings.backgroundOpacity !== undefined) {
    if (
      typeof settings.backgroundOpacity !== "number" ||
      settings.backgroundOpacity < 0 ||
      settings.backgroundOpacity > 1
    ) {
      errors.push("backgroundOpacity must be a number between 0 and 1")
    }
  }

  // Validate bubbleOpacity
  if (settings.bubbleOpacity !== undefined) {
    if (typeof settings.bubbleOpacity !== "number" || settings.bubbleOpacity < 0.3 || settings.bubbleOpacity > 1) {
      errors.push("bubbleOpacity must be a number between 0.3 and 1")
    }
  }

  // Validate fontFamily
  if (settings.fontFamily && !["default", "serif", "mono", "rounded"].includes(settings.fontFamily)) {
    errors.push("Invalid fontFamily")
  }

  // Validate lineHeight
  if (settings.lineHeight && !["compact", "normal", "relaxed"].includes(settings.lineHeight)) {
    errors.push("Invalid lineHeight")
  }

  // Validate messageAnimation
  if (settings.messageAnimation && !["slide", "fade", "none"].includes(settings.messageAnimation)) {
    errors.push("Invalid messageAnimation")
  }

  // Validate backgroundType
  if (settings.backgroundType && !["gradient", "solid", "image", "character"].includes(settings.backgroundType)) {
    errors.push("Invalid backgroundType")
  }

  // Performance warnings
  if (settings.enableAnimations === true && settings.messageAnimation === "slide") {
    warnings.push("Slide animations may impact performance on older devices")
  }

  if (settings.backgroundType === "image" && settings.backgroundOpacity && settings.backgroundOpacity < 0.3) {
    warnings.push("Very low background opacity may make text hard to read")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export const validateParameterSettings = (settings: Partial<ParameterSettings>): SettingsValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  // Temperature validation
  if (settings.temperature !== undefined) {
    if (typeof settings.temperature !== "number" || settings.temperature < 0 || settings.temperature > 2) {
      errors.push("Temperature must be between 0 and 2")
    } else if (settings.temperature > 1.5) {
      warnings.push("Very high temperature may produce incoherent responses")
    }
  }

  // TopP validation
  if (settings.topP !== undefined) {
    if (typeof settings.topP !== "number" || settings.topP < 0 || settings.topP > 1) {
      errors.push("TopP must be between 0 and 1")
    }
  }

  // MaxResponseLength validation
  if (settings.maxResponseLength !== undefined) {
    if (
      typeof settings.maxResponseLength !== "number" ||
      settings.maxResponseLength < 50 ||
      settings.maxResponseLength > 2000
    ) {
      errors.push("maxResponseLength must be between 50 and 2000")
    } else if (settings.maxResponseLength < 100) {
      warnings.push("Very short response length may limit AI expressiveness")
    }
  }

  // Streaming validation
  if (settings.enableStreaming === false && settings.streamingSpeed) {
    warnings.push("streamingSpeed setting has no effect when streaming is disabled")
  }

  // Safety validation
  if (settings.safetyLevel !== undefined) {
    if (typeof settings.safetyLevel !== "number" || settings.safetyLevel < 0 || settings.safetyLevel > 1) {
      errors.push("safetyLevel must be between 0 and 1")
    }
  }

  // Conflicting settings warnings
  if (settings.responseStyle === "creative" && settings.temperature !== undefined && settings.temperature < 0.5) {
    warnings.push("Creative response style works better with higher temperature values")
  }

  if (settings.responseStyle === "precise" && settings.temperature !== undefined && settings.temperature > 1.0) {
    warnings.push("Precise response style works better with lower temperature values")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// Settings application utilities
export const applyChatSettingsToElement = (element: HTMLElement, settings: ChatSettings): void => {
  // Apply font family
  const fontFamilyMap = {
    default: "ui-sans-serif, system-ui, sans-serif",
    serif: "ui-serif, Georgia, serif",
    mono: "ui-monospace, monospace",
    rounded: "ui-rounded, system-ui, sans-serif",
  }
  element.style.fontFamily = fontFamilyMap[settings.fontFamily] || fontFamilyMap.default

  // Apply font size
  const fontSizeMap = {
    small: "0.875rem",
    medium: "1rem",
    large: "1.125rem",
  }
  element.style.fontSize = fontSizeMap[settings.fontSize] || fontSizeMap.medium

  // Apply line height
  const lineHeightMap = {
    compact: "1.25",
    normal: "1.5",
    relaxed: "1.75",
  }
  element.style.lineHeight = lineHeightMap[settings.lineHeight] || lineHeightMap.normal
}

export const getOptimalParameterSettings = (
  useCase: "creative" | "balanced" | "precise",
): Partial<ParameterSettings> => {
  switch (useCase) {
    case "creative":
      return {
        temperature: 0.9,
        topP: 0.95,
        topK: 50,
        responseStyle: "creative",
        diversityPenalty: 0.3,
        repetitionPenalty: 1.1,
      }
    case "precise":
      return {
        temperature: 0.3,
        topP: 0.8,
        topK: 20,
        responseStyle: "precise",
        diversityPenalty: 0.1,
        repetitionPenalty: 0.9,
      }
    default: // balanced
      return {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        responseStyle: "balanced",
        diversityPenalty: 0.2,
        repetitionPenalty: 1.0,
      }
  }
}
