// Character context cache for improved AI responses
interface CharacterContext {
  id: string;
  speakingStyle: string;
  keyPhrases: string[];
  emotionalTone: string;
  lastUpdated: number;
}

const characterCache = new Map<string, CharacterContext>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export function getCharacterContext(character: any): CharacterContext {
  const cacheKey = character.name || "unknown";
  const existing = characterCache.get(cacheKey);

  // Return cached version if still valid
  if (existing && Date.now() - existing.lastUpdated < CACHE_DURATION) {
    return existing;
  }

  // Generate new context
  const context = analyzeCharacter(character);
  characterCache.set(cacheKey, context);

  return context;
}

function analyzeCharacter(character: any): CharacterContext {
  const allText = [
    character.greeting || "",
    character.intro || "",
    character.personality || "",
    character.description || "",
  ]
    .join(" ")
    .toLowerCase();

  // Extract key phrases that define the character
  const keyPhrases = extractKeyPhrases(allText);

  // Determine speaking style
  const speakingStyle = analyzeSpeakingStyle(allText);

  // Determine emotional tone
  const emotionalTone = analyzeEmotionalTone(allText);

  return {
    id: character.name || "unknown",
    speakingStyle,
    keyPhrases,
    emotionalTone,
    lastUpdated: Date.now(),
  };
}

function extractKeyPhrases(text: string): string[] {
  const phrases: string[] = [];

  // Scientific/technical terms
  if (text.includes("quantum") || text.includes("scientific")) {
    phrases.push("uses scientific terminology");
  }

  // Personality indicators
  if (text.includes("excited") || text.includes("enthusiastic")) {
    phrases.push("high energy and excitement");
  }

  if (
    text.includes("humor") ||
    text.includes("funny") ||
    text.includes("kidding")
  ) {
    phrases.push("incorporates humor naturally");
  }

  // Setting/environment
  if (text.includes("lab") || text.includes("laboratory")) {
    phrases.push("laboratory setting references");
  }

  if (text.includes("coffee")) {
    phrases.push("mentions coffee frequently");
  }

  return phrases;
}

function analyzeSpeakingStyle(text: string): string {
  let style = "";

  // Punctuation analysis
  const exclamationCount = (text.match(/!/g) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;

  if (exclamationCount > 2) {
    style += "Energetic with frequent exclamations. ";
  }

  if (questionCount > 1) {
    style += "Asks engaging questions. ";
  }

  // Casual vs formal
  if (
    text.includes("hey") ||
    text.includes("wanna") ||
    text.includes("gonna")
  ) {
    style += "Casual, conversational tone. ";
  } else if (text.includes("dr.") || text.includes("professor")) {
    style += "Professional but approachable. ";
  }

  // Action descriptions
  if (text.includes("*") || text.includes("action")) {
    style += "Frequently uses action descriptions. ";
  }

  return style || "Natural conversational style.";
}

function analyzeEmotionalTone(text: string): string {
  if (
    text.includes("excited") ||
    text.includes("amazing") ||
    text.includes("incredible")
  ) {
    return "excited and positive";
  }

  if (text.includes("calm") || text.includes("peaceful")) {
    return "calm and measured";
  }

  if (text.includes("passionate") || text.includes("love")) {
    return "passionate and engaged";
  }

  return "friendly and engaging";
}

// Clear cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, context] of characterCache.entries()) {
    if (now - context.lastUpdated > CACHE_DURATION) {
      characterCache.delete(key);
    }
  }
}, CACHE_DURATION);
