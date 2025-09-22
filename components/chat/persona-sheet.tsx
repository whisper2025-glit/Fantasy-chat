"use client";

import type React from "react";

import { memo, useState, useEffect, useRef } from "react"; // Import useRef
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, ChevronRight, Plus, Upload, Check } from "lucide-react";

interface PersonaSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialPersonaToEdit?: Persona | null;
  onPersonaUpdated: (persona: Persona) => void;
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

const PersonaSheet = memo(
  ({
    isOpen,
    onClose,
    initialPersonaToEdit,
    onPersonaUpdated,
  }: PersonaSheetProps) => {
    const [mode, setMode] = useState<"list" | "create" | "edit">("list");
    const [selectedPersona, setSelectedPersona] = useState<Persona | null>(
      null,
    );
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

    // No mock personas - will load from storage or API
    const [personas, setPersonas] = useState<Persona[]>([]);

    // Effect to initialize form when sheet opens for editing a specific persona
    useEffect(() => {
      if (isOpen && initialPersonaToEdit) {
        setMode("edit");
        setFormData({
          name: initialPersonaToEdit.name,
          age: initialPersonaToEdit.age,
          image: initialPersonaToEdit.image || "",
          likes: initialPersonaToEdit.likes,
          dislikes: initialPersonaToEdit.dislikes,
          additional: initialPersonaToEdit.additional,
          isDefault: initialPersonaToEdit.isDefault,
        });
        setSelectedPersona(initialPersonaToEdit);
      } else if (isOpen && !initialPersonaToEdit) {
        // If opening without a specific persona to edit (e.g., from "Create New" or just list)
        setMode("list"); // Default to list view
        setFormData({
          name: "",
          age: "",
          image: "",
          likes: "",
          dislikes: "",
          additional: "",
          isDefault: false,
        });
        setSelectedPersona(null);
      }
    }, [isOpen, initialPersonaToEdit]);

    const handleCreateNew = () => {
      setFormData({
        name: "",
        age: "",
        image: "",
        likes: "",
        dislikes: "",
        additional: "",
        isDefault: false,
      });
      setMode("create");
    };

    const handleEditPersona = (persona: Persona) => {
      setFormData({
        name: persona.name,
        age: persona.age,
        image: persona.image || "",
        likes: persona.likes,
        dislikes: persona.dislikes,
        additional: persona.additional,
        isDefault: persona.isDefault,
      });
      setSelectedPersona(persona);
      setMode("edit");
    };

    const handleSavePersona = () => {
      if (mode === "create") {
        const newPersona: Persona = {
          id: Date.now().toString(),
          ...formData,
        };

        // If this is set as default, remove default from others
        if (formData.isDefault) {
          setPersonas((prev) => prev.map((p) => ({ ...p, isDefault: false })));
          onPersonaUpdated(newPersona); // Notify ChatInterface about new default
        }

        setPersonas((prev) => [...prev, newPersona]);
      } else if (mode === "edit" && selectedPersona) {
        const updatedPersona = { ...selectedPersona, ...formData };

        // If this is set as default, remove default from others
        if (formData.isDefault) {
          setPersonas((prev) => prev.map((p) => ({ ...p, isDefault: false })));
          onPersonaUpdated(updatedPersona); // Notify ChatInterface about new default
        } else if (selectedPersona.isDefault && !formData.isDefault) {
          // If it was default and now isn't, ChatInterface needs to know to reset or pick another default
          // For now, we'll just update the persona, ChatInterface will handle its currentPersona state
        }

        setPersonas((prev) =>
          prev.map((p) => (p.id === selectedPersona.id ? updatedPersona : p)),
        );

        // If the edited persona was the active one, update it in ChatInterface
        if (
          initialPersonaToEdit &&
          initialPersonaToEdit.id === updatedPersona.id
        ) {
          onPersonaUpdated(updatedPersona);
        }
      }

      setMode("list");
      setSelectedPersona(null);
    };

    const handleCancel = () => {
      setMode("list");
      setSelectedPersona(null);
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

    const handleSelectPersona = (persona: Persona) => {
      // Set as active persona
      setPersonas((prev) =>
        prev.map((p) => ({ ...p, isDefault: p.id === persona.id })),
      );
      onPersonaUpdated(persona); // Notify ChatInterface about the selected persona
      onClose();
    };

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

    const renderPersonaList = () => (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-sm font-semibold">Select Persona</h3>
          <Button
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full w-10 h-10 p-0 shadow-lg shadow-cyan-500/20 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-3">
          {personas.map((persona) => (
            <div
              key={persona.id}
              className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 cursor-pointer hover:bg-slate-700/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
              onClick={() => handleSelectPersona(persona)}
            >
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10 ring-2 ring-cyan-400/30">
                  <AvatarImage src={persona.image || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
                    {persona.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-white text-xs font-medium">
                      {persona.name}
                    </h4>
                    <span className="text-slate-400 text-xs">
                      ({persona.age})
                    </span>
                    {persona.isDefault && (
                      <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center shadow-lg shadow-emerald-400/20">
                        <Check className="w-2 h-2 mr-1" />
                        Default
                      </div>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs mt-1">
                    Likes: {persona.likes}
                  </p>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditPersona(persona);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-cyan-400 hover:bg-slate-600/50 transition-all duration-300"
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    const renderPersonaForm = () => (
      <div className="p-4">
        <h3 className="text-white text-sm font-semibold mb-4">
          {mode === "create" ? "Create Persona" : "Edit Persona"}
        </h3>

        <div className="space-y-4">
          {/* Profile Image Uploader */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div
                className="w-16 h-16 bg-slate-700/50 border border-slate-600/30 rounded-full flex items-center justify-center cursor-pointer hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
                onClick={() => fileInputRef.current?.click()} // Trigger file input on click
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
              Save
            </Button>
          </div>
        </div>
      </div>
    );

    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent
          side="bottom"
          className="bg-slate-900/95 backdrop-blur-md text-white border-none h-[90vh] overflow-y-auto p-0 shadow-2xl"
        >
          <SheetHeader>
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={mode === "list" ? onClose : handleCancel}
                className="text-primary hover:text-primary/80 hover:bg-muted/50 transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
              <SheetTitle className="text-foreground text-sm font-semibold">
                Persona
              </SheetTitle>
              <div className="w-10"></div>
            </div>
          </SheetHeader>

          {mode === "list" ? renderPersonaList() : renderPersonaForm()}
        </SheetContent>
      </Sheet>
    );
  },
);

PersonaSheet.displayName = "PersonaSheet";
export default PersonaSheet;
