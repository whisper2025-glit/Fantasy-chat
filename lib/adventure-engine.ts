// Offline deterministic adventure engine replacing external AI models
import { GameState } from './adventure-types';
import { ETHORIA_WORLD } from './ethoria-data';

export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

class AdventureEngine {
  // Simple regex-based safety check
  private blockedPatterns: RegExp[] = [
    /(suicide|self[-\s]?harm|kill myself|nsfw|porn|sexual|gore|torture)/i,
    /(hate\s*speech|racist|homophobic|genocide)/i,
  ];

  checkContentSafety(input: string): boolean {
    return !this.blockedPatterns.some((re) => re.test(input));
  }

  async generateAdventureResponse(
    action: string,
    state: GameState,
    history: ChatMessage[]
  ): Promise<string> {
    const clean = action.replace(/^(Actions|Story)\s*:\s*/i, '').trim();
    const lower = clean.toLowerCase();

    // Base context
    const who = state.player.name || state.character_name;
    const town = state.town.includes('Ravenhurst') ? 'Ravenhurst' : 'the town';
    const kingdom = state.kingdom.includes('Valdor') ? 'Valdor' : 'the kingdom';
    const area = state.location || ETHORIA_WORLD.startingScenario;

    // Basic command handlers
    if (/^(look|examine|observe)/i.test(lower)) {
      return `${who} takes a careful look around ${area}. The smell of wet pine hangs in the air, and faint tracks in the soil suggest recent passage. The distant bustle of ${town} hums behind you while the wild edges of ${kingdom} whisper ahead.`;
    }

    if (/^(inventory|bag|items)/i.test(lower)) {
      const items = Object.entries(state.player.inventory)
        .map(([k, v]) => `${k} x${v}`)
        .join(', ');
      return `${who} checks the pack. You carry: ${items || 'nothing of note'}. Your health is ${state.player.health}/${state.player.maxHealth} and you feel steady.`;
    }

    if (/^(help|commands)/i.test(lower)) {
      return [
        'You can try actions like: look, go to <place>, talk to <name>, attack <target>, rest, use <item>, inventory.',
        'Be specific to uncover clues or opportunities. “Story: …” continues narration without a concrete action.'
      ].join('\n');
    }

    const goMatch = clean.match(/^(?:go|travel|walk|move)\s+(?:to|towards)?\s*(.+)$/i);
    if (goMatch) {
      const dest = goMatch[1].trim();
      return `${who} sets off toward ${dest}. The path shifts from packed soil to root-woven ground. A hush falls as forest birds grow wary, and the canopy parts just enough to spill a band of pale light guiding the way.`;
    }

    const talkMatch = clean.match(/^(?:talk|speak)\s+(?:to\s+)?(.+)$/i);
    if (talkMatch) {
      const target = talkMatch[1].trim();
      return `${who} approaches ${target}. Voices soften. A brief pause—then measured words trade places with watchful glances. You sense there is more here if you ask the right questions.`;
    }

    const attackMatch = clean.match(/^(?:attack|fight|strike)\s+(.*)$/i);
    if (attackMatch) {
      const target = attackMatch[1].trim() || 'the threat';
      const dmg = Math.floor(Math.random() * 8) + 4;
      return `${who} lunges at ${target}. Steel flashes. The clash rings through ${area}. You weather a glancing blow but press the advantage, dealing a telling strike (${dmg} damage dealt).`;
    }

    const useMatch = clean.match(/^(?:use|consume|drink|equip)\s+(.*)$/i);
    if (useMatch) {
      const item = useMatch[1].trim();
      return `${who} uses ${item}. A subtle shift follows—renewed focus, steadier breath, and a sense that choices open like a fan before you.`;
    }

    if (/^(rest|sleep|camp|recover)/i.test(lower)) {
      return `${who} rests by a quiet stand of trees. Time loosens its grip; aches unwind. You regain a measure of strength and clarity before the road calls again.`;
    }

    // Narrative continuation fallback
    const lastGameBeat = [...history].reverse().find((m) => m.role !== 'user');
    const thread = lastGameBeat?.content || ETHORIA_WORLD.startingScenario;

    const flavor = [
      'Wind combs the treetops with a low, steady breath.',
      'Somewhere ahead, water moves—slow, patient, and cold.',
      'Footprints half-lost to moss hint at a hurried traveler.',
      'A raven regards you, head cocked, then vanishes into the green.',
    ];

    const line = flavor[Math.floor(Math.random() * flavor.length)];

    return [
      `${thread}`,
      '',
      `${who} decides: “${clean}”.`,
      line,
      'The path forward is yours—press on, or change course.'
    ].join('\n');
  }
}

export const adventureEngine = new AdventureEngine();
