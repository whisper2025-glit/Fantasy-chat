'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface GenreOption {
  id: string;
  name: string;
  description: string;
  number: number;
}

interface GenreSelectionProps {
  onGenreSelect: (genre: string) => void;
}

export function GenreSelection({ onGenreSelect }: GenreSelectionProps) {
  const genres: GenreOption[] = [
    { id: 'fantasy', name: 'Fantasy', description: 'Magic, dragons, and mystical adventures', number: 1 },
    { id: 'mystery', name: 'Mystery', description: 'Solve puzzles and uncover dark secrets', number: 2 },
    { id: 'zombies', name: 'Zombies', description: 'Survive the undead apocalypse', number: 3 },
    { id: 'apocalyptic', name: 'Apocalyptic', description: 'Navigate a world in ruins', number: 4 },
    { id: 'cyberpunk', name: 'Cyberpunk', description: 'High-tech dystopian future', number: 5 },
    { id: 'custom', name: 'Custom', description: 'Create your own unique world', number: 6 },
    { id: 'archive', name: 'Archive', description: 'Browse your previous adventures', number: 7 }
  ];

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-6">
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 max-w-md mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-normal text-white/90 text-left">
            Pick a setting...
          </h1>
        </div>

        <div className="space-y-3">
          {genres.map((genre) => (
            <Button
              key={genre.id}
              onClick={() => onGenreSelect(genre.id)}
              variant="ghost"
              className="w-full h-16 bg-white/10 hover:bg-white/20 border-0 rounded-xl transition-all duration-200 group"
            >
              <div className="flex items-center justify-between w-full px-4">
                <div className="flex items-center space-x-4">
                  <span className="text-white/60 text-lg font-light">
                    {genre.number}
                  </span>
                  <span className="text-white text-lg font-medium">
                    {genre.name}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}