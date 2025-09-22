// Storage utilities for Personal page data

export interface Creator {
  id: string;
  username: string;
  avatar: string;
  followers: string;
  messages: string;
  newCharacters: number;
  description: string;
  badge?: string;
  characters: Array<{
    id: string;
    title: string;
    subtitle: string;
    image: string;
    creator: string;
  }>;
  followedAt: number;
}

export interface FavoritedCharacter {
  id: string;
  creator: string;
  title: string;
  subtitle: string;
  image: string;
  tags: string[];
  isNSFW: boolean;
  messageCount: string;
  favoritedAt: number;
}

export interface LikedCharacter {
  id: string;
  creator: string;
  title: string;
  subtitle: string;
  image: string;
  tags: string[];
  isNSFW: boolean;
  messageCount: string;
  likedAt: number;
}

export interface LikedMemory {
  id: string;
  title: string;
  messageCount: number;
  roleplay: string;
  user1: string;
  user2: string;
  snippet: string;
  likes: number;
  likedAt: number;
}

// Following creators storage
export const getFollowingCreators = (): Creator[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem("followingCreators");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading following creators:", error);
    return [];
  }
};

export const followCreator = (creator: Creator): void => {
  if (typeof window === "undefined") return;

  try {
    const creators = getFollowingCreators();
    const exists = creators.find((c) => c.id === creator.id);
    if (!exists) {
      creators.push({ ...creator, followedAt: Date.now() });
      localStorage.setItem("followingCreators", JSON.stringify(creators));
      window.dispatchEvent(new Event("followingUpdated"));
    }
  } catch (error) {
    console.error("Error following creator:", error);
  }
};

export const unfollowCreator = (creatorId: string): void => {
  if (typeof window === "undefined") return;

  try {
    const creators = getFollowingCreators();
    const filtered = creators.filter((c) => c.id !== creatorId);
    localStorage.setItem("followingCreators", JSON.stringify(filtered));
    window.dispatchEvent(new Event("followingUpdated"));
  } catch (error) {
    console.error("Error unfollowing creator:", error);
  }
};

// Favorited characters storage
export const getFavoritedCharacters = (): FavoritedCharacter[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem("favoritedCharacters");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading favorited characters:", error);
    return [];
  }
};

export const favoriteCharacter = (character: FavoritedCharacter): void => {
  if (typeof window === "undefined") return;

  try {
    const characters = getFavoritedCharacters();
    const exists = characters.find((c) => c.id === character.id);
    if (!exists) {
      characters.push({ ...character, favoritedAt: Date.now() });
      localStorage.setItem("favoritedCharacters", JSON.stringify(characters));
      window.dispatchEvent(new Event("favoritesUpdated"));
    }
  } catch (error) {
    console.error("Error favoriting character:", error);
  }
};

export const unfavoriteCharacter = (characterId: string): void => {
  if (typeof window === "undefined") return;

  try {
    const characters = getFavoritedCharacters();
    const filtered = characters.filter((c) => c.id !== characterId);
    localStorage.setItem("favoritedCharacters", JSON.stringify(filtered));
    window.dispatchEvent(new Event("favoritesUpdated"));
  } catch (error) {
    console.error("Error unfavoriting character:", error);
  }
};

// Liked characters storage
export const getLikedCharacters = (): LikedCharacter[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem("likedCharacters");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading liked characters:", error);
    return [];
  }
};

export const likeCharacter = (character: LikedCharacter): void => {
  if (typeof window === "undefined") return;

  try {
    const characters = getLikedCharacters();
    const exists = characters.find((c) => c.id === character.id);
    if (!exists) {
      characters.push({ ...character, likedAt: Date.now() });
      localStorage.setItem("likedCharacters", JSON.stringify(characters));
      window.dispatchEvent(new Event("likesUpdated"));
    }
  } catch (error) {
    console.error("Error liking character:", error);
  }
};

