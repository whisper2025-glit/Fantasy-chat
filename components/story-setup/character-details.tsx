'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft } from 'lucide-react';

interface CharacterDetailsProps {
  onComplete: (details: { name: string; age: number; gender: string }) => void;
  onBack: () => void;
  step: 'name' | 'age' | 'gender';
  currentDetails: { name?: string; age?: number; gender?: string };
}

export function CharacterDetails({ onComplete, onBack, step, currentDetails }: CharacterDetailsProps) {
  const [name, setName] = useState(currentDetails.name || '');
  const [age, setAge] = useState(currentDetails.age || 25);
  const [gender, setGender] = useState(currentDetails.gender || '');

  const handleNext = () => {
    if (step === 'name' && name.trim()) {
      onComplete({ ...currentDetails, name: name.trim() } as any);
    } else if (step === 'age' && age >= 13 && age <= 100) {
      onComplete({ ...currentDetails, age } as any);
    } else if (step === 'gender' && gender) {
      onComplete({ ...currentDetails, gender } as any);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNext();
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'name':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-xl font-light text-white/90 mb-8">
                Enter your character's name...
              </h1>
            </div>
            
            <div className="px-4">
              <Input
                type="text"
                placeholder="Type here..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-transparent border-0 border-b border-white/20 rounded-none text-white text-lg placeholder:text-white/40 focus:border-white/60 focus:ring-0 pb-4"
                autoFocus
              />
            </div>

            {name.trim() && (
              <div className="flex justify-center">
                <Button
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
                >
                  Continue
                </Button>
              </div>
            )}
          </div>
        );

      case 'age':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-xl font-light text-white/90 mb-8">
                How old is {currentDetails.name}?
              </h1>
            </div>
            
            <div className="px-4">
              <Input
                type="number"
                placeholder="Enter age..."
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                onKeyPress={handleKeyPress}
                min="13"
                max="100"
                className="w-full bg-transparent border-0 border-b border-white/20 rounded-none text-white text-lg placeholder:text-white/40 focus:border-white/60 focus:ring-0 pb-4 text-center"
                autoFocus
              />
              <p className="text-white/40 text-sm text-center mt-2">Age 13-100</p>
            </div>

            {age >= 13 && age <= 100 && (
              <div className="flex justify-center">
                <Button
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
                >
                  Continue
                </Button>
              </div>
            )}
          </div>
        );

      case 'gender':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-xl font-light text-white/90 mb-8">
                What is {currentDetails.name}'s gender?
              </h1>
            </div>
            
            <div className="px-4 space-y-4">
              {['Male', 'Female', 'Non-binary', 'Other'].map((option) => (
                <Button
                  key={option}
                  onClick={() => {
                    setGender(option);
                    setTimeout(() => {
                      onComplete({ ...currentDetails, gender: option } as any);
                    }, 100);
                  }}
                  variant="ghost"
                  className="w-full h-14 bg-white/10 hover:bg-white/20 border-0 rounded-xl transition-all duration-200 text-white text-lg"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* Header with back button */}
      <div className="flex-shrink-0 p-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-white/60 hover:text-white p-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full" />
          </div>
          
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 max-w-md mx-auto w-full flex flex-col justify-center">
        {renderContent()}
      </div>
    </div>
  );
}