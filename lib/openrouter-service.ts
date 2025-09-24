// OpenRouter AI service for adventure game integration - matches original repository approach
const ADVENTURE_MODELS = [
  'x-ai/grok-4-fast:free',
  'z-ai/glm-4.5-air:free', 
  'deepseek/deepseek-chat-v3.1:free',
  'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
  'moonshotai/kimi-k2:free'
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
    systemPrompt?: string,
    modelIndex: number = 0
  ): Promise<string> {
    const model = ADVENTURE_MODELS[modelIndex % ADVENTURE_MODELS.length];
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
    chatHistory: Array<{role: string, content: string}> = []
  ): Promise<string> {
    const systemPrompt = `You are an AI Game master. Your job is to write what happens next in a player's adventure game.
CRITICAL Rules:
- Write EXACTLY 3 sentences maximum
- Use daily English language
- Start with "You "
- Don't use 'Elara' or 'she/he', only use 'you'
- Use only second person ("you")
- Never include dialogue after the response
- Never continue with additional actions or responses
- Never add follow-up questions or choices
- Never include 'User:' or 'Assistant:' in response
- Never include any note or these kinds of sentences: 'Note from the game master'
- Never use ellipsis (...)
- Never include 'What would you like to do?' or similar prompts
- Always finish with one real response
- Never use 'Your turn' or or anything like conversation starting prompts
- Always end the response with a period(.)

Game Context:
- World: ${gameState.world || 'Ethoria is a realm of seven kingdoms, each founded on distinct moral principles'}
- Kingdom: ${gameState.kingdom || 'Valdor, the Kingdom of Courage'}
- Town: ${gameState.town || 'Ravenhurst, a town of skilled hunters and trappers'}
- Character: ${gameState.character_name || 'Elara Brightshield'}
- Character Description: ${gameState.character_description || 'A sturdy warrior with shining silver armor'}
- Player Level: ${gameState.level || 1}
- Current HP: ${gameState.health || 100}
- Inventory: ${gameState.inventory ? Object.keys(gameState.inventory).join(', ') : 'cloth pants, cloth shirt, goggles, leather bound journal, gold'}`;

    const prompt = `Player action: "${action}"

Generate the next part of the adventure based on this action.`;

    // Try models in sequence for redundancy (like the original repository)
    let modelIndex = 0;
    let maxRetries = ADVENTURE_MODELS.length;
    
    while (maxRetries > 0) {
      try {
        return await this.generateResponse(prompt, systemPrompt, modelIndex);
      } catch (error) {
        console.log(`Model ${ADVENTURE_MODELS[modelIndex]} failed, trying next...`);
        modelIndex = (modelIndex + 1) % ADVENTURE_MODELS.length;
        maxRetries--;
        
        if (maxRetries === 0) {
          throw new Error(`All models failed: ${error}`);
        }
      }
    }
    
    throw new Error('All models exhausted');
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