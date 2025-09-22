"use client";

import { useState, useCallback } from "react";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isPinned?: boolean;
}

interface Scene {
  id: string;
  name: string;
  description: string;
  image?: string;
  displayMode: "blur" | "cover";
  isDefault: boolean;
  isCharacterScene?: boolean;
  characterId?: string;
  locked?: boolean;
}

export const useChatState = (character: any) => {
  // Messages state
  const [messages, setMessages] = useState<Message[]>(
    character.messages?.map((msg: any, index: number) => ({
      id: `msg-${index}`,
      sender: msg.sender,
      text: msg.text,
      timestamp: new Date(),
      isPinned: false,
    })) || [],
  );

  // Input state
  const [inputText, setInputText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    messageId: string | null;
    isUserMessage: boolean;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    messageId: null,
    isUserMessage: false,
  });

  // Sheet states
  const [isChatSettingsOpen, setIsChatSettingsOpen] = useState(false);
  const [isChatOptionsOpen, setIsChatOptionsOpen] = useState(false);
  const [isStartNewChatOpen, setIsStartNewChatOpen] = useState(false);
  const [isParameterSettingsOpen, setIsParameterSettingsOpen] = useState(false);
  const [isSaveMemoriesOpen, setIsSaveMemoriesOpen] = useState(false);
  const [isViewMemoriesOpen, setIsViewMemoriesOpen] = useState(false);
  const [isPersonaSheetOpen, setIsPersonaSheetOpen] = useState(false);
  const [isSceneSheetOpen, setIsSceneSheetOpen] = useState(false);
  const [isModelsSheetOpen, setIsModelsSheetOpen] = useState(false);
  const [isInstructionsSheetOpen, setIsInstructionsSheetOpen] = useState(false);
  const [isGroupChatSheetOpen, setIsGroupChatSheetOpen] = useState(false);

  // Scene state
  const [currentScene, setCurrentScene] = useState<Scene | null>(() => {
    if (character.sceneImage) {
      return {
        id: `character-${character.id}`,
        name: `${character.name}'s Scene`,
        description: `Custom background scene for ${character.name}`,
        image: character.sceneImage,
        displayMode: character.sceneDisplayMode || "blur",
        isDefault: true,
        isCharacterScene: true,
        characterId: character.id,
        locked: true,
      };
    }

    if (typeof window !== "undefined") {
      const savedScenes = localStorage.getItem("chatScenes");
      if (savedScenes) {
        const scenes = JSON.parse(savedScenes);
        return scenes.find((s: Scene) => s.isDefault) || null;
      }
    }
    return null;
  });

  // Model state
  const [currentModel, setCurrentModel] = useState(() => {
    if (typeof window !== "undefined") {
      const savedModel = localStorage.getItem("currentChatModel");
      if (savedModel) {
        return JSON.parse(savedModel);
      }
    }
    return {
      id: "mistral-7b",
      name: "Mistral 7B",
      provider: "Mistral AI",
    };
  });

  // Message actions
  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateMessage = useCallback(
    (messageId: string, updates: Partial<Message>) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg,
        ),
      );
    },
    [],
  );

  const deleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Context menu actions
  const openContextMenu = useCallback(
    (
      position: { x: number; y: number },
      messageId: string,
      isUserMessage: boolean,
    ) => {
      setContextMenu({
        isOpen: true,
        position,
        messageId,
        isUserMessage,
      });
    },
    [],
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu({
      isOpen: false,
      position: { x: 0, y: 0 },
      messageId: null,
      isUserMessage: false,
    });
  }, []);

  // Editing actions
  const startEditing = useCallback((messageId: string, text: string) => {
    setEditingMessageId(messageId);
    setEditingText(text);
  }, []);

  const saveEdit = useCallback(() => {
    if (editingMessageId && editingText.trim()) {
      updateMessage(editingMessageId, { text: editingText.trim() });
    }
    setEditingMessageId(null);
    setEditingText("");
  }, [editingMessageId, editingText, updateMessage]);

  const cancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setEditingText("");
  }, []);

  // Regenerate message action
  const regenerateMessage = useCallback(
    (messageId: string) => {
      // Return the message to be regenerated for the parent component to handle
      return messages.find((msg) => msg.id === messageId);
    },
    [messages],
  );

  return {
    // State
    messages,
    inputText,
    setInputText,
    editingMessageId,
    editingText,
    setEditingText,
    contextMenu,
    currentScene,
    setCurrentScene,
    currentModel,
    setCurrentModel,

    // Sheet states
    isChatSettingsOpen,
    setIsChatSettingsOpen,
    isChatOptionsOpen,
    setIsChatOptionsOpen,
    isStartNewChatOpen,
    setIsStartNewChatOpen,
    isParameterSettingsOpen,
    setIsParameterSettingsOpen,
    isSaveMemoriesOpen,
    setIsSaveMemoriesOpen,
    isViewMemoriesOpen,
    setIsViewMemoriesOpen,
    isPersonaSheetOpen,
    setIsPersonaSheetOpen,
    isSceneSheetOpen,
    setIsSceneSheetOpen,
    isModelsSheetOpen,
    setIsModelsSheetOpen,
    isInstructionsSheetOpen,
    setIsInstructionsSheetOpen,
    isGroupChatSheetOpen,
    setIsGroupChatSheetOpen,

    // Actions
    addMessage,
    updateMessage,
    deleteMessage,
    clearMessages,
    openContextMenu,
    closeContextMenu,
    startEditing,
    saveEdit,
    cancelEdit,
    regenerateMessage,
  };
};

export type { Message, Scene };
