import type { Character } from "./types"

export interface RecentChat {
  id: string
  character: Character
  lastMessage: string
  lastMessageTime: number
  messageCount: number
  isUnread: boolean
  chatHistory: Array<{
    id: string
    sender: string
    text: string
    timestamp: number
    type?: "text" | "image" | "voice"
    imageUrl?: string
  }>
}

// Get recent chats from localStorage
export const getRecentChats = (): RecentChat[] => {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem("recentChats")
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error loading recent chats:", error)
    return []
  }
}

// Save recent chat to localStorage
export const saveRecentChat = (recentChat: RecentChat): void => {
  if (typeof window === "undefined") return

  try {
    const recentChats = getRecentChats()

    // Remove existing chat with same character ID
    const filteredChats = recentChats.filter((chat) => chat.character.id !== recentChat.character.id)

    // Add new chat at the beginning
    const updatedChats = [recentChat, ...filteredChats].slice(0, 50) // Keep only last 50 chats

    localStorage.setItem("recentChats", JSON.stringify(updatedChats))
    window.dispatchEvent(new Event("recentChatsUpdated"))
  } catch (error) {
    console.error("Error saving recent chat:", error)
  }
}

// Update recent chat
export const updateRecentChat = (characterId: string, updates: Partial<RecentChat>): void => {
  if (typeof window === "undefined") return

  try {
    const recentChats = getRecentChats()
    const chatIndex = recentChats.findIndex((chat) => chat.character.id === characterId)

    if (chatIndex !== -1) {
      recentChats[chatIndex] = { ...recentChats[chatIndex], ...updates }

      // Move updated chat to the top
      const updatedChat = recentChats.splice(chatIndex, 1)[0]
      recentChats.unshift(updatedChat)

      localStorage.setItem("recentChats", JSON.stringify(recentChats))
      window.dispatchEvent(new Event("recentChatsUpdated"))
    }
  } catch (error) {
    console.error("Error updating recent chat:", error)
  }
}

// Delete recent chat
export const deleteRecentChat = (characterId: string): void => {
  if (typeof window === "undefined") return

  try {
    const recentChats = getRecentChats()
    const filteredChats = recentChats.filter((chat) => chat.character.id !== characterId)

    localStorage.setItem("recentChats", JSON.stringify(filteredChats))
    window.dispatchEvent(new Event("recentChatsUpdated"))
  } catch (error) {
    console.error("Error deleting recent chat:", error)
  }
}

// Mark chat as read
export const markChatAsRead = (characterId: string): void => {
  updateRecentChat(characterId, { isUnread: false })
}

// Get chat history for a character
export const getChatHistory = (characterId: string): RecentChat["chatHistory"] => {
  const recentChats = getRecentChats()
  const chat = recentChats.find((chat) => chat.character.id === characterId)
  return chat?.chatHistory || []
}

// Format timestamp for display
export const formatTimestamp = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return new Date(timestamp).toLocaleDateString()
}
