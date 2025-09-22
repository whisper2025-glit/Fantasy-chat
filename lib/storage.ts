import type { Character } from "./types";

export const getCharacters = (): Character[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem("characters");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading characters:", error);
    return [];
  }
};

export const saveCharacter = (character: Character): void => {
  if (typeof window === "undefined") return;

  try {
    const characters = getCharacters();
    characters.push(character);
    localStorage.setItem("characters", JSON.stringify(characters));
    window.dispatchEvent(new Event("charactersUpdated"));
  } catch (error) {
    console.error("Error saving character:", error);
  }
};

export const updateCharacter = (
  id: string,
  updates: Partial<Character>,
): void => {
  if (typeof window === "undefined") return;

  try {
    const characters = getCharacters();
    const index = characters.findIndex((c) => c.id === id);
    if (index !== -1) {
      characters[index] = { ...characters[index], ...updates };
      localStorage.setItem("characters", JSON.stringify(characters));
      window.dispatchEvent(new Event("charactersUpdated"));
    }
  } catch (error) {
    console.error("Error updating character:", error);
  }
};

export const deleteCharacter = (id: string): void => {
  if (typeof window === "undefined") return;

  try {
    const characters = getCharacters();
    const filtered = characters.filter((c) => c.id !== id);
    localStorage.setItem("characters", JSON.stringify(filtered));
    window.dispatchEvent(new Event("charactersUpdated"));
  } catch (error) {
    console.error("Error deleting character:", error);
  }
};

// Get only public characters (for main feed, explore page, etc.)
export const getPublicCharacters = (): Character[] => {
  if (typeof window === "undefined") return [];

  try {
    const characters = getCharacters();
    return characters.filter((char) => char.visibility === "public");
  } catch (error) {
    console.error("Error loading public characters:", error);
    return [];
  }
};

// Get private characters for a specific user (by creator name)
export const getPrivateCharacters = (creatorName: string): Character[] => {
  if (typeof window === "undefined") return [];

  try {
    const characters = getCharacters();
    return characters.filter(
      (char) => char.visibility === "private" && char.creator === creatorName,
    );
  } catch (error) {
    console.error("Error loading private characters:", error);
    return [];
  }
};

// Get public characters for a specific user (by creator name)
export const getPublicCharactersByCreator = (
  creatorName: string,
): Character[] => {
  if (typeof window === "undefined") return [];

  try {
    const characters = getCharacters();
    return characters.filter(
      (char) => char.visibility === "public" && char.creator === creatorName,
    );
  } catch (error) {
    console.error("Error loading public characters by creator:", error);
    return [];
  }
};
