export interface Character {
  id: string
  name: string
  description: string
  personality: string
  scenario: string
  tags: string[]
  creator: string
  likes: number
  gender: string
  createdAt: number
  image: string | null
  avatar: string | null
  sceneCard: string | null
  sceneImage: string | null
  sceneDisplayMode: "cover" | "contain"
  intro: string
  messages: { sender: string; text: string }[]
  age: string
  rating: string
  greeting: string
  appearance: string
  visibility: "public" | "private"
  publicDefinition: string
  race: string
  charClass: string
  location: string
  item: string
  customTokens: Record<string, string>
}

export interface CharacterFormData {
  nickname: string
  age: string
  gender: string
  rating: string
  introduction: string
  greeting: string
  personality: string
  appearance: string
  tags: string[]
  visibility: string
  publicDefinition: string
  scenario: string
  imageFile: File | null
  imagePreview: string | null
  avatarFile: File | null
  avatarPreview: string | null
  sceneCardFile: File | null
  sceneCardPreview: string | null
  sceneImageFile: File | null
  sceneImagePreview: string | null
  sceneDisplayMode: "blur" | "cover"
  race: string // New field
  charClass: string // New field
  location: string // New field
  item: string // New field
  customTokens: { [key: string]: string } // New field for custom tokens
}

export interface FormErrors {
  [key: string]: string
}

export interface Message {
  id: string
  sender: string
  text: string
  timestamp: Date
  isPinned?: boolean
}
