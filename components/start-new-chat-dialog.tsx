"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";

interface StartNewChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  characterName?: string;
}

export default function StartNewChatDialog({
  isOpen,
  onClose,
  onConfirm,
  characterName,
}: StartNewChatDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-popover/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl overflow-hidden">
        {/* Custom Header with Gradient */}
        <div className="relative bg-muted p-6 -m-6 mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-xl border border-cyan-400/30">
                <MessageCircle className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">
                  Start New Chat
                </DialogTitle>
                <DialogDescription className="text-slate-300 text-sm mt-1">
                  {characterName
                    ? `Begin a fresh conversation with ${characterName}`
                    : "Begin a fresh conversation"}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 px-1">
          <div className="text-center space-y-3">
            <p className="text-slate-300 text-sm leading-relaxed">
              This will clear your current conversation history and start fresh.
              Your previous messages will be saved automatically.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600/50 hover:border-slate-500 rounded-xl transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium shadow-xl hover:shadow-2xl hover:shadow-cyan-500/25 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              {isLoading ? "Starting..." : "Start New Chat"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
