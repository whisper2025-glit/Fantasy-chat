"use client"

import { useState, useEffect, useRef } from "react"

export const useMobileKeyboard = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const initialViewportHeight = useRef<number>(0)

  useEffect(() => {
    if (typeof window === "undefined") return

    initialViewportHeight.current = window.innerHeight

    const handleViewportChange = () => {
      const currentViewportHeight = window.innerHeight
      const heightDifference = initialViewportHeight.current - currentViewportHeight

      if (heightDifference > 150) {
        if (!isKeyboardOpen) {
          setIsKeyboardOpen(true)
          setKeyboardHeight(heightDifference)
          document.body.classList.add("keyboard-open")
        }
      } else {
        if (isKeyboardOpen) {
          setIsKeyboardOpen(false)
          setKeyboardHeight(0)
          document.body.classList.remove("keyboard-open")
        }
      }
    }

    const handleOrientationChange = () => {
      setTimeout(() => {
        initialViewportHeight.current = window.innerHeight
        handleViewportChange()
      }, 500)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        initialViewportHeight.current = window.innerHeight
      }
    }

    window.addEventListener("resize", handleViewportChange)
    window.addEventListener("orientationchange", handleOrientationChange)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("resize", handleViewportChange)
      window.removeEventListener("orientationchange", handleOrientationChange)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.body.classList.remove("keyboard-open")
    }
  }, [isKeyboardOpen])

  return {
    isKeyboardOpen,
    keyboardHeight,
  }
}
