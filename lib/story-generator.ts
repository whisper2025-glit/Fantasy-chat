// Advanced Story Generator using OpenRouter AI models
import { openRouterService } from './openrouter-service';

export interface StorySetup {
  genre: string;
  characterName: string;
  age: number;
  gender: string;
  customGenre?: string;
}

export interface StoryContext {
  setup: StorySetup;
  worldSetting: string;
  startingScenario: string;
  characters: string[];
  tone: string;
}

const GENRE_SETTINGS = {
  fantasy: {
    worldSetting: "a mystical realm of magic and wonder",
    tone: "epic and adventurous",
    themes: ["magic", "dragons", "ancient prophecies", "mystical creatures"],
    startingLocations: ["enchanted forest", "ancient castle", "magical academy", "dragon's lair"],
  },
  mystery: {
    worldSetting: "a shadowy world of secrets and intrigue",
    tone: "suspenseful and mysterious",
    themes: ["hidden clues", "dark secrets", "investigation", "conspiracy"],
    startingLocations: ["abandoned mansion", "foggy city streets", "old library", "detective's office"],
  },
  zombies: {
    worldSetting: "a post-apocalyptic wasteland overrun by the undead",
    tone: "intense and survival-focused",
    themes: ["survival", "undead hordes", "scarce resources", "human nature"],
    startingLocations: ["abandoned city", "fortified shelter", "empty highway", "zombie-infested mall"],
  },
  apocalyptic: {
    worldSetting: "a world on the brink of or after total destruction",
    tone: "desperate and gritty",
    themes: ["survival", "moral choices", "hope vs despair", "rebuilding"],
    startingLocations: ["ruined city", "underground bunker", "wasteland", "survivor camp"],
  },
  cyberpunk: {
    worldSetting: "a high-tech dystopian future ruled by corporations",
    tone: "dark and technological",
    themes: ["artificial intelligence", "corporate control", "cybernetic enhancement", "digital rebellion"],
    startingLocations: ["neon-lit city", "corporate tower", "underground hacker den", "virtual reality"],
  },
  custom: {
    worldSetting: "a unique world of your imagination",
    tone: "adaptable to your vision",
    themes: ["unique", "creative", "personalized", "original"],
    startingLocations: ["wherever your story begins"],
  }
};

export class StoryGenerator {
  private currentModelIndex: number = 0;

  async generateStoryStart(setup: StorySetup): Promise<StoryContext> {
    const genre = setup.genre.toLowerCase();
    const genreData = GENRE_SETTINGS[genre as keyof typeof GENRE_SETTINGS] || GENRE_SETTINGS.custom;
    
    const worldSetting = setup.customGenre || genreData.worldSetting;
    
    // Create rich context for story generation
    const contextPrompt = `Create an immersive ${setup.genre} adventure story opening.

Character Details:
- Name: ${setup.characterName}
- Age: ${setup.age}
- Gender: ${setup.gender}

Setting: ${worldSetting}
Tone: ${genreData.tone}

Generate a vivid opening scenario (2-3 paragraphs) that:
1. Establishes the world and atmosphere
2. Introduces the character in an engaging situation
3. Sets up an immediate choice or challenge
4. Leaves the player wanting to take action

Make it immersive and compelling.`;

    const systemPrompt = `You are a master storyteller and game master creating engaging interactive adventures. 
Your job is to craft immersive, engaging story openings that draw players into the world.

Guidelines:
- Use vivid, descriptive language
- Create immediate engagement
- Set up interesting choices
- Write in second person (you)
- Keep it concise but compelling (2-3 paragraphs)
- End with a situation that requires player input`;

    try {
      const startingScenario = await openRouterService.generateResponse(
        contextPrompt, 
        systemPrompt, 
        this.currentModelIndex
      );

      const storyContext: StoryContext = {
        setup,
        worldSetting,
        startingScenario,
        characters: [setup.characterName],
        tone: genreData.tone
      };

      // Rotate to next model for variety
      this.currentModelIndex = (this.currentModelIndex + 1) % 3;

      return storyContext;
    } catch (error) {
      console.error('Story generation failed:', error);
      // Fallback to a generic story if API fails
      return this.generateFallbackStory(setup, genreData);
    }
  }

