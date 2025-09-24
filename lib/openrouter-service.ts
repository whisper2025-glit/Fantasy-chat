// OpenRouter AI service for adventure game integration
export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
}

export const ADVENTURE_MODELS: OpenRouterModel[] = [
  {
    id: 'x-ai/grok-4-fast:free',
    name: 'Grok 4 Fast',
    description: 'Fast and efficient model by xAI'
  },
  {
    id: 'z-ai/glm-4.5-air:free', 
    name: 'GLM 4.5 Air',
    description: 'Lightweight model by Zhipu AI'
  },
  {
    id: 'deepseek/deepseek-chat-v3.1:free',
    name: 'DeepSeek Chat V3.1',
    description: 'Advanced conversational model'
  },
  {
    id: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    name: 'Dolphin Mistral 24B',
    description: 'Uncensored model for creative content'
  },
  {
    id: 'moonshotai/kimi-k2:free',
    name: 'Kimi K2',
    description: 'Multimodal AI model'
  }
];

export class OpenRouterService {
  private apiKey: string | null = null;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor() {
    // API key will be set when needed
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(
    prompt: string, 
    model: string = 'x-ai/grok-4-fast:free',
    systemPrompt?: string
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not set');
    }

    const messages: Array<{role: string, content: string}> = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Title': 'WhisperChat Adventure Game'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 300,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response generated';
      
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw new Error(`Failed to generate response: ${error}`);
    }
  }

  async generateAdventureResponse(
    action: string,
    gameState: any,
    model: string = 'x-ai/grok-4-fast:free'
  ): Promise<string> {
    const systemPrompt = `You are an AI Game master for a dungeon adventure game. Your job is to write what happens next in a player's adventure.

CRITICAL Rules:
- Write EXACTLY 3 sentences maximum
- Use simple, clear English
- Start with "You"
- Don't use character names, only use "you" 
- Use only second person ("you")
- Never include dialogue after the response
- Never continue with additional actions
- Never add follow-up questions or choices
- Never include conversation prompts
- Always finish with one complete response
- Always end with a period (.)

Game Context:
- World: ${gameState.world || 'A mystical fantasy realm'}
- Location: ${gameState.location || 'An ancient dungeon'}
- Player Level: ${gameState.level || 1}
- Current HP: ${gameState.health || 100}
- Inventory: ${gameState.inventory ? Object.keys(gameState.inventory).join(', ') : 'basic equipment'}`;

    const prompt = `Player action: "${action}"

Generate the next part of the adventure based on this action.`;

    return this.generateResponse(prompt, model, systemPrompt);
  }

  async checkContentSafety(text: string): Promise<boolean> {
    // Basic safety check - in production, use a proper safety model
    const unsafePatterns = [
      /explicit/i,
      /violence/i, 
      /inappropriate/i
    ];

    // Allow common game actions
    const safeGameActions = [
      /look around/i,
      /examine/i,
      /take/i,
      /use/i,
      /go/i,
      /attack/i,
      /defend/i,
      /inventory/i,
      /status/i,
      /help/i
    ];

    if (safeGameActions.some(pattern => pattern.test(text))) {
      return true;
    }

    return !unsafePatterns.some(pattern => pattern.test(text));
  }
}

export const openRouterService = new OpenRouterService();