"use client"
import { Button } from "@/components/ui/button"
import { User, Image, Users, Bot, FileText, X } from "lucide-react"

interface ChatOptionsModalProps {
  isOpen: boolean
  onClose: () => void
  onOptionSelect: (optionId: string) => void
}

const chatOptions = [
  {
    id: "persona",
    label: "Persona",
    icon: <User className="w-5 h-5" />,
    description: "Customize your persona",
  },
  {
    id: "scene",
    label: "Scene",
    icon: <Image className="w-5 h-5" />,
    description: "Change chat background",
  },
  {
    id: "group",
    label: "Group",
    icon: <Users className="w-5 h-5" />,
    description: "Group chat settings",
  },
  {
    id: "models",
    label: "Models",
    icon: <Bot className="w-5 h-5" />,
    description: "AI model settings",
  },
  {
    id: "instructions",
    label: "Instructions",
    icon: <FileText className="w-5 h-5" />,
    description: "Chat instructions",
  },
]

export default function ChatOptionsModal({ isOpen, onClose, onOptionSelect }: ChatOptionsModalProps) {
  const handleOptionClick = (optionId: string) => {
    onOptionSelect(optionId)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal positioned at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <div className="bg-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-t-2xl shadow-2xl max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <h3 className="text-white font-semibold text-sm">Chat Options</h3>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Options Grid */}
          <div className="p-4 grid grid-cols-2 gap-3">
            {chatOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className="flex flex-col items-center p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 text-white hover:text-cyan-400 group"
              >
                <div className="mb-2 text-slate-300 group-hover:text-cyan-400 transition-colors duration-300">
                  {option.icon}
                </div>
                <span className="text-xs font-medium mb-1">{option.label}</span>
                <span className="text-xs text-slate-400 text-center leading-tight">{option.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
