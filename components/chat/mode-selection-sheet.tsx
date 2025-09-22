"use client";

import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";

interface ModeSelectionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onModeSelect: (mode: string) => void;
}

interface ModeOption {
  id: string;
  title: string;
  badge?: string;
  features: string[];
  isSelected?: boolean;
  backgroundImage?: string;
}

const ModeSelectionSheet = memo(
  ({ isOpen, onClose, onModeSelect }: ModeSelectionSheetProps) => {
    const [selectedMode, setSelectedMode] = useState<string>("free");

    const modeOptions: ModeOption[] = [
      {
        id: "free",
        title: "Free Model",
        features: [
          "Basic AI conversation",
          "Supports both casual chat and roleplay",
        ],
        isSelected: true,
      },
      {
        id: "roleplay",
        title: "Roleplay",
        badge: "Limited Time Free",
        features: [
          "Great for acting out specific scenarios",
          "Unlock your imagination",
        ],
        backgroundImage:
          "url('https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop')",
      },
      {
        id: "storystream",
        title: "StoryStream",
        badge: "Limited Time Free",
        features: [
          "Step into deeper roleplay",
          "Let characters and plots grow",
        ],
      },
    ];

    const handleModeSelect = (modeId: string) => {
      setSelectedMode(modeId);
    };

    const handleUseMode = () => {
      onModeSelect(selectedMode);
      onClose();
    };

    if (!isOpen) return null;

    return (
      <>
        {/* Modal Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900/95 backdrop-blur-md text-white border-none w-full max-w-md max-h-[75vh] overflow-y-auto shadow-2xl rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-900/95 rounded-t-2xl sticky top-0 z-20">
              <div className="w-6"></div>
              <div className="text-center">
                <h2
                  className="text-white font-semibold leading-tight"
                  style={{ fontSize: "14px", lineHeight: "18px" }}
                  role="dialog"
                  aria-label="Mode selection dialog"
                >
                  Choose the model
                  <br />
                  that suits you best
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-300 p-2 hover:scale-105"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {modeOptions.map((mode, index) => (
                <div
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className={`relative rounded-xl p-4 cursor-pointer transition-all duration-300 min-h-[120px] overflow-hidden ${
                    selectedMode === mode.id
                      ? "border-2 border-blue-500 bg-slate-700/50"
                      : "border border-slate-600/30 bg-slate-700/30 hover:bg-slate-700/50"
                  }`}
                  style={{
                    backgroundImage: mode.backgroundImage,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundBlendMode: "overlay",
                  }}
                >
                  {/* Background overlay for better text readability */}
                  {mode.backgroundImage && (
                    <div className="absolute inset-0 bg-slate-900/70 rounded-xl"></div>
                  )}

                  {/* Selected indicator */}
                  {selectedMode === mode.id && (
                    <div className="absolute top-3 right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center z-10">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div className="relative z-10">
                    {/* Title and Badge */}
                    <div className="flex items-center gap-3 mb-3">
                      <h3
                        className="text-white font-semibold"
                        style={{ fontSize: "14px", lineHeight: "18px" }}
                      >
                        {mode.title}
                      </h3>
                      {mode.badge && (
                        <span
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full font-medium"
                          style={{ fontSize: "10px", lineHeight: "12px" }}
                        >
                          {mode.badge}
                        </span>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      {mode.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-start gap-2"
                        >
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span
                            className="text-slate-300"
                            style={{ fontSize: "12px", lineHeight: "16px" }}
                          >
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Use It Button */}
              <div className="pt-4">
                <Button
                  onClick={handleUseMode}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg"
                  style={{ fontSize: "14px", lineHeight: "18px" }}
                >
                  Use it
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  },
);

ModeSelectionSheet.displayName = "ModeSelectionSheet";
export default ModeSelectionSheet;
