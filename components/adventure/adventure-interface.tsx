'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Sword, 
  Heart, 
  Star, 
  Backpack, 
  Map, 
  Settings,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { 
  GameState, 
  GameMessage
} from '@/lib/adventure-types';
import { openRouterService } from '@/lib/openrouter-service';
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
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isInfoSidebarOpen, setIsInfoSidebarOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [gameState.gameHistory]);

  useEffect(() => {
    if (apiKey) {
      openRouterService.setApiKey(apiKey);
    }
  }, [apiKey]);

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
    if (!apiKey) {
      alert('Please set your OpenRouter API key in settings first!');
      setShowSettings(true);
      return;
    }

    const userAction = currentInput.trim();
    addMessage(userAction, 'user');
    setCurrentInput('');
    
    setGameState(prev => ({ ...prev, isLoading: true }));

    try {
      const isSafe = await openRouterService.checkContentSafety(userAction);
      if (!isSafe) {
        addMessage('This action was blocked for safety reasons. Please try something else.', 'system');
        return;
      }

      const response = await openRouterService.generateAdventureResponse(
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

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <div className="flex-shrink-0 bg-card/95 backdrop-blur-xl border-b border-border px-6 py-4 z-30 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Button 
              onClick={onBack} 
              variant="ghost"
              className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted/50 rounded-lg"
            >
              ← Back
            </Button>
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg"></div>
                <div className="relative z-10 flex items-center justify-center w-full h-full">
                  <Sword className="w-6 h-6 text-black" />
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-300 rounded-full opacity-70"></div>
                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-60"></div>
              </div>
              <h1 className="text-white font-semibold text-lg">Ethoria Adventure</h1>
            </div>
          </div>
          <Button 
            onClick={() => setShowSettings(!showSettings)} 
            variant="ghost"
            className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted/50 rounded-lg"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {showSettings && (
        <div className="bg-card/95 backdrop-blur-xl border-b border-border p-6 shadow-lg">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-white">Game Configuration</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">OpenRouter API Key</label>
                <Input
                  type="password"
                  placeholder="Enter your OpenRouter API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-muted/70 border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Get your free API key at{' '}
                    <a 
                      href="https://openrouter.ai" 
                      target="_blank" 
                      rel="noopener" 
                      className="text-blue-400 hover:text-blue-300 underline transition-colors"
                    >
                      openrouter.ai
                    </a>
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-xs text-muted-foreground">
                      Multi-model AI system active: Grok • GLM • DeepSeek • Dolphin • Kimi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Info Sidebar: Current Location, Skills, Inventory */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-card/95 backdrop-blur-xl border-r border-border transform transition-transform duration-300 z-40 shadow-2xl ${isInfoSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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

          {/* Skills */}
          <Card className="bg-muted/70 border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center shadow-md">
                  <Star className="w-4 h-4 text-black" />
                </div>
                <span className="text-foreground font-semibold">Skills</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(gameState.player.skills).map(([skill, level]) => (
                <div key={skill} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground capitalize">{skill}</span>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${
                            i < (level as number)
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-muted-foreground/30'
                          } transition-colors`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
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
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                {Object.entries(gameState.player.inventory).map(([item, count]) => (
                  <div key={item} className="flex justify-between items-center p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                    <span className="text-xs text-foreground capitalize">{item.replace(/([A-Z])/g, ' $1')}</span>
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-cyan-400/20 to-blue-500/20 text-cyan-300 border-cyan-500/30 text-xs"
                    >
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edge toggle button that hugs the left screen edge or drawer edge */}
      <div className={`fixed top-1/2 transform -translate-y-1/2 z-50 ${isInfoSidebarOpen ? 'left-80' : 'left-0'}`}>
        <button
          aria-label={isInfoSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          onClick={() => setIsInfoSidebarOpen(v => !v)}
          className="bg-card/90 backdrop-blur border border-border rounded-r-xl p-2 hover:bg-muted transition-colors shadow-lg"
        >
          {isInfoSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 flex">
        {/* Main Game Area */}
        <div className="flex-1 flex flex-col bg-background">
          <div className="flex-1 p-6 overflow-y-auto scroll-container scrollbar-thin" ref={scrollAreaRef}>
            <div className="space-y-4 max-w-4xl">
              {gameState.gameHistory.map((message) => (
                <div key={message.id} className="animate-fadeIn">
                  <div className={`p-4 rounded-xl backdrop-blur-sm border transition-all duration-300 hover:shadow-lg ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20 ml-12 shadow-blue-500/10' 
                      : message.type === 'game'
                      ? 'bg-muted/50 border-border mr-12 shadow-lg'
                      : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20 text-center shadow-amber-500/10'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-medium ${
                          message.type === 'user' 
                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' 
                            : message.type === 'game'
                            ? 'bg-green-500/10 text-green-300 border-green-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {message.type === 'user' ? '⚡ You' : message.type === 'game' ? '🎲 Game Master' : '⚙️ System'}
                      </Badge>
                      <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                      {message.content}
                    </p>
                  </div>
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

          <div className="bg-card/95 backdrop-blur-xl border-t border-border p-6 shadow-xl">
            <div className="max-w-4xl space-y-4">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <Input
                    placeholder="What would you like to do? (e.g., look around, examine door, take sword)"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={gameState.isLoading}
                    className="bg-muted/70 border-border text-foreground placeholder:text-muted-foreground pr-12 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Badge variant="secondary" className="text-xs bg-gradient-to-r from-cyan-400/10 to-blue-500/10 text-cyan-300">
                      Enter ↵
                    </Badge>
                  </div>
                </div>
                <Button 
                  onClick={handleAction} 
                  disabled={!currentInput.trim() || gameState.isLoading}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {['look around', 'examine', 'take item', 'go north', 'attack', 'inventory', 'help'].map((action) => (
                  <Button
                    key={action}
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentInput(action)}
                    className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