  async generateAdventureResponse(
    action: string, 
    context: StoryContext, 
    history: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    const lastFewMessages = history.slice(-6); // Keep recent context
    
    const contextualPrompt = `Continue this ${context.setup.genre} adventure story.

World: ${context.worldSetting}
Character: ${context.setup.characterName} (${context.setup.gender}, age ${context.setup.age})
Tone: ${context.tone}

Player Action: "${action}"

Recent Story Context:
${lastFewMessages.map(msg => `${msg.role === 'user' ? 'Player' : 'Story'}: ${msg.content}`).join('\n')}

Generate the next part of the story (2-3 sentences) that:
1. Responds to the player's action naturally
2. Advances the plot meaningfully  
3. Maintains the ${context.setup.genre} atmosphere
4. Creates new opportunities for player choices
5. Keeps the ${context.tone} tone`;

    const systemPrompt = `You are an expert game master running a ${context.setup.genre} adventure.
Your responses should be:
- Immersive and atmospheric
- Responsive to player actions
- Encouraging of creative choices
- Rich in sensory details
- 2-3 sentences long
- Written in second person

Keep the story engaging and always give the player something interesting to respond to.`;

    try {
      const response = await openRouterService.generateResponse(
        contextualPrompt,
        systemPrompt, 
        this.currentModelIndex
      );

      // Rotate model for variety
      this.currentModelIndex = (this.currentModelIndex + 1) % 3;
      
      return response;
    } catch (error) {
      console.error('Adventure response generation failed:', error);
      return this.generateFallbackResponse(action, context);
    }
  }

  private generateFallbackStory(setup: StorySetup, genreData: any): StoryContext {
    const fallbackScenarios = {
      fantasy: `You are ${setup.characterName}, a ${setup.age}-year-old ${setup.gender} standing at the edge of an enchanted forest. Ancient magic pulses through the air around you, and strange lights flicker between the towering trees. A worn stone path disappears into the mysterious depths ahead, while behind you lies the safety of your village. The wind carries whispers of both opportunity and danger.`,
      mystery: `You are ${setup.characterName}, a ${setup.age}-year-old ${setup.gender} private investigator. The rain pounds against your office window as you examine the strange letter that arrived this morning. It contains only an address, a time - midnight tonight - and a single cryptic line: "The truth about your past awaits." Your hand trembles slightly as you consider your options.`,
      zombies: `You are ${setup.characterName}, a ${setup.age}-year-old ${setup.gender} survivor in a world gone mad. Three weeks since the outbreak began, you've managed to stay alive by staying smart and staying hidden. But now your supplies are running low, and the abandoned grocery store across the street might hold salvation - or death. The undead roam the streets, but you've spotted a possible way in.`,
      apocalyptic: `You are ${setup.characterName}, a ${setup.age}-year-old ${setup.gender} wandering the wasteland that was once civilization. The nuclear winter has lasted months, but today you've stumbled upon something impossible: a pristine vault entrance, its door slightly ajar. Warm light spills from within, and you can hear the faint hum of working machinery. Is this sanctuary, or another trap?`,
      cyberpunk: `You are ${setup.characterName}, a ${setup.age}-year-old ${setup.gender} data thief in Neo-Tokyo 2087. The corporate towers stretch endlessly into the smog-choked sky above, while below, the neon-lit streets pulse with digital life. Your neural implant chimes with an incoming message: a job offer that could set you up for life, or get you killed. The chrome and concrete jungle awaits your decision.`,
      custom: `You are ${setup.characterName}, a ${setup.age}-year-old ${setup.gender} in a world where anything is possible. Your unique journey is about to begin, shaped by your choices and limited only by your imagination. The path ahead is unwritten, waiting for your first decision to set the story in motion.`
    };

    const scenario = fallbackScenarios[setup.genre.toLowerCase() as keyof typeof fallbackScenarios] || fallbackScenarios.custom;

    return {
      setup,
      worldSetting: genreData.worldSetting,
      startingScenario: scenario,
      characters: [setup.characterName],
      tone: genreData.tone
    };
  }

  private generateFallbackResponse(action: string, context: StoryContext): string {
    const responses = [
      `Your action has consequences that ripple through ${context.worldSetting}. As you ${action.toLowerCase()}, the world responds in unexpected ways.`,
      `The ${context.setup.genre} world reacts to your decision. Your choice to ${action.toLowerCase()} opens new possibilities.`,
      `In this ${context.tone} adventure, your actions matter. As you proceed, new challenges and opportunities emerge.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  getGenreOptions() {
    return [
      { id: 'fantasy', name: 'Fantasy', description: 'Magic, dragons, and mystical adventures' },
      { id: 'mystery', name: 'Mystery', description: 'Solve puzzles and uncover dark secrets' },
      { id: 'zombies', name: 'Zombies', description: 'Survive the undead apocalypse' },
      { id: 'apocalyptic', name: 'Apocalyptic', description: 'Navigate a world in ruins' },
      { id: 'cyberpunk', name: 'Cyberpunk', description: 'High-tech dystopian future' },
      { id: 'custom', name: 'Custom', description: 'Create your own unique world' }
    ];
  }
}

export const storyGenerator = new StoryGenerator();