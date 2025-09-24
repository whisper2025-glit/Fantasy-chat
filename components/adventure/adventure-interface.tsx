'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Using regular div for scrolling since ScrollArea component is not available
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Sword, 
  Shield, 
  Heart, 
  Star, 
  Backpack, 
  Map, 
  Settings,
  Send,
  Loader2
} from 'lucide-react';

import { 
  GameState, 
  Player, 
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [gameState.gameHistory]);

  useEffect(() => {
    // Set API key if available
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
      // Check content safety
      const isSafe = await openRouterService.checkContentSafety(userAction);
      if (!isSafe) {
        addMessage('This action was blocked for safety reasons. Please try something else.', 'system');
        return;
      }

      // Generate AI response using the repository's approach
      const response = await openRouterService.generateAdventureResponse(
        userAction, 
        gameState,
        gameState.gameHistory.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      );

      addMessage(response, 'game');

      // Real game mechanics based on repository logic
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
    
    // Item pickup logic (from repository)
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
    
    // Combat logic (from repository)
    if (lowerAction.includes('fight') || lowerAction.includes('attack')) {
      setGameState(prev => {
        const damage = Math.floor(Math.random() * 20 + 5);
        const expGain = Math.floor(Math.random() * 25 + 10);
        const newHealth = Math.max(10, prev.player.health - damage);
        const newExp = prev.player.exp + expGain;
        
        // Level up check
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

    // Healing logic
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
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card border-b">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" size="sm">
            ← Back
          </Button>
          <h1 className="text-xl font-bold">🎮 Adventure Game</h1>
        </div>
        <Button 
          onClick={() => setShowSettings(!showSettings)} 
          variant="outline" 
          size="sm"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Settings Panel - Simplified to match repository approach */}
      {showSettings && (
        <div className="p-4 bg-card border-b">
          <div>
            <label className="text-sm font-medium">OpenRouter API Key:</label>
            <Input
              type="password"
              placeholder="Enter your OpenRouter API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Get your free API key at <a href="https://openrouter.ai" target="_blank" rel="noopener" className="underline">openrouter.ai</a>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              The game uses multiple AI models automatically for the best experience (Grok, GLM, DeepSeek, Dolphin, Kimi)
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Sidebar with Player Stats */}
        <div className="w-80 p-4 bg-card border-r space-y-4">
          {/* Player Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Sword className="w-4 h-4" />
                <span>{gameState.player.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Level {gameState.player.level}</span>
                <Badge variant="outline">{gameState.player.exp}/{gameState.player.expToLevel} XP</Badge>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <Heart className="w-3 h-3 text-red-500" />
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${(gameState.player.health / gameState.player.maxHealth) * 100}%` }}
                  />
                </div>
                <span>{gameState.player.health}/{gameState.player.maxHealth}</span>
              </div>
            </CardContent>
          </Card>

          {/* World Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Map className="w-4 h-4" />
                <span>Current Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-xs"><strong>Kingdom:</strong> Valdor (Courage)</p>
              <p className="text-xs"><strong>Town:</strong> Ravenhurst</p>
              <p className="text-xs text-muted-foreground">{gameState.location}</p>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {Object.entries(gameState.player.skills).map(([skill, level]) => (
                <div key={skill} className="flex justify-between text-xs">
                  <span className="capitalize">{skill}:</span>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: level }, (_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Backpack className="w-4 h-4" />
                <span>Inventory</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {Object.entries(gameState.player.inventory).map(([item, count]) => (
                  <div key={item} className="flex justify-between text-xs">
                    <span className="capitalize">{item}</span>
                    <Badge variant="secondary" className="text-xs">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col">
          {/* Game History */}
          <div className="flex-1 p-4 overflow-y-auto" ref={scrollAreaRef}>
            <div className="space-y-4 max-w-4xl">
              {gameState.gameHistory.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-100 dark:bg-blue-900/20 ml-8' 
                      : message.type === 'game'
                      ? 'bg-muted mr-8'
                      : 'bg-yellow-100 dark:bg-yellow-900/20 text-center'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs">
                        {message.type === 'user' ? 'You' : message.type === 'game' ? 'Game Master' : 'System'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {gameState.isLoading && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm">The Game Master is thinking...</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Input Area */}
          <div className="p-4 bg-card">
            <div className="flex space-x-2">
              <Input
                placeholder="What would you like to do? (e.g., look around, examine door, take sword)"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={gameState.isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleAction} 
                disabled={!currentInput.trim() || gameState.isLoading}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                Quick actions: look around • examine • take item • go north • attack • inventory • help
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}