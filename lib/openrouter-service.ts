// OpenRouter AI service for adventure game integration
const ADVENTURE_MODELS = [
  'cognitivecomputations/dolphin-mistral-24b-venice-edition:free'
];

export class OpenRouterService {
  private apiKey: string | null = null;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor() {}

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(
    prompt: string,
    systemPrompt?: string,
    modelIndex: number = 0
  ): Promise<string> {
    const model = ADVENTURE_MODELS[modelIndex % ADVENTURE_MODELS.length];
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not set');
    }

    const messages: Array<{ role: string; content: string }> = [];

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
          max_tokens: 400,
          stream: false
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${text}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'No response generated';

    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw new Error(`Failed to generate response: ${error}`);
    }
  }

  async generateAdventureResponse(
    action: string,
    gameState: any,
    chatHistory: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    const systemPrompt = `You are an AI Game master. Your job is to write what happens next in a player's adventure game.
CRITICAL Rules:
- Write up to 3 sentences.
- Use second person (you) and do not use the player's name.
- Keep output concise and end with a period.`;

    const prompt = `Player action: "${action}"

Game Context:
World: ${gameState.world || 'Ethoria'}
Kingdom: ${gameState.kingdom || 'Valdor'}
Town: ${gameState.town || 'Ravenhurst'}
Character: ${gameState.character_name || 'You'}

Generate the next part of the adventure based on this action.`;

    // Use primary model (only one configured) and return
    return await this.generateResponse(prompt, systemPrompt, 0);
  }

  // Basic safety check (not used by adventure when disabled)
  async checkContentSafety(text: string): Promise<boolean> {
    const unsafePatterns = [ /explicit/i, /violence/i, /inappropriate/i ];
    return !unsafePatterns.some(p => p.test(text));
  }
}

export const openRouterService = new OpenRouterService();
