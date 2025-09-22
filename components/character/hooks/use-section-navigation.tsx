"use client"

import { useState, useRef, useEffect, useCallback } from "react"

const SECTIONS = [
  { id: "basic", label: "Basic Information", icon: "User" },
  { id: "appearance", label: "Appearance", icon: "ImageIcon" },
  { id: "personality", label: "Personality", icon: "UserCircle" },
  { id: "scene", label: "Chat Scene", icon: "Landscape" },
  { id: "advanced", label: "Advanced Settings", icon: "Settings" },
]

export function useSectionNavigation() {
  const [activeSection, setActiveSection] = useState("basic")
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({
    basic: null,
    appearance: null,
    personality: null,
    scene: null,
    advanced: null,
  })
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null)

  // Intersection Observer for section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            const id = entry.target.id.replace("section-", "")
            setActiveSection(id)
          }
        })
      },
      { threshold: 0.3, rootMargin: "-100px 0px -100px 0px" },
    )

    intersectionObserverRef.current = observer

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  // Scroll to section
  const scrollToSection = useCallback((section: string) => {
    const element = sectionRefs.current[section]
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  return {
    activeSection,
    setActiveSection,
    sectionRefs,
    scrollToSection,
    SECTIONS,
  }
}
