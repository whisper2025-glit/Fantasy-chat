'use client';

import React, { useState } from 'react';
import { GenreSelection } from './genre-selection';
import { CharacterDetails } from './character-details';
import { storyGenerator, StorySetup, StoryContext } from '@/lib/story-generator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type SetupStep = 'genre' | 'name' | 'age' | 'gender' | 'generating';

interface StorySetupCoordinatorProps {
  onStoryGenerated: (context: StoryContext) => void;
  onBack: () => void;
}

export function StorySetupCoordinator({ onStoryGenerated, onBack }: StorySetupCoordinatorProps) {
  const [currentStep, setCurrentStep] = useState<SetupStep>('genre');
  const [setup, setSetup] = useState<Partial<StorySetup>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenreSelect = (genre: string) => {
    if (genre === 'archive') {
      // Handle archive selection - for now, go back
      onBack();
      return;
    }
    
    setSetup(prev => ({ ...prev, genre }));
    setCurrentStep('name');
  };

  const handleCharacterDetailsComplete = async (details: { name: string; age: number; gender: string }) => {
    const updatedSetup = { ...setup, ...details };
    setSetup(updatedSetup);

    if (details.name && details.age && details.gender && setup.genre) {
      // All details collected, generate story
      setCurrentStep('generating');
      setIsGenerating(true);
      setError(null);

      try {
        const completeSetup: StorySetup = {
          genre: setup.genre,
          characterName: details.name,
          age: details.age,
          gender: details.gender
        };

        const storyContext = await storyGenerator.generateStoryStart(completeSetup);
        onStoryGenerated(storyContext);
      } catch (err) {
        console.error('Story generation failed:', err);
        setError('Failed to generate story. Please try again.');
        setIsGenerating(false);
        setCurrentStep('genre');
      }
    } else {
      // Move to next step
      if (!details.age) {
        setCurrentStep('age');
      } else if (!details.gender) {
        setCurrentStep('gender');
      }
    }
  };

  const handleStepBack = () => {
    switch (currentStep) {
      case 'name':
        setCurrentStep('genre');
        break;
      case 'age':
        setCurrentStep('name');
        break;
      case 'gender':
        setCurrentStep('age');
        break;
      default:
        setCurrentStep('genre');
    }
  };

  const getCharacterDetailsStep = (): 'name' | 'age' | 'gender' => {
    if (!setup.characterName) return 'name';
    if (!setup.age) return 'age';
    return 'gender';
  };

  if (currentStep === 'generating') {
    return (
      <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
            <div className="w-8 h-8 bg-white rounded-full" />
          </div>
          
          <div className="flex items-center space-x-3 mb-6">
            <Loader2 className="w-6 h-6 animate-spin text-white/60" />
            <span className="text-lg text-white/80">Generating your adventure...</span>
          </div>
          
          <p className="text-white/60 text-center max-w-md">
            Creating a {setup.genre} adventure for {setup.characterName}...
          </p>

          {error && (
            <Card className="mt-8 bg-red-500/10 border-red-500/20">
              <CardContent className="p-4">
                <p className="text-red-200 text-sm">{error}</p>
                <Button
                  onClick={() => {
                    setCurrentStep('genre');
                    setError(null);
                  }}
                  className="mt-3 bg-red-600 hover:bg-red-700"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 'genre') {
    return <GenreSelection onGenreSelect={handleGenreSelect} />;
  }

  return (
    <CharacterDetails
      onComplete={handleCharacterDetailsComplete}
      onBack={handleStepBack}
      step={getCharacterDetailsStep()}
      currentDetails={setup}
    />
  );
}