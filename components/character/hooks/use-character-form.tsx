"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import type { CharacterFormData, FormErrors } from "@/lib/types"

const AUTO_SAVE_INTERVAL = 10000 // 10 seconds

// Initial form state
const getInitialFormData = (): CharacterFormData => ({
  nickname: "",
  age: "",
  gender: "non-binary",
  rating: "filtered",
  introduction: "",
  greeting: "",
  personality: "",
  appearance: "",
  tags: [],
  visibility: "public",
  publicDefinition: "no",
  scenario: "",
  exampleConversation: "",
  imageFile: null,
  imagePreview: null,
  avatarFile: null,
  avatarPreview: null,
  sceneCardFile: null,
  sceneCardPreview: null,
  sceneImageFile: null,
  sceneImagePreview: null,
  sceneDisplayMode: "blur",
})

export function useCharacterForm() {
  const [formData, setFormData] = useState<CharacterFormData>(getInitialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Validation function
  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {}

    if (!formData.nickname?.trim()) newErrors.nickname = "Nickname is required"
    if (!formData.age?.trim()) newErrors.age = "Age is required"
    if (!formData.introduction?.trim()) newErrors.introduction = "Introduction is required"
    if (!formData.greeting?.trim()) newErrors.greeting = "Greeting is required"

    if (formData.nickname && formData.nickname.length > 40) {
      newErrors.nickname = "Nickname must be 40 characters or less"
    }

    if (formData.age && formData.age.length > 8) {
      newErrors.age = "Age must be 8 characters or less"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData.nickname, formData.age, formData.introduction, formData.greeting])

  // Field update function
  const updateField = useCallback(
    (field: keyof CharacterFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }))

      // Clear error when field is updated
      if (errors[field]) {
        setErrors((prev) => {
          const updated = { ...prev }
          delete updated[field]
          return updated
        })
      }
    },
    [errors],
  )

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (isSaving) return

    setIsSaving(true)
    try {
      const dataToSave = { ...formData }
      // Don't save file objects to localStorage
      delete dataToSave.imageFile
      delete dataToSave.avatarFile
      delete dataToSave.sceneCardFile
      delete dataToSave.sceneImageFile

      localStorage.setItem("characterFormData", JSON.stringify(dataToSave))
    } catch (error) {
      console.error("Auto-save failed:", error)
    } finally {
      setIsSaving(false)
    }
  }, [formData, isSaving])

  // Debounced auto-save
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave()
    }, AUTO_SAVE_INTERVAL)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [formData, autoSave])

  // Load saved data on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("characterFormData")
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setFormData((prevData) => ({
          ...prevData,
          ...parsedData,
        }))
      }
    } catch (error) {
      console.error("Error loading saved form data:", error)
    }
  }, [])

  // Image handling
  const handleImageChange = useCallback((type: string, file: File, previewUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      [`${type}File`]: file,
      [`${type}Preview`]: previewUrl,
    }))
  }, [])

  // Tag handling
  const handleAddTag = useCallback((tag: string) => {
    setFormData((prev) => {
      if (prev.tags.includes(tag)) {
        return { ...prev, tags: prev.tags.filter((t) => t !== tag) }
      } else if (prev.tags.length < 9) {
        return { ...prev, tags: [...prev.tags, tag] }
      }
      return prev
    })
  }, [])

  // Create character-specific scene
  const createCharacterScene = useCallback((character: any) => {
    if (!character.sceneImage) return null

    const characterScene = {
      id: `character-${character.id}`,
      name: `${character.name}'s Scene`,
      description: `Custom background scene for ${character.name}`,
      image: character.sceneImage,
      displayMode: character.sceneDisplayMode || "blur",
      isDefault: false,
      isCharacterScene: true,
      characterId: character.id,
      locked: true,
    }

    try {
      const existingScenes = JSON.parse(localStorage.getItem("chatScenes") || "[]")
      const sceneIndex = existingScenes.findIndex((s: any) => s.id === characterScene.id)

      if (sceneIndex >= 0) {
        existingScenes[sceneIndex] = characterScene
      } else {
        existingScenes.push(characterScene)
      }

      localStorage.setItem("chatScenes", JSON.stringify(existingScenes))
    } catch (error) {
      console.error("Error saving character scene:", error)
    }

    return characterScene
  }, [])

  // Form submission
  const handleSubmit = useCallback(
    async (updateState: (state: any) => void) => {
      if (!validateForm()) {
        return false
      }

      setIsSubmitting(true)

      try {
        const newCharacter = {
          id: Date.now().toString(),
          name: formData.nickname,
          description: formData.introduction,
          personality: formData.personality,
          scenario: formData.scenario || "",
          tags: formData.tags,
          creator: "@User",
          likes: 0,
          gender: formData.gender,
          createdAt: Date.now(),
          image: formData.imagePreview || "/placeholder.svg?height=200&width=150",
          avatar: formData.avatarPreview || null,
          sceneCard: formData.sceneCardPreview || null,
          sceneImage: formData.sceneImagePreview || null,
          sceneDisplayMode: formData.sceneDisplayMode || "blur",
          intro: formData.introduction,
          messages: [{ sender: formData.nickname, text: formData.greeting }],
          age: formData.age,
          rating: formData.rating,
          greeting: formData.greeting,
          appearance: formData.appearance,
          visibility: formData.visibility,
          publicDefinition: formData.publicDefinition,
        }

        // Create character-specific scene if scene image exists
        if (newCharacter.sceneImage) {
          createCharacterScene(newCharacter)
        }

        const existingCharacters = JSON.parse(localStorage.getItem("characters") || "[]")
        existingCharacters.push(newCharacter)
        localStorage.setItem("characters", JSON.stringify(existingCharacters))

        window.dispatchEvent(new Event("charactersUpdated"))
        localStorage.removeItem("characterFormData")

        alert(`${formData.nickname} has been successfully created!`)
        setTimeout(() => updateState({ activeTab: "Discover" }), 1000)
        return true
      } catch (error) {
        console.error("Error saving character:", error)
        alert("There was a problem saving your character. Please try again.")
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [validateForm, formData, createCharacterScene],
  )

  return {
    formData,
    errors,
    isSubmitting,
    isSaving,
    updateField,
    handleImageChange,
    handleAddTag,
    handleSubmit,
    validateForm,
  }
}