export const unlikeCharacter = (characterId: string): void => {
  if (typeof window === "undefined") return;

  try {
    const characters = getLikedCharacters();
    const filtered = characters.filter((c) => c.id !== characterId);
    localStorage.setItem("likedCharacters", JSON.stringify(filtered));
    window.dispatchEvent(new Event("likesUpdated"));
  } catch (error) {
    console.error("Error unliking character:", error);
  }
};

// Liked memories storage
export const getLikedMemories = (): LikedMemory[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem("likedMemories");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading liked memories:", error);
    return [];
  }
};

export const likeMemory = (memory: LikedMemory): void => {
  if (typeof window === "undefined") return;

  try {
    const memories = getLikedMemories();
    const exists = memories.find((m) => m.id === memory.id);
    if (!exists) {
      memories.push({ ...memory, likedAt: Date.now() });
      localStorage.setItem("likedMemories", JSON.stringify(memories));
      window.dispatchEvent(new Event("likesUpdated"));
    }
  } catch (error) {
    console.error("Error liking memory:", error);
  }
};

export const unlikeMemory = (memoryId: string): void => {
  if (typeof window === "undefined") return;

  try {
    const memories = getLikedMemories();
    const filtered = memories.filter((m) => m.id !== memoryId);
    localStorage.setItem("likedMemories", JSON.stringify(memories));
    window.dispatchEvent(new Event("likesUpdated"));
  } catch (error) {
    console.error("Error unliking memory:", error);
  }
};

// Utility functions to check if items are followed/favorited/liked
export const isCreatorFollowed = (creatorId: string): boolean => {
  const creators = getFollowingCreators();
  return creators.some((c) => c.id === creatorId);
};

export const isCharacterFavorited = (characterId: string): boolean => {
  const characters = getFavoritedCharacters();
  return characters.some((c) => c.id === characterId);
};

export const isCharacterLiked = (characterId: string): boolean => {
  const characters = getLikedCharacters();
  return characters.some((c) => c.id === characterId);
};

export const isMemoryLiked = (memoryId: string): boolean => {
  const memories = getLikedMemories();
  return memories.some((m) => m.id === memoryId);
};

// Favorited memories storage
export interface FavoritedMemory {
  id: string;
  title: string;
  description: string;
  characterName: string;
  characterAvatar: string;
  backgroundImage?: string;
  messageCount: number;
  participants: string[];
  tags: string[];
  category: string;
  isPrivate: boolean;
  createdAt: number;
  favoritedAt: number;
  snippet: string;
  roleplay: string;
  user1: string;
  user2: string;
  likes: number;
}

export const getFavoritedMemories = (): FavoritedMemory[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem("favoritedMemories");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading favorited memories:", error);
    return [];
  }
};

export const favoriteMemory = (memory: FavoritedMemory): void => {
  if (typeof window === "undefined") return;

  try {
    const memories = getFavoritedMemories();
    const exists = memories.find((m) => m.id === memory.id);
    if (!exists) {
      memories.push({ ...memory, favoritedAt: Date.now() });
      localStorage.setItem("favoritedMemories", JSON.stringify(memories));
      window.dispatchEvent(new Event("favoritesUpdated"));
    }
  } catch (error) {
    console.error("Error favoriting memory:", error);
  }
};

export const unfavoriteMemory = (memoryId: string): void => {
  if (typeof window === "undefined") return;

  try {
    const memories = getFavoritedMemories();
    const filtered = memories.filter((m) => m.id !== memoryId);
    localStorage.setItem("favoritedMemories", JSON.stringify(filtered));
    window.dispatchEvent(new Event("favoritesUpdated"));
  } catch (error) {
    console.error("Error unfavoriting memory:", error);
  }
};

export const isMemoryFavorited = (memoryId: string): boolean => {
  const memories = getFavoritedMemories();
  return memories.some((m) => m.id === memoryId);
};

// Sample data seeding functions for development/testing (removed)
export const seedSamplePersonalData = (): void => {
  // No mock data - data will come from real sources
};
