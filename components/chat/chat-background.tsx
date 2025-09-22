"use client"

import type React from "react"
import type { Scene } from "./hooks/use-chat-state"

interface ChatBackgroundProps {
  currentScene: Scene | null
  children: React.ReactNode
}

const ChatBackground = ({ currentScene, children }: ChatBackgroundProps) => {
  const getBackgroundStyle = () => {
    if (!currentScene || !currentScene.image) {
      return {
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      }
    }

    const baseStyle = {
      backgroundImage: `url("${currentScene.image}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
    }

    if (currentScene.displayMode === "blur") {
      return {
        ...baseStyle,
        position: "relative" as const,
      }
    }

    return baseStyle
  }

  const getOverlayStyle = () => {
    if (!currentScene || !currentScene.image || currentScene.displayMode !== "blur") {
      return {}
    }

    return {
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(12px)",
      zIndex: 1,
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden relative chat-container" style={getBackgroundStyle()}>
      {currentScene?.displayMode === "blur" && currentScene.image && <div style={getOverlayStyle()} />}
      <div className="relative z-10 flex flex-col h-full">{children}</div>
    </div>
  )
}

export default ChatBackground
