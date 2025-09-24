'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Backpack,
  Map,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { 
  GameState, 
  GameMessage
} from '@/lib/adventure-types';
import { adventureEngine } from '@/lib/adventure-engine';
import { ETHORIA_WORLD, STARTING_PLAYER, STARTING_LOCATION } from '@/lib/ethoria-data';

interface AdventureInterfaceProps {
  onBack: () => void;
}

export function AdventureInterface({ onBack }: AdventureInterfaceProps) {
  const [gameState, setGameState] = useState<GameState>({
    player: STARTING_PLAYER,
    world: ETHORIA_WORLD.description,
    kingdom: ETHORIA_WORLD.kingdoms.Valdor.description,
    town: ETHORIA_WORLD.kingdoms.Valdor.towns.Ravenhurst.description,
    character_name: STARTING_PLAYER.name,
    character_description: ETHORIA_WORLD.kingdoms.Valdor.towns.Ravenhurst.npcs["Elara Brightshield"].description,
    location: STARTING_LOCATION.area,
    completedQuests: [],
    gameHistory: [{
      id: '1',
      type: 'system',
      content: ETHORIA_WORLD.startingScenario,
      timestamp: new Date()
    }],
    isLoading: false
  });
  const [currentInput, setCurrentInput] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [isInfoSidebarOpen, setIsInfoSidebarOpen] = useState(false);

  // Turn composer behavior
  type TurnMode = 'actions' | 'story';
  const [turnMode, setTurnMode] = useState<TurnMode>('actions');
  const [isModeSliderOpen, setIsModeSliderOpen] = useState(false);

  const MODES: TurnMode[] = ['actions', 'story'];
  const MODE_LABEL: Record<TurnMode, string> = {
    actions: 'Actions',
    story: 'Story',
  };
  const MODE_PLACEHOLDER: Record<TurnMode, string> = {
    actions: 'What do you do or say?',
    story: 'Continue the story…',
  };
  const stepMode = (delta: number) => {
    const idx = MODES.indexOf(turnMode);
    const next = (idx + delta + MODES.length) % MODES.length;
    setTurnMode(MODES[next]);
  };

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [gameState.gameHistory]);


  const addMessage = (content: string, type: 'user' | 'game' | 'system') => {
    const newMessage: GameMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };

    setGameState(prev => ({
      ...prev,
      gameHistory: [...prev.gameHistory, newMessage]
    }));
  };

  const handleAction = async () => {
    if (!currentInput.trim()) return;

    const prefixMap: Record<TurnMode, string> = {
      actions: 'Actions',
      story: 'Story',
    };
    const userAction = `${prefixMap[turnMode]}: ${currentInput.trim()}`;
    addMessage(userAction, 'user');
    setCurrentInput('');

    setGameState(prev => ({ ...prev, isLoading: true }));

    try {
      const isSafe = adventureEngine.checkContentSafety(userAction);
      if (!isSafe) {
        addMessage('This action was blocked for safety reasons. Please try something else.', 'system');
        return;
      }

      const response = await adventureEngine.generateAdventureResponse(
        userAction, 
        gameState,
        gameState.gameHistory.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      );

      addMessage(response, 'game');

      updateGameState(userAction);

    } catch (error) {
      console.error('Adventure error:', error);
      addMessage('Something went wrong. Please try again.', 'system');
    } finally {
      setGameState(prev => ({ ...prev, isLoading: false }));
      setShowComposer(false);
    }
  };

  const updateGameState = (action: string) => {
    const lowerAction = action.toLowerCase();
    
    if (lowerAction.includes('take') || lowerAction.includes('pick up')) {
      const itemMatch = action.match(/take|pick up (.*)/i);
      if (itemMatch) {
        const item = itemMatch[1].toLowerCase();
        setGameState(prev => ({
          ...prev,
          player: {
            ...prev.player,
            inventory: {
              ...prev.player.inventory,
              [item]: (prev.player.inventory[item] || 0) + 1
            }
          }
        }));
      }
    }
    
    if (lowerAction.includes('fight') || lowerAction.includes('attack')) {
      setGameState(prev => {
        const damage = Math.floor(Math.random() * 20 + 5);
        const expGain = Math.floor(Math.random() * 25 + 10);
        const newHealth = Math.max(10, prev.player.health - damage);
        const newExp = prev.player.exp + expGain;
        
        let newLevel = prev.player.level;
        let expToLevel = prev.player.expToLevel;
        if (newExp >= expToLevel) {
          newLevel += 1;
          expToLevel = Math.floor(expToLevel * 1.5);
        }
        
        return {
          ...prev,
          player: {
            ...prev.player,
            health: newHealth,
            exp: newExp % expToLevel,
            level: newLevel,
            expToLevel: expToLevel
          }
        };
      });
    }

    if (lowerAction.includes('heal') || lowerAction.includes('rest')) {
      setGameState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          health: Math.min(prev.player.maxHealth, prev.player.health + 20)
        }
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAction();
    }
  };

  const getItemEmoji = (name: string) => {
    const key = name.toLowerCase();
    const EMOJI_MAP: Record<string, string> = {
      sword: '🗡️',
      shield: '🛡️',
      potion: '🧪',
      pickaxe: '⛏️',
      ore: '⛏️',
      key: '🗝️',
      gold: '🪙',
      coin: '🪙',
      gem: '💎',
      map: '🗺️',
      bow: '🏹',
      axe: '🪓',
      food: '🍖',
      apple: '🍎',
      torch: '🔥',
      book: '📜',
      scroll: '📜',
      armor: '🥋'
    };
    for (const k of Object.keys(EMOJI_MAP)) {
      if (key.includes(k)) return EMOJI_MAP[k];
    }
    return '❔';
  };

  const SKILL_LIST: { name: string; pct: number }[] = [
    { name: 'Dragon eyes', pct: 25.1 },
    { name: 'Heightened Senses', pct: 43.2 },
    { name: 'Foresight', pct: 1.0 },
    { name: 'Physical Resistance', pct: 30.1 },
    { name: 'Combat Will', pct: 25.5 },
    { name: "Bathory's Vampiric Dagger", pct: 15.5 },
    { name: 'Flame Infusion', pct: 52.1 },
    { name: 'Shunpo', pct: 39.1 },
    { name: 'Magic Circulation', pct: 18.2 },
  ];

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <div className="flex-shrink-0 sticky top-0 bg-card/95 backdrop-blur-xl border-b border-border px-6 py-4 z-30 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Button 
              onClick={onBack} 
              variant="ghost"
              className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted/50 rounded-lg"
            >
              ← Back
            </Button>
            <div className="flex items-center" />
          </div>
        </div>
      </div>


      {/* Slide-out Info Sidebar: Current Location, Skills, Inventory */}
      <div className={`fixed top-0 left-0 h-full overflow-y-auto w-72 bg-card/95 backdrop-blur-xl border-r border-border transform transition-transform duration-300 z-40 shadow-2xl ${isInfoSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 space-y-6">
          {/* Current Location */}
          <Card className="bg-muted/70 border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                  <Map className="w-4 h-4 text-black" />
                </div>
                <span className="text-foreground font-semibold">Current Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Kingdom:</span>
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-300 border-blue-500/30">
                    Valdor (Courage)
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Town:</span>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-300 border-green-500/30">
                    Ravenhurst
                  </Badge>
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground italic">{gameState.location}</p>
              </div>
            </CardContent>
          </Card>

          {/* Status Panel (Player, Nature, Stats, Skill) */}
          <Card className="bg-muted/70 border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="space-y-3 text-[9px] text-white/90">
              <div className="mb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">User status</span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-semibold">Player</span>
                  <div className="inline-block px-2 py-1 text-sm rounded-md bg-muted/40 border border-border text-white/90">
                    {gameState.player.name}
                  </div>
                </div>
              </div>

              {/* Nature */}
              <div className="flex items-center gap-3">
                <span className="font-semibold">Nature</span>
                <div className="px-3 py-1 rounded-md bg-muted/40 border border-white/10 text-white/90">
                  Cold Blooded, Adamantine Physique
                </div>
              </div>

              {/* Stat rows */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Strength</span>
                  <div className="px-3 py-1 rounded-md bg-slate-800/40 border border-sky-500/20 text-white">
                    235 <span className="text-sky-400">(+23)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-start">
                  <span className="font-semibold">Agility</span>
                  <div className="px-3 py-1 rounded-md bg-slate-800/40 border border-sky-500/20 text-white">
                    245 <span className="text-sky-400">(+29)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Health</span>
                  <div className="px-3 py-1 rounded-md bg-slate-800/40 border border-sky-500/20 text-white">
                    239 <span className="text-sky-400">(+14)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Magic</span>
                  <div className="px-3 py-1 rounded-md bg-slate-800/40 border border-sky-500/20 text-white">
                    320 <span className="text-sky-400">(+22)</span>
                  </div>
                </div>
              </div>

              {/* Skill list */}
              <div className="pt-1">
                <span className="font-semibold">Skill</span>
                <div className="mt-2 rounded-lg bg-slate-800/30 border border-white/10 p-3 max-h-48 overflow-y-auto">
                  <ul className="space-y-1 leading-[14px]">
                    {SKILL_LIST.map((s) => (
                      <li key={s.name} className="flex items-start justify-between">
                        <span className="pr-2">{s.name}</span>
                        <span>({s.pct.toFixed(1)}%)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card className="bg-muted/70 border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                  <Backpack className="w-4 h-4 text-black" />
                </div>
                <span className="text-foreground font-semibold">Inventory</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const items = Object.entries(gameState.player.inventory)
                  .flatMap(([name, count]) => Array.from({ length: count }, () => name));
                const slots = Array.from({ length: 20 }, (_, i) => items[i] ?? null);
                return (
                  <div className="max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                    <div className="grid grid-cols-4 gap-2">
                      {slots.map((name, i) => (
                        <div
                          key={i}
                          className={`relative aspect-square rounded-md border border-border ${name ? 'bg-muted/60 hover:bg-muted' : 'bg-muted/30'} flex items-center justify-center text-lg select-none transition-colors`}
                        >
                          {name ? (
                            <span title={name} aria-label={name}>{getItemEmoji(name)}</span>
                          ) : (
                            <span className="text-muted-foreground/30">��</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edge toggle button that hugs the left screen edge or drawer edge */}
      <div className={`fixed top-1/2 transform -translate-y-1/2 z-50 ${isInfoSidebarOpen ? 'left-72' : 'left-0'}`}>
        <button
          aria-label={isInfoSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          onClick={() => setIsInfoSidebarOpen(v => !v)}
          className="bg-card/90 backdrop-blur rounded-r-lg p-1 hover:bg-muted/80 transition-colors shadow-md outline-none focus:outline-none focus:ring-0 active:scale-95"
        >
          {isInfoSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 min-h-0 flex">
        {/* Main Game Area */}
        <div className="flex-1 min-h-0 flex flex-col bg-background">
          <div className="flex-1 p-6 overflow-y-auto scroll-container scrollbar-thin" ref={scrollAreaRef}>
            <div className="space-y-6 w-full">
              {gameState.gameHistory.map((message) => (
                <div key={message.id} className="animate-fadeIn">
                  {message.type === 'user' ? (
                    <div className="w-full">
                      <p className="border-l-2 border-blue-500/40 pl-3 text-base leading-relaxed whitespace-pre-wrap text-muted-foreground italic">
                        {message.content.replace(/^(Actions|Story)\s*:\s*/i, '')}
                      </p>
                    </div>
                  ) : message.type === 'game' ? (
                    <p className="text-base leading-relaxed whitespace-pre-wrap w-full">
                      {message.content}
                    </p>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground text-center w-full">
                      {message.content}
                    </p>
                  )}
                </div>
              ))}
              {gameState.isLoading && (
                <div className="animate-fadeIn">
                  <div className="flex items-center justify-center p-6 bg-muted/30 rounded-xl backdrop-blur-sm border border-border">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-black animate-spin" />
                      </div>
                      <span className="text-sm text-muted-foreground">The Game Master is weaving your story...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card/95 backdrop-blur-xl border-t border-border p-3 shadow-xl">
            <div className="w-full">
              {showComposer ? (
                <div className="flex items-end gap-3">
                  <div className="flex-1 relative w-full">
                    {/* Mode pill and slider */}
                    <div className="absolute -top-12 left-0">
                      <div className="flex items-center gap-2 bg-card/90 border border-border rounded-xl px-2 py-1 shadow-md">
                          {isModeSliderOpen ? (
                          <div className="flex items-center gap-2">
                            {MODES.map((m) => (
                              <button
                                key={m}
                                onClick={() => { setTurnMode(m); setIsModeSliderOpen(false); }}
                                className={`px-3 py-1 rounded-md text-sm border ${
                                  m === turnMode
                                    ? 'bg-muted/80 border-white/20 text-white'
                                    : 'bg-transparent border-transparent text-muted-foreground hover:bg-muted/40'
                                }`}
                              >
                                {MODE_LABEL[m]}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              aria-label="Previous mode"
                              onClick={() => stepMode(-1)}
                              className="p-1 rounded-md hover:bg-muted/60"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              aria-label="Toggle mode slider"
                              onClick={() => setIsModeSliderOpen(true)}
                              className="px-3 py-1 rounded-md text-sm bg-muted/60 hover:bg-muted border border-white/10"
                            >
                              {MODE_LABEL[turnMode]}
                            </button>
                            <button
                              aria-label="Next mode"
                              onClick={() => stepMode(1)}
                              className="p-1 rounded-md hover:bg-muted/60"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <Textarea
                      placeholder={MODE_PLACEHOLDER[turnMode]}
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      disabled={gameState.isLoading}
                      className="bg-muted/70 border-border text-foreground placeholder:text-muted-foreground pr-20 py-3 text-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all min-h-[160px] w-full"
                    />
                    <div className="absolute right-3 bottom-2 flex items-center gap-2">
                      <button
                        onClick={handleAction}
                        disabled={!currentInput.trim() || gameState.isLoading}
                        aria-label="Send"
                        className="flex items-center justify-center w-9 h-9 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transition-all duration-200"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => { setTurnMode('actions'); setIsModeSliderOpen(false); setShowComposer(true); }}
                    className="flex-1 h-10 bg-muted/60 hover:bg-muted text-foreground border border-white/10"
                    variant="secondary"
                  >
                    TAKE A TURN
                  </Button>
                  <Button
                    onClick={() => { setCurrentInput('continue'); setTimeout(() => handleAction(), 0); }}
                    className="flex-1 h-10 bg-muted/60 hover:bg-muted text-foreground border border-white/10"
                    variant="secondary"
                  >
                    CONTINUE
                  </Button>
                  <Button
                    onClick={() => { setCurrentInput('retry'); setTimeout(() => handleAction(), 0); }}
                    className="flex-1 h-10 bg-muted/60 hover:bg-muted text-foreground border border-white/10"
                    variant="secondary"
                  >
                    RETRY
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
