"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Save,
  Send,
  MoreVertical,
  X,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import { saveCharacter, updateCharacter } from "@/lib/storage";
import FormattedText from "./chat/formatted-text";
import type { Character } from "@/lib/types";

interface CharacterCreationProps {
  updateState: (updates: { activeTab: string }) => void;
  editingCharacter?: Character | null;
}

export default function CharacterCreation({
  updateState,
  editingCharacter,
}: CharacterCreationProps) {
  const [formData, setFormData] = useState({
    name: editingCharacter?.name || "",
    age: editingCharacter?.age || "",
    gender: editingCharacter?.gender || "",
    introduction: editingCharacter?.intro || "",
    personality: editingCharacter?.personality || "",
    scenario: editingCharacter?.scenario || "",
    greeting: editingCharacter?.greeting || "",
    rating: editingCharacter?.rating || "filtered",
    tags: editingCharacter?.tags || [],
    visibility: editingCharacter?.visibility || "public",
    characterImage: editingCharacter?.image || null,
    scenarioImage: editingCharacter?.sceneImage || null,
    appearance: editingCharacter?.appearance || "",
    publicDefinition: editingCharacter?.publicDefinition || "yes",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [availableTags] = useState([
    "Romance",
    "Fantasy",
    "Sci-Fi",
    "Adventure",
    "Comedy",
    "Drama",
    "Mystery",
    "Horror",
    "Slice of Life",
    "Action",
    "Supernatural",
    "Historical",
    "Modern",
    "Futuristic",
    "Magic",
    "School",
  ]);

  const [previewMessage, setPreviewMessage] = useState("");
  const [previewMessages, setPreviewMessages] = useState([
    {
      sender: "character",
      text: "",
      isUser: false,
    },
  ]);

  // Update preview messages when greeting changes
  useEffect(() => {
    setPreviewMessages([
      {
        sender: "character",
        text: formData.greeting || "Hello! I'm your new character.",
        isUser: false,
      },
    ]);
  }, [formData.greeting]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // Debounced input handler for better typing performance
  const inputTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const handleInputChange = (field: string, value: any) => {
    // Clear existing timeout for this field
    const existingTimeout = inputTimeouts.current.get(field);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Clear error immediately for responsiveness
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // For text fields (except name), debounce the update for performance
    if (typeof value === "string" && field !== "name" && value.length > 10) {
      inputTimeouts.current.set(
        field,
        setTimeout(() => {
          setFormData((prev) => ({ ...prev, [field]: value }));
          inputTimeouts.current.delete(field);
        }, 150),
      );
    } else {
      // Update immediately for short text, name, and non-text inputs
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Image compression utility
  const compressImage = (
    file: File,
    maxWidth = 800,
    quality = 0.8,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = (width * maxWidth) / height;
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (
    type: "character" | "scenario",
    file: File | null,
  ) => {
    if (file) {
      try {
        // Check file size (limit to 5MB before compression)
        if (file.size > 5 * 1024 * 1024) {
          setErrors((prev) => ({
            ...prev,
            [`${type}Image`]:
              "Image file too large. Please choose a file under 5MB.",
          }));
          return;
        }

        // Compress the image
        const compressedImage = await compressImage(
          file,
          type === "character" ? 600 : 800,
          0.7,
        );

        if (type === "character") {
          setFormData((prev) => ({ ...prev, characterImage: compressedImage }));
        } else if (type === "scenario") {
          setFormData((prev) => ({ ...prev, scenarioImage: compressedImage }));
        }

        // Clear any previous image errors
        setErrors((prev) => ({ ...prev, [`${type}Image`]: "" }));
      } catch (error) {
        console.error("Image compression error:", error);
        setErrors((prev) => ({
          ...prev,
          [`${type}Image`]:
            "Failed to process image. Please try a different file.",
        }));
      }
    }
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = formData.tags;
    if (currentTags.includes(tag)) {
      handleInputChange(
        "tags",
        currentTags.filter((t) => t !== tag),
      );
    } else if (currentTags.length < 8) {
      handleInputChange("tags", [...currentTags, tag]);
    }
  };

  // Export character data as JSON
  const handleExportCharacter = () => {
    try {
      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        character: {
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          introduction: formData.introduction,
          personality: formData.personality,
          scenario: formData.scenario,
          greeting: formData.greeting,
          rating: formData.rating,
          tags: formData.tags,
          visibility: formData.visibility,
          appearance: formData.appearance,
          publicDefinition: formData.publicDefinition,
          // Include images in export (they're already compressed)
          characterImage: formData.characterImage,
          scenarioImage: formData.scenarioImage,
        },
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${formData.name || "character"}_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success message
      setSaveSuccess(true);
    } catch (error) {
      console.error("Export error:", error);
      setErrors({
        export: "Failed to export character data. Please try again.",
      });
    }
  };

  // Import character data from JSON
  const handleImportCharacter = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);

        // Validate the imported data structure
        if (!jsonData.character) {
          throw new Error("Invalid character file format");
        }

        const character = jsonData.character;

        // Validate required fields
        if (!character.name || !character.age || !character.gender) {
          throw new Error(
            "Missing required character data (name, age, or gender)",
          );
        }

        // Import the character data
        setFormData({
          name: character.name || "",
          age: character.age || "",
          gender: character.gender || "",
          introduction: character.introduction || "",
          personality: character.personality || "",
          scenario: character.scenario || "",
          greeting: character.greeting || "",
          rating: character.rating || "filtered",
          tags: Array.isArray(character.tags) ? character.tags : [],
          visibility: character.visibility || "public",
          characterImage: character.characterImage || null,
          scenarioImage: character.scenarioImage || null,
          appearance: character.appearance || "",
          publicDefinition: character.publicDefinition || "yes",
        });

        // Clear any existing errors
        setErrors({});
        setImportError("");
        setImportDialogOpen(false);

        // Show success message
        setSaveSuccess(true);
      } catch (error) {
        console.error("Import error:", error);
        setImportError(
          error instanceof Error
            ? error.message
            : "Failed to import character data. Please check the file format.",
        );
      }
    };

    reader.onerror = () => {
      setImportError("Failed to read the file. Please try again.");
    };

    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Enhanced validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = "Character name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    } else if (formData.name.length > 40) {
      newErrors.name = "Name must be 40 characters or less";
    }

    if (!formData.age.trim()) {
      newErrors.age = "Age is required";
    } else if (Number.parseInt(formData.age) < 18) {
      newErrors.age = "Character must be at least 18 years old";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender selection is required";
    }

    if (!formData.introduction.trim()) {
      newErrors.introduction = "Introduction is required";
    } else if (formData.introduction.length > 500) {
      newErrors.introduction = "Introduction must be 500 characters or less";
    }

    if (!formData.greeting.trim()) {
      newErrors.greeting = "Greeting message is required";
    }

    if (!formData.rating) {
      newErrors.rating = "Rating selection is required";
    }

    if (formData.tags.length === 0) {
      newErrors.tags = "At least one tag is required";
    }

    if (!formData.visibility) {
      newErrors.visibility = "Visibility setting is required";
    }

    // Character limits validation
    if (formData.personality.length > 10000) {
      newErrors.personality = "Personality must be 10,000 characters or less";
    }

    if (formData.scenario.length > 10000) {
      newErrors.scenario = "Scenario must be 10,000 characters or less";
    }

    if (formData.greeting.length > 10000) {
      newErrors.greeting = "Greeting must be 10,000 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Complete token replacement function
  const replaceTokens = (
    text: string,
    charData: typeof formData,
    isUserMessage = false,
  ) => {
    if (!text) return text;

    let processedText = text;

    try {
      // Basic tokens
      if (isUserMessage) {
        processedText = processedText.replace(/\{\{user\}\}/g, "You");
      } else {
        processedText = processedText.replace(/\{\{user\}\}/g, "User");
      }

      processedText = processedText.replace(
        /\{\{char\}\}/g,
        charData.name || "Character",
      );
      processedText = processedText.replace(
        /\{\{nickname\}\}/g,
        charData.name || "Character",
      );
      processedText = processedText.replace(
        /\{\{age\}\}/g,
        charData.age || "unknown age",
      );
      processedText = processedText.replace(
        /\{\{gender\}\}/g,
        charData.gender || "unknown gender",
      );
      processedText = processedText.replace(
        /\{\{rating\}\}/g,
        charData.rating || "filtered",
      );
      processedText = processedText.replace(
        /\{\{tags\}\}/g,
        charData.tags.join(", ") || "no tags",
      );
      processedText = processedText.replace(
        /\{\{introduction\}\}/g,
        charData.introduction || "no introduction",
      );
      processedText = processedText.replace(
        /\{\{personality\}\}/g,
        charData.personality || "no personality",
      );
      processedText = processedText.replace(
        /\{\{scenario\}\}/g,
        charData.scenario || "no scenario",
      );
      processedText = processedText.replace(
        /\{\{greeting\}\}/g,
        charData.greeting || "no greeting",
      );
      processedText = processedText.replace(
        /\{\{appearance\}\}/g,
        charData.appearance || "no specific appearance",
      );
    } catch (error) {
      console.error("Error in token replacement:", error);
      return text;
    }

    return processedText;
  };

  const handlePreviewSend = () => {
    if (!previewMessage.trim()) return;

    const userMessage = previewMessage;
    const characterResponse = `Thanks for your message! As {{char}}, I would respond based on my personality and scenario.`;

    const newMessages = [
      ...previewMessages,
      {
        sender: "user",
        text: userMessage,
        isUser: true,
      },
      {
        sender: "character",
        text: characterResponse,
        isUser: false,
      },
    ];

    setPreviewMessages(newMessages);
    setPreviewMessage("");
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaveLoading(true);

    try {
      const character: Character = {
        id: editingCharacter?.id || `char-${Date.now()}`,
        name: formData.name,
        description: formData.introduction,
        personality: formData.personality,
        scenario: formData.scenario,
        greeting: formData.greeting,
        age: formData.age,
        gender: formData.gender,
        tags: formData.tags,
        rating: formData.rating,
        visibility: formData.visibility,
        intro: formData.introduction,
        messages: editingCharacter?.messages || [
          { sender: formData.name, text: formData.greeting },
        ],
        likes: editingCharacter?.likes || 0,
        creator: "Leon", // This should be the actual user name
        createdAt: editingCharacter?.createdAt || Date.now(),
        image:
          formData.characterImage || "/placeholder.svg?height=400&width=300",
        avatar:
          formData.characterImage || "/placeholder.svg?height=40&width=40",
        sceneImage:
          formData.scenarioImage || "/placeholder.svg?height=400&width=600",
        sceneCard: null,
        sceneDisplayMode: "cover",
        appearance: formData.appearance,
        publicDefinition: formData.publicDefinition,
      };

      if (editingCharacter) {
        updateCharacter(editingCharacter.id, character);
      } else {
        saveCharacter(character);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        updateState({ activeTab: "Characters" });
      }, 1500);
    } catch (error) {
      console.error("Error saving character:", error);

      // Handle localStorage quota exceeded error
      if (error instanceof Error && error.message.includes("quota")) {
        setErrors({
          save: "Storage limit exceeded. Try using smaller images or delete some existing characters to free up space.",
        });
      } else {
        setErrors({ save: "Failed to save character. Please try again." });
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const getCharacterCount = (text: string, max: number) => {
    const isNearLimit = text.length > max * 0.8;
    return (
      <span className={isNearLimit ? "text-yellow-400" : "text-slate-400"}>
        {text.length}/{max}
      </span>
    );
  };

  const tokenInfo =
    "Common tokens: {{user}}, {{char}}, {{age}}, {{gender}} and more...";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm px-4 py-2 z-30 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateState({ activeTab: "Characters" })}
              className="text-slate-300 hover:text-white h-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-base font-semibold">
              {editingCharacter ? "Edit Character" : "Create Character"}
            </h1>
          </div>

          {/* Import/Export Buttons */}
        </div>
      </div>

      <div className="pt-16 px-4 pb-20 max-w-4xl mx-auto">
        {/* Success Message */}
        {saveSuccess && (
          <Alert className="mb-4 border-green-500 bg-green-500/10">
            <AlertCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-400">
              {errors.export
                ? "Character exported successfully!"
                : "Character saved successfully! Redirecting..."}
            </AlertDescription>
          </Alert>
        )}

        {/* General Error Message */}
        {(errors.save || errors.export) && (
          <Alert className="mb-4 border-red-500 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-400">
              {errors.save || errors.export}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border-slate-700 h-8">
            <TabsTrigger
              value="create"
              className="text-xs data-[state=active]:bg-slate-700 data-[state=active]:text-white h-7"
            >
              Create Character
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="text-xs data-[state=active]:bg-slate-700 data-[state=active]:text-white h-7"
            >
              Chat Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6 mt-6">
            {/* Character Photo */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium text-white mb-2">
                  Character Photo<span className="text-emerald-400">*</span>
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Upload character image. Images will be automatically
                  compressed to save storage space. Recommended formats: webp,
                  png, gif, jpeg. Max size: 5MB.
                </p>
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageChange(
                          "character",
                          e.target.files?.[0] || null,
                        )
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full h-64 border-2 border-dashed border-slate-600 rounded-lg bg-slate-800/50 flex flex-col items-center justify-center hover:border-slate-500 transition-colors">
                      {formData.characterImage ? (
                        <img
                          src={formData.characterImage || "/placeholder.svg"}
                          alt="Character"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                          <p className="text-xs text-slate-400 text-center">
                            Click to upload character image
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  {errors.characterImage && (
                    <p className="text-xs text-red-400 mt-1">
                      {errors.characterImage}
                    </p>
                  )}
                </div>

                <div className="w-24 flex flex-col items-center">
                  <Label className="text-xs text-slate-400 mb-2">
                    Avatar Preview
                  </Label>
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800/50 border-2 border-slate-600 flex items-center justify-center">
                    {formData.characterImage ? (
                      <img
                        src={formData.characterImage || "/placeholder.svg"}
                        alt="Character Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center">
                        <span className="text-xs text-slate-400 text-center px-2">
                          Avatar Preview
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white">
                Name<span className="text-emerald-400">*</span>
              </Label>
              <p className="text-xs text-slate-400">3-40 characters</p>
              <div className="relative">
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Character name"
                  maxLength={40}
                  className={`bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 text-xs pr-16 h-8 ${
                    errors.name ? "border-red-500" : ""
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                  {getCharacterCount(formData.name, 40)}
                </span>
              </div>
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white">
                Age<span className="text-emerald-400">*</span>
              </Label>
              <Input
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                placeholder="Must be at least 18 years old"
                type="number"
                min="18"
                className={`bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 text-xs h-8 ${
                  errors.age ? "border-red-500" : ""
                }`}
              />
              {errors.age && (
                <p className="text-xs text-red-400">{errors.age}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white">
                Gender<span className="text-emerald-400">*</span>
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleInputChange("gender", value)}
              >
                <SelectTrigger
                  className={`bg-slate-800/50 border-slate-600 text-white text-xs h-8 ${
                    errors.gender ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Choose gender" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="female" className="text-white text-xs">
                    Female
                  </SelectItem>
                  <SelectItem value="male" className="text-white text-xs">
                    Male
                  </SelectItem>
                  <SelectItem value="non-binary" className="text-white text-xs">
                    Non-Binary
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-xs text-red-400">{errors.gender}</p>
              )}
            </div>

            {/* Introduction */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white">
                Introduction<span className="text-emerald-400">*</span>
              </Label>
              <p className="text-xs text-slate-400">
                Brief description for display
              </p>
              <p className="text-[0.65rem] text-slate-500">{tokenInfo}</p>
              <div className="relative">
                <Textarea
                  value={formData.introduction}
                  onChange={(e) =>
                    handleInputChange("introduction", e.target.value)
                  }
                  placeholder="Brief character description"
                  maxLength={500}
                  className={`bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 text-xs min-h-[80px] pr-16 ${
                    errors.introduction ? "border-red-500" : ""
                  }`}
                />
                <span className="absolute right-3 bottom-3 text-xs">
                  {getCharacterCount(formData.introduction, 500)}
                </span>
              </div>
              {errors.introduction && (
                <p className="text-xs text-red-400">{errors.introduction}</p>
              )}
            </div>

            {/* Personality */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-white">
                  Personality
                </Label>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="xs"
                    className="border-slate-600 text-slate-400 hover:text-white text-xs h-7 px-3"
                    onClick={() =>
                      handleInputChange(
                        "personality",
                        "A friendly and outgoing character who loves to help others and make new friends. They have a positive outlook on life and always try to see the best in people.",
                      )
                    }
                  >
                    Example 1
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    className="border-slate-600 text-slate-400 hover:text-white text-xs h-7 px-3"
                    onClick={() =>
                      handleInputChange(
                        "personality",
                        "A mysterious and intelligent character with a dry sense of humor. They prefer to observe before acting and have a deep understanding of human nature.",
                      )
                    }
                  >
                    Example 2
                  </Button>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Detailed character description for long-term memory
              </p>
              <p className="text-[0.65rem] text-slate-500">{tokenInfo}</p>
              <div className="relative">
                <Textarea
                  value={formData.personality}
                  onChange={(e) =>
                    handleInputChange("personality", e.target.value)
                  }
                  placeholder="Describe character traits, history, mannerisms, and conversation topics"
                  maxLength={10000}
                  className={`bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 text-xs min-h-[120px] pr-20 ${
                    errors.personality ? "border-red-500" : ""
                  }`}
                />
                <span className="absolute right-3 bottom-3 text-xs">
                  {getCharacterCount(formData.personality, 10000)}
                </span>
              </div>
              {errors.personality && (
                <p className="text-xs text-red-400">{errors.personality}</p>
              )}
            </div>

            {/* Scenario Image Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white">
                Scenario Background
              </Label>
              <p className="text-xs text-slate-400">
                Background image for chat interface. Images will be
                automatically compressed.
              </p>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageChange("scenario", e.target.files?.[0] || null)
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full h-48 border-2 border-dashed border-slate-600 rounded-lg bg-slate-800/50 flex flex-col items-center justify-center hover:border-slate-500 transition-colors">
                  {formData.scenarioImage ? (
                    <img
                      src={formData.scenarioImage || "/placeholder.svg"}
                      alt="Scenario Background"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-xs text-slate-400 text-center">
                        Click to upload scenario background
                      </p>
                    </>
                  )}
                </div>
              </div>
              {errors.scenarioImage && (
                <p className="text-xs text-red-400 mt-1">
                  {errors.scenarioImage}
                </p>
              )}
            </div>

            {/* Scenario */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-white">
                  Scenario
                </Label>
                <Button
                  variant="outline"
                  size="xs"
                  className="border-slate-600 text-slate-400 hover:text-white text-xs h-7 px-3"
                  onClick={() =>
                    handleInputChange(
                      "scenario",
                      "{{char}} and {{user}} meet in a cozy coffee shop on a rainy afternoon. The atmosphere is warm and inviting, perfect for deep conversations.",
                    )
                  }
                >
                  Example
                </Button>
              </div>
              <p className="text-xs text-slate-400">
                Current circumstances and context
              </p>
              <p className="text-[0.65rem] text-slate-500">{tokenInfo}</p>
              <div className="relative">
                <Textarea
                  value={formData.scenario}
                  onChange={(e) =>
                    handleInputChange("scenario", e.target.value)
                  }
                  placeholder="Describe the environment and situation"
                  maxLength={10000}
                  className={`bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 text-xs min-h-[120px] pr-20 ${
                    errors.scenario ? "border-red-500" : ""
                  }`}
                />
                <span className="absolute right-3 bottom-3 text-xs">
                  {getCharacterCount(formData.scenario, 10000)}
                </span>
              </div>
              {errors.scenario && (
                <p className="text-xs text-red-400">{errors.scenario}</p>
              )}
            </div>

            {/* Greeting */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-white">
                  Greeting<span className="text-emerald-400">*</span>
                </Label>
                <Button
                  variant="outline"
                  size="xs"
                  className="border-slate-600 text-slate-400 hover:text-white text-xs h-7 px-3"
                  onClick={() =>
                    handleInputChange(
                      "greeting",
                      "Hello {{user}}, how are you today?",
                    )
                  }
                >
                  Example
                </Button>
              </div>
              <p className="text-xs text-slate-400">
                First message the character sends
              </p>
              <p className="text-[0.65rem] text-slate-500">{tokenInfo}</p>
              <div className="relative">
                <Textarea
                  value={formData.greeting}
                  onChange={(e) =>
                    handleInputChange("greeting", e.target.value)
                  }
                  placeholder="e.g. Hello {{user}}, how are you today?"
                  maxLength={10000}
                  className={`bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 text-xs min-h-[100px] pr-20 ${
                    errors.greeting ? "border-red-500" : ""
                  }`}
                />
                <span className="absolute right-3 bottom-3 text-xs">
                  {getCharacterCount(formData.greeting, 10000)}
                </span>
              </div>
              {errors.greeting && (
                <p className="text-xs text-red-400">{errors.greeting}</p>
              )}
            </div>

            {/* Rating */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-white">
                Rating<span className="text-emerald-400">*</span>
              </Label>
              <RadioGroup
                value={formData.rating}
                onValueChange={(value) => handleInputChange("rating", value)}
                className="flex space-x-8"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="filtered"
                    id="sfw"
                    className="border-white text-white w-4 h-4"
                  />
                  <Label htmlFor="sfw" className="text-white text-xs">
                    SFW
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="unfiltered"
                    id="nsfw"
                    className="border-white text-white w-4 h-4"
                  />
                  <Label htmlFor="nsfw" className="text-white text-xs">
                    NSFW
                  </Label>
                </div>
              </RadioGroup>
              {errors.rating && (
                <p className="text-xs text-red-400">{errors.rating}</p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-white">
                Tags<span className="text-emerald-400">*</span>
              </Label>
              <p className="text-xs text-slate-400">Select up to 8 tags</p>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={
                      formData.tags.includes(tag) ? "default" : "outline"
                    }
                    className={`cursor-pointer transition-colors text-xs h-6 px-2 ${
                      formData.tags.includes(tag)
                        ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900"
                        : "border-slate-600 text-slate-300 hover:border-emerald-400"
                    }`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                    {formData.tags.includes(tag) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
              {errors.tags && (
                <p className="text-xs text-red-400">{errors.tags}</p>
              )}
            </div>

            {/* Visibility */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-white">
                Visibility<span className="text-emerald-400">*</span>
              </Label>
              <RadioGroup
                value={formData.visibility}
                onValueChange={(value) =>
                  handleInputChange("visibility", value)
                }
                className="space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem
                    value="public"
                    id="public"
                    className="border-white text-white w-4 h-4"
                  />
                  <Label htmlFor="public" className="text-white text-xs">
                    <span className="font-medium">Public:</span>{" "}
                    <span className="text-slate-400">Anyone can chat</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem
                    value="private"
                    id="private"
                    className="border-white text-white w-4 h-4"
                  />
                  <Label htmlFor="private" className="text-white text-xs">
                    <span className="font-medium">Private:</span>{" "}
                    <span className="text-slate-400">Only you can chat</span>
                  </Label>
                </div>
              </RadioGroup>
              {errors.visibility && (
                <p className="text-xs text-red-400">{errors.visibility}</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            {/* Chat Preview Interface */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="bg-slate-800/80 border-b border-slate-700 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700">
                    {formData.characterImage ? (
                      <img
                        src={formData.characterImage || "/placeholder.svg"}
                        alt="Character Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-cyan-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">
                      {formData.name || "Character Name"}
                    </h3>
                    <p className="text-slate-400 text-xs">Online</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              {/* Chat Background */}
              <div
                className="flex-1 relative overflow-hidden"
                style={{
                  backgroundImage: formData.scenarioImage
                    ? `url(${formData.scenarioImage})`
                    : "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="relative h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {previewMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-xs ${
                            message.isUser
                              ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900"
                              : "bg-slate-800/95 text-white border border-slate-700/50"
                          }`}
                        >
                          <div>
                            <FormattedText
                              content={
                                replaceTokens(
                                  message.text,
                                  formData,
                                  message.isUser,
                                ) ||
                                (message.isUser
                                  ? "User message"
                                  : replaceTokens(
                                      formData.greeting,
                                      formData,
                                    ) || "Hello! I'm your new character.")
                              }
                              isUserMessage={message.isUser}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 bg-slate-800/95 border-t border-slate-700/50">
                    <div className="flex space-x-2">
                      <Input
                        defaultValue={previewMessage}
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          setPreviewMessage(target.value);
                        }}
                        placeholder="Type a message to test..."
                        className="flex-1 bg-slate-700/90 border-slate-600 text-white placeholder:text-slate-400 text-xs h-8"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handlePreviewSend();
                          }
                        }}
                      />
                      <Button
                        onClick={handlePreviewSend}
                        size="sm"
                        className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 hover:from-emerald-500 hover:to-cyan-500"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Info */}
            <div className="mt-4 p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
              <h4 className="text-white font-medium text-sm mb-2">
                Preview Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Character:</span>
                  <span className="text-white ml-2">
                    {formData.name || "Unnamed"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Rating:</span>
                  <span className="text-white ml-2">
                    {formData.rating.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Tags:</span>
                  <span className="text-white ml-2">
                    {formData.tags.join(", ") || "None"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Visibility:</span>
                  <span className="text-white ml-2 capitalize">
                    {formData.visibility}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Action Button - Centered */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700/50 p-3">
        <div className="max-w-4xl mx-auto flex justify-center">
          <Button
            onClick={handleSave}
            size="sm"
            disabled={isLoading}
            className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 hover:from-emerald-500 hover:to-cyan-500 h-8 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Saving..." : "Save Character"}
          </Button>
        </div>
      </div>
    </div>
  );
}
