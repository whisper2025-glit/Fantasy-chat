"use client"

import { useEffect, useRef, useState, useLayoutEffect } from "react"
import { Edit3, GitBranch, Copy, Pin, Trash2 } from "lucide-react"

interface MessageContextMenuProps {
  isOpen: boolean
  onClose: () => void
  position: { x: number; y: number }
  isUserMessage: boolean
  onEdit?: () => void
  onBranch?: () => void
  onCopy: () => void
  onPin: () => void
  onDelete?: () => void
}

const MessageContextMenu = ({
  isOpen,
  onClose,
  position,
  isUserMessage,
  onEdit,
  onBranch,
  onCopy,
  onPin,
  onDelete,
}: MessageContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [adjustedPosition, setAdjustedPosition] = useState({ x: position.x, y: position.y })

  // Use useLayoutEffect to calculate position synchronously after DOM updates
  useLayoutEffect(() => {
    if (!isOpen || !menuRef.current) {
      return
    }

    const calculateAndSetPosition = () => {
      const menuWidth = menuRef.current!.offsetWidth
      const menuHeight = menuRef.current!.offsetHeight

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let newX = position.x
      let newY = position.y

      // Adjust X position to stay within viewport
      if (newX + menuWidth > viewportWidth) {
        newX = viewportWidth - menuWidth
      }
      if (newX < 0) {
        // Ensure it doesn't go off the left edge
        newX = 0
      }

      // Adjust Y position to stay within viewport
      if (newY + menuHeight > viewportHeight) {
        newY = viewportHeight - menuHeight
      }
      if (newY < 0) {
        // Ensure it doesn't go off the top edge
        newY = 0
      }

      setAdjustedPosition({ x: newX, y: newY })
    }

    calculateAndSetPosition() // Initial calculation

    // Recalculate on window resize
    window.addEventListener("resize", calculateAndSetPosition)

    return () => {
      window.removeEventListener("resize", calculateAndSetPosition)
    }
  }, [isOpen, position]) // Recalculate if isOpen or initial position changes

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Different menu items based on message type
  const userMenuItems = [
    { icon: Edit3, label: "Edit", action: onEdit },
    { icon: GitBranch, label: "Branch", action: onBranch },
    { icon: Copy, label: "Copy", action: onCopy },
    { icon: Pin, label: "Pin", action: onPin },
    { icon: Trash2, label: "Delete", action: onDelete, danger: true },
  ]

  const characterMenuItems = [
    { icon: Edit3, label: "Edit", action: onEdit },
    { icon: Copy, label: "Copy", action: onCopy },
    { icon: Pin, label: "Pin", action: onPin },
  ]

  const menuItems = isUserMessage ? userMenuItems : characterMenuItems

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-slate-800/95 backdrop-blur-md rounded-lg shadow-2xl border border-slate-700/50 py-1 min-w-[120px]"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            item.action?.()
            onClose()
          }}
          className={`w-full flex items-center space-x-2 px-3 py-2 text-xs transition-all duration-300 ${
            item.danger
              ? "text-red-400 hover:bg-red-500/20 hover:text-red-300"
              : "text-white hover:bg-slate-700/50 hover:text-cyan-400"
          }`}
        >
          <item.icon className="w-3 h-3" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
}

export default MessageContextMenu
