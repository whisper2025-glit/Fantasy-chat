"use client"

import { useState, useEffect } from "react"
import GroupChatSheet from "./group-chat-sheet"
import InstructionsSheet from "./instructions-sheet"
import SceneSheet from "./scene-sheet"
import PersonaSheet from "./persona-sheet"
import PersonaChangeSheet from "./persona-change-sheet"
import PersonaOperationModal from "./persona-operation-modal"
import type { Character } from "@/lib/types"

interface Message {
  id: string
  sender: string
  text: string
  timestamp: Date
  type?: "text" | "image" | "voice"
  imageUrl?: string
}

interface ChatSheetsProps {
  character: Character
  messages: Message[]
}

export default function ChatSheets({ character, messages }: ChatSheetsProps) {
  const [showGroupChat, setShowGroupChat] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showScene, setShowScene] = useState(false)
  const [showPersona, setShowPersona] = useState(false)
  const [showPersonaChange, setShowPersonaChange] = useState(false)
  const [showPersonaOperation, setShowPersonaOperation] = useState(false)

  const handleGroupChat = () => setShowGroupChat(true)
  const handleInstructions = () => setShowInstructions(true)
  const handleScene = () => setShowScene(true)
  const handlePersona = () => setShowPersona(true)
  const handlePersonaChange = () => setShowPersonaChange(true)
  const handlePersonaOperation = () => setShowPersonaOperation(true)

  // Expose handlers globally for other components to use
  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).chatSheetHandlers = {
        handleGroupChat,
        handleInstructions,
        handleScene,
        handlePersona,
        handlePersonaChange,
        handlePersonaOperation,
      }
    }
  }, [])

  return (
    <>
      <GroupChatSheet isOpen={showGroupChat} onClose={() => setShowGroupChat(false)} character={character} />

      <InstructionsSheet isOpen={showInstructions} onClose={() => setShowInstructions(false)} character={character} />

      <SceneSheet isOpen={showScene} onClose={() => setShowScene(false)} character={character} />

      <PersonaSheet isOpen={showPersona} onClose={() => setShowPersona(false)} character={character} />

      <PersonaChangeSheet
        isOpen={showPersonaChange}
        onClose={() => setShowPersonaChange(false)}
        character={character}
      />

      <PersonaOperationModal
        isOpen={showPersonaOperation}
        onClose={() => setShowPersonaOperation(false)}
        character={character}
      />
    </>
  )
}
