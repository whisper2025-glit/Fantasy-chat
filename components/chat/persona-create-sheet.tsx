"use client";

import type React from "react";

import { memo, useState, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight, Plus, Upload } from "lucide-react";

interface PersonaCreateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onPersonaCreated: (persona: Persona) => void;
}

interface Persona {
  id: string;
  name: string;
  age: string;
  image?: string;
  likes: string;
  dislikes: string;
  additional: string;
  isDefault: boolean;
}

const PersonaCreateSheet = memo(
  ({ isOpen, onClose, onPersonaCreated }: PersonaCreateSheetProps) => {
    const [formData, setFormData] = useState<Omit<Persona, "id">>({
      name: "",
      age: "",
      image: "",
      likes: "",
      dislikes: "",
      additional: "",
      isDefault: false,
    });

    // Ref for the hidden file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateFormData = (
      field: keyof typeof formData,
      value: string | boolean,
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Handle image file selection
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          updateFormData("image", reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSavePersona = () => {
      const newPersona: Persona = {
        id: Date.now().toString(),
        ...formData,
      };
      onPersonaCreated(newPersona);
      onClose();
      // Reset form
      setFormData({
        name: "",
        age: "",
        image: "",
        likes: "",
        dislikes: "",
        additional: "",
        isDefault: false,
      });
    };

    const handleCancel = () => {
      onClose();
      // Reset form
      setFormData({
        name: "",
        age: "",
        image: "",
        likes: "",
        dislikes: "",
        additional: "",
        isDefault: false,
      });
    };

    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent
          side="bottom"
          className="bg-slate-900/95 backdrop-blur-md text-white border-none h-[90vh] overflow-y-auto p-0 shadow-2xl rounded-t-3xl"
        >
          <SheetHeader>
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/50 rounded-t-3xl">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-700/50 transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
              <SheetTitle className="text-white text-sm font-semibold">
                Create Persona
              </SheetTitle>
              <div className="w-10"></div>
            </div>
          </SheetHeader>

          <div className="p-4">
            <div className="space-y-4">
              {/* Profile Image Uploader */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div
                    className="w-16 h-16 bg-slate-700/50 border border-slate-600/30 rounded-full flex items-center justify-center cursor-pointer hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formData.image ? (
                      <img
                        src={formData.image || "/placeholder.svg"}
                        alt="Persona"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Upload className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer shadow-lg shadow-cyan-500/20">
                    <Plus className="w-3 h-3 text-white" />
                  </div>
                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-cyan-400 text-xs font-medium mb-2">
                  Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="Enter persona name"
                  className="bg-slate-700/50 border-slate-600/30 text-white text-xs focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-cyan-400 text-xs font-medium mb-2">
                  Age *
                </label>
                <Input
                  value={formData.age}
                  onChange={(e) => updateFormData("age", e.target.value)}
                  placeholder="Enter age"
                  className="bg-slate-700/50 border-slate-600/30 text-white text-xs focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300"
                />
              </div>

              {/* Likes */}
              <div>
                <label className="block text-cyan-400 text-xs font-medium mb-2">
                  Likes
                </label>
                <Textarea
                  value={formData.likes}
                  onChange={(e) => updateFormData("likes", e.target.value)}
                  placeholder="What does this persona like? (e.g., Reading, Gaming, Coffee)"
                  className="bg-slate-700/50 border-slate-600/30 text-white h-20 resize-none text-xs focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300"
                />
              </div>

              {/* Dislikes */}
              <div>
                <label className="block text-cyan-400 text-xs font-medium mb-2">
                  Dislikes
                </label>
                <Textarea
                  value={formData.dislikes}
                  onChange={(e) => updateFormData("dislikes", e.target.value)}
                  placeholder="What does this persona dislike? (e.g., Loud noises, Crowds)"
                  className="bg-slate-700/50 border-slate-600/30 text-white h-20 resize-none text-xs focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300"
                />
              </div>

              {/* Additional */}
              <div>
                <label className="block text-cyan-400 text-xs font-medium mb-2">
                  Additional Information
                </label>
                <Textarea
                  value={formData.additional}
                  onChange={(e) => updateFormData("additional", e.target.value)}
                  placeholder="Any additional personality traits or background information"
                  className="bg-slate-700/50 border-slate-600/30 text-white h-24 resize-none text-xs focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300"
                />
              </div>

              {/* Make Default */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="make-default"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) =>
                    updateFormData("isDefault", checked as boolean)
                  }
                  className="border-slate-600/50 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-400 data-[state=checked]:to-cyan-400 data-[state=checked]:border-emerald-400"
                />
                <label htmlFor="make-default" className="text-white text-xs">
                  Make this my default persona
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleCancel}
                  className="flex-1 bg-slate-600/50 hover:bg-slate-600/70 text-white py-3 rounded-full text-xs border border-slate-500/30 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePersona}
                  disabled={!formData.name.trim() || !formData.age.trim()}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed text-xs shadow-lg shadow-cyan-500/20 transition-all duration-300"
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  },
);

PersonaCreateSheet.displayName = "PersonaCreateSheet";
export default PersonaCreateSheet;
