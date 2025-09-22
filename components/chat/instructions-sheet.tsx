"use client";

import { memo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  X,
  ChevronRight,
  Save,
  RotateCcw,
  FileText,
  Lightbulb,
} from "lucide-react";

interface InstructionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onInstructionsUpdate: (instructions: string) => void;
  currentInstructions: string;
}

interface InstructionTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  tags: string[];
}

const InstructionsSheet = memo(
  ({
    isOpen,
    onClose,
    onInstructionsUpdate,
    currentInstructions,
  }: InstructionsSheetProps) => {
    const [mode, setMode] = useState<"edit" | "templates">("edit");
    const [instructions, setInstructions] = useState(currentInstructions || "");
    const [selectedCategory, setSelectedCategory] = useState("All");

    // No mock instruction templates - will load from real data
    const instructionTemplates: InstructionTemplate[] = [];

    const categories = ["All"];

    const handleSave = () => {
      onInstructionsUpdate(instructions);
      onClose();
    };

    const handleReset = () => {
      setInstructions(currentInstructions || "");
    };

    const handleTemplateSelect = (template: InstructionTemplate) => {
      setInstructions(template.content);
      setMode("edit");
    };

    const getFilteredTemplates = () => {
      if (selectedCategory === "All") {
        return instructionTemplates;
      }
      return instructionTemplates.filter(
        (template) => template.category === selectedCategory,
      );
    };

    const renderTemplateCard = (template: InstructionTemplate) => (
      <div
        key={template.id}
        onClick={() => handleTemplateSelect(template)}
        className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 cursor-pointer hover:bg-slate-700/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-medium text-sm">
                {template.name}
              </h3>
              <p className="text-slate-400 text-xs">{template.category}</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-slate-600/50 text-slate-300 text-[10px] px-1.5 py-0.5"
          >
            Template
          </Badge>
        </div>

        <p className="text-slate-300 text-xs mb-3 line-clamp-2">
          {template.description}
        </p>

        <div className="flex flex-wrap gap-1">
          {template.tags.map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="border-slate-600/50 text-slate-300 text-[10px] px-1.5 py-0.5"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    );

    const renderEditMode = () => (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-sm font-semibold">
            Custom Instructions
          </h3>
          <Button
            onClick={() => setMode("templates")}
            variant="ghost"
            size="sm"
            className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-700/50 transition-all duration-300"
          >
            <Lightbulb className="w-4 h-4 mr-1" />
            Templates
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-cyan-400 text-xs font-medium mb-2">
              Instructions
            </label>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Enter custom instructions for how the AI should behave and respond..."
              className="bg-slate-700/50 border-slate-600/30 text-white h-64 resize-none text-xs focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300"
            />
            <p className="text-slate-400 text-xs mt-2">
              These instructions will guide how the AI responds in this
              conversation. Be specific about tone, style, and behavior.
            </p>
          </div>

          <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-medium">Tips</span>
            </div>
            <ul className="text-slate-300 text-xs space-y-1">
              <li>• Be specific about the tone and personality you want</li>
              <li>• Include examples of desired behavior</li>
              <li>• Mention any topics or styles to avoid</li>
              <li>• Specify the level of detail you prefer</li>
            </ul>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white py-3 rounded-full text-xs transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-full text-xs shadow-lg shadow-cyan-500/20 transition-all duration-300"
            >
              <Save className="w-4 h-4 mr-1" />
              Save Instructions
            </Button>
          </div>
        </div>
      </div>
    );

    const renderTemplatesMode = () => (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-sm font-semibold">
            Instruction Templates
          </h3>
          <Button
            onClick={() => setMode("edit")}
            variant="ghost"
            size="sm"
            className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-700/50 transition-all duration-300"
          >
            <FileText className="w-4 h-4 mr-1" />
            Custom
          </Button>
        </div>

        {/* Category Filter */}
        <div className="mb-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-slate-700/50 border-slate-600/30 text-white text-xs h-8 w-32 focus:border-cyan-400 focus:ring-cyan-400/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800/95 backdrop-blur-md border-slate-700/50">
              {categories.map((category) => (
                <SelectItem
                  key={category}
                  value={category}
                  className="text-white text-xs hover:bg-slate-700/50"
                >
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Templates Grid */}
        <div className="space-y-3">
          {getFilteredTemplates().length > 0 ? (
            getFilteredTemplates().map(renderTemplateCard)
          ) : (
            <div className="text-center text-slate-400 py-8">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No templates found</p>
              <p className="text-xs mt-1">Try selecting a different category</p>
            </div>
          )}
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
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-700/50 transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
              <SheetTitle className="text-white text-sm font-semibold">
                Instructions
              </SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </SheetHeader>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-700/50 bg-slate-800/30">
            {[
              { id: "edit", label: "Custom", icon: FileText },
              { id: "templates", label: "Templates", icon: Lightbulb },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id as any)}
                className={`flex-1 py-3 text-xs font-medium transition-all duration-300 flex items-center justify-center space-x-1 ${
                  mode === tab.id
                    ? "text-cyan-400 border-b-2 border-cyan-400 bg-slate-700/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/20"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {mode === "edit" ? renderEditMode() : renderTemplatesMode()}
          </div>
        </SheetContent>
      </Sheet>
    );
  },
);

InstructionsSheet.displayName = "InstructionsSheet";
export default InstructionsSheet;
