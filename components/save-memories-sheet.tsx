"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  X,
  Plus,
  Heart,
  Save,
  Sparkles,
  Clock,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import {
  saveMemory,
  detectMemorableMoment,
  MEMORY_CATEGORIES,
} from "@/lib/memory-storage";
import { ScrollArea } from "@/components/ui/scroll-area";
import FormattedText from "./chat/formatted-text";
import type { Character } from "@/lib/types";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  type?: "text" | "image" | "voice";
  imageUrl?: string;
}

interface SaveMemoriesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  messages: Message[];
}

type VisibilityOption =
  | "public"
  | "public_anonymous"
  | "unlisted"
  | "unlisted_anonymous"
  | "private";

export default function SaveMemoriesSheet({
  isOpen,
  onClose,
  character,
  messages,
}: SaveMemoriesSheetProps) {
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] =
    useState<keyof typeof MEMORY_CATEGORIES>("conversation");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [visibility, setVisibility] = useState<VisibilityOption>("private");
  const [saveSceneCard, setSaveSceneCard] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoDetectedMoments, setAutoDetectedMoments] = useState<
    {
      messageId: string;
      suggestion: ReturnType<typeof detectMemorableMoment>;
    }[]
  >([]);

  // Auto-detect memorable moments when sheet opens
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      const moments = messages
        .filter((msg) => msg.text.length > 50) // Only check substantial messages
        .map((msg) => ({
          messageId: msg.id,
          suggestion: detectMemorableMoment(msg.text),
        }))
        .filter((moment) => moment.suggestion.shouldSave);

      setAutoDetectedMoments(moments);

      // Auto-select detected moments
      if (moments.length > 0) {
        setSelectedMessages(moments.map((m) => m.messageId));

        // Use suggestion from first detected moment
        const firstSuggestion = moments[0].suggestion;
        setCategory(firstSuggestion.suggestedCategory);
        setTags(firstSuggestion.suggestedTags);
      }
    }
  }, [isOpen, messages]);

  const handleMessageToggle = (messageId: string) => {
    setSelectedMessages((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId],
    );
  };

  const handleSelectAll = () => {
    setSelectedMessages(messages.map((m) => m.id));
  };

  const handleSelectNone = () => {
    setSelectedMessages([]);
  };

  const handleSelectSuggested = () => {
    setSelectedMessages(autoDetectedMoments.map((m) => m.messageId));
  };

  const handleSelectAllToggle = () => {
    if (selectedMessages.length === messages.length && messages.length > 0) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map((m) => m.id));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const getSelectedContent = () => {
    const selectedMsgs = messages.filter((m) =>
      selectedMessages.includes(m.id),
    );
    return selectedMsgs.map((msg) => `${msg.sender}: ${msg.text}`).join("\n\n");
  };

  const getVisibilitySettings = (visibility: VisibilityOption) => {
    switch (visibility) {
      case "public":
        return { isPrivate: false, isAnonymous: false, isUnlisted: false };
      case "public_anonymous":
        return { isPrivate: false, isAnonymous: true, isUnlisted: false };
      case "unlisted":
        return { isPrivate: false, isAnonymous: false, isUnlisted: true };
      case "unlisted_anonymous":
        return { isPrivate: false, isAnonymous: true, isUnlisted: true };
      case "private":
      default:
        return { isPrivate: true, isAnonymous: false, isUnlisted: false };
    }
  };

  const handleSave = async () => {
    if (!title.trim() || selectedMessages.length === 0) return;

    setIsSaving(true);
    try {
      const selectedMsgs = messages.filter((m) =>
        selectedMessages.includes(m.id),
      );
      const content = getSelectedContent();
      const visibilitySettings = getVisibilitySettings(visibility);

      // Create intro text from first message or character greeting
      const introText =
        selectedMsgs.length > 0 ? selectedMsgs[0].text : character.greeting;

      // Convert messages to memory format
      const memoryMessages = selectedMsgs.map((msg) => ({
        sender: msg.sender,
        text: msg.text,
        avatar:
          msg.sender === character.name
            ? character.avatar || character.image || "/placeholder.svg"
            : "/placeholder.svg",
        isUser: msg.sender !== character.name,
        reactions: [] as { emoji: string; count: number }[],
      }));

      // Determine participants
      const isUserParticipant1 = selectedMsgs[0]?.sender !== character.name;
      const participant1Name = isUserParticipant1 ? "You" : character.name;
      const participant1Avatar = isUserParticipant1
        ? "/placeholder.svg"
        : character.avatar || character.image || "/placeholder.svg";
      const participant2Name = isUserParticipant1 ? character.name : "You";
      const participant2Avatar = isUserParticipant1
        ? character.avatar || character.image || "/placeholder.svg"
        : "/placeholder.svg";

      // Determine background image based on saveSceneCard toggle
      const backgroundImage = saveSceneCard
        ? character.sceneImage ||
          character.sceneCard ||
          character.image ||
          "/placeholder.svg?height=400&width=600"
        : "/placeholder.svg?height=400&width=600";

      const memory = await saveMemory({
        title: title.trim(),
        description:
          description.trim() || `Conversation with ${character.name}`,
        content,
        characterId: character.id,
        characterName: character.name,
        characterAvatar: character.avatar || character.image,
        tags,
        category,
        isPrivate: visibilitySettings.isPrivate,
        isFavorite,
        messageCount: selectedMsgs.length,
        participants: ["You", character.name],
        metadata: {
          chatId: `chat_${character.id}_${Date.now()}`,
          messageIds: selectedMessages,
          context: "conversation",
          mood: autoDetectedMoments.length > 0 ? "memorable" : "neutral",
          setting: "chat",
          visibility: visibility,
          isAnonymous: visibilitySettings.isAnonymous,
          isUnlisted: visibilitySettings.isUnlisted,
          saveSceneCard: saveSceneCard,
        },
        // Additional fields for memory interface compatibility
        backgroundImage,
        participant1Name,
        participant1Avatar,
        participant2Name,
        participant2Avatar,
        introText,
        messages: memoryMessages,
        character,
        isUserParticipant1,
      });

      // Show success feedback
      window.dispatchEvent(
        new CustomEvent("memoryCreated", { detail: memory }),
      );

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("conversation");
      setTags([]);
      setSelectedMessages([]);
      setVisibility("private");
      setSaveSceneCard(true);
      setIsFavorite(false);

      onClose();
    } catch (error) {
      console.error("Error saving memory:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const visibilityOptions = [
    {
      value: "public" as VisibilityOption,
      label: "Public: Everyone can view",
      description: "Visible to all users",
    },
    {
      value: "public_anonymous" as VisibilityOption,
      label: "Public anonymity: Make your memory anonymous",
      description: "Public but your identity is hidden",
    },
    {
      value: "unlisted" as VisibilityOption,
      label: "Unlisted: Anyone with the link can view",
      description: "Not searchable but accessible via direct link",
    },
    {
      value: "unlisted_anonymous" as VisibilityOption,
      label: "Unlisted anonymity: Anonymous. Anyone with the link can view",
      description: "Unlisted and anonymous",
    },
    {
      value: "private" as VisibilityOption,
      label: "Private: Only you can view",
      description: "Completely private to you",
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="w-full h-[80vh] sm:max-h-[80vh] p-0 bg-slate-900 backdrop-blur-md border-t border-slate-700 shadow-2xl flex flex-col rounded-t-3xl"
      >
        <SheetHeader className="border-b border-slate-700 p-6 bg-slate-900 flex-shrink-0 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 mr-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all duration-300"
                onClick={onClose}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <Save className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <SheetTitle className="text-white text-lg">
                  Save Memories
                </SheetTitle>
                <p className="text-slate-400 text-sm">
                  Select messages to preserve as memories
                </p>
              </div>
            </div>
            {autoDetectedMoments.length > 0 && (
              <Badge className="bg-yellow-600/20 text-yellow-300 border border-yellow-500/30">
                <Sparkles className="h-3 w-3 mr-1" />
                {autoDetectedMoments.length} suggested
              </Badge>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            <span className="opacity-60">Settings</span>
            <ChevronRight className="h-3 w-3 inline mx-1" />
            <span>Save Memories</span>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* Character Info */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12 ring-2 ring-cyan-400/30">
                    <AvatarImage
                      src={
                        character.avatar ||
                        character.image ||
                        "/placeholder.svg"
                      }
                    />
                    <AvatarFallback className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white">
                      {character.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-white">{character.name}</h3>
                    <p className="text-slate-400 text-sm">
                      {messages.length} messages in conversation
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Memory Title */}
            <div className="space-y-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="You can give a title to this memory"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 text-lg p-4 rounded-xl"
              />
            </div>

            {/* Visibility Options */}
            <div className="space-y-3">
              {visibilityOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={visibility === option.value}
                    onChange={(e) =>
                      setVisibility(e.target.value as VisibilityOption)
                    }
                    className="w-5 h-5 text-cyan-400 border-slate-600 focus:ring-cyan-400 focus:ring-2"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium">{option.label}</div>
                    <div className="text-slate-400 text-sm">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Save Scene Card Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800 border border-slate-700">
              <div className="flex-1">
                <Label className="text-white text-base font-medium">
                  Save Scene Card along with your memory?
                </Label>
                <p className="text-slate-400 text-sm mt-1">
                  Include the character's scene image as background
                </p>
              </div>
              <Switch
                checked={saveSceneCard}
                onCheckedChange={setSaveSceneCard}
                className="ml-4"
              />
            </div>

            {/* Message Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">
                  Select Messages ({selectedMessages.length} selected)
                </Label>
                <div className="flex space-x-2">
                  {autoDetectedMoments.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectSuggested}
                      className="border-yellow-600/50 text-yellow-300 hover:bg-yellow-600/10 bg-slate-800"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Suggested
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-slate-800"
                  >
                    All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectNone}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-slate-800"
                  >
                    None
                  </Button>
                </div>
              </div>

              <div className="space-y-2 border border-slate-700 rounded-2xl p-4 bg-slate-800 shadow-inner">
                {messages.map((message) => {
                  const isSelected = selectedMessages.includes(message.id);
                  const isSuggested = autoDetectedMoments.some(
                    (m) => m.messageId === message.id,
                  );

                  return (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "border-cyan-500/50 bg-cyan-500/10"
                          : "border-slate-700 bg-slate-800 hover:bg-slate-700"
                      }`}
                      onClick={() => handleMessageToggle(message.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-sm font-medium ${
                              message.sender === "You"
                                ? "text-blue-400"
                                : "text-green-400"
                            }`}
                          >
                            {message.sender}
                          </span>
                          {isSuggested && (
                            <Badge className="bg-yellow-600/20 text-yellow-300 border border-yellow-500/30 text-xs">
                              <Sparkles className="h-2 w-2 mr-1" />
                              Suggested
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                      <div className="text-slate-300 text-sm leading-relaxed">
                        <FormattedText
                          content={
                            message.text.length > 150
                              ? message.text.substring(0, 150) + "..."
                              : message.text
                          }
                          isUserMessage={message.sender === "You"}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description to help you remember this moment..."
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Category</Label>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value as any)}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white">
                    {Object.entries(MEMORY_CATEGORIES).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center space-x-2">
                          <span>{info.icon}</span>
                          <span>{info.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="text-slate-300">Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-blue-600/20 text-blue-300 border border-blue-500/30"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                    onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                  />
                  <Button
                    onClick={handleAddTag}
                    variant="outline"
                    size="sm"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-slate-800"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Favorite Option */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-center space-x-3">
                  <Heart className="h-4 w-4 text-slate-400" />
                  <div>
                    <Label className="text-slate-300 text-sm">Favorite</Label>
                    <p className="text-slate-400 text-xs">Mark as favorite</p>
                  </div>
                </div>
                <Switch checked={isFavorite} onCheckedChange={setIsFavorite} />
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Actions - Fixed at the bottom */}
        <div className="flex flex-col items-center p-6 border-t border-slate-700 bg-slate-900 flex-shrink-0 space-y-4">
          {/* Select All Toggle */}
          <label className="flex items-center space-x-2 text-white text-lg font-medium cursor-pointer">
            <input
              type="radio"
              checked={
                selectedMessages.length === messages.length &&
                messages.length > 0
              }
              onChange={handleSelectAllToggle}
              className="form-radio h-5 w-5 text-pink-500 border-slate-400 focus:ring-pink-500"
            />
            <span>
              Select All ({selectedMessages.length}/{messages.length})
            </span>
          </label>

          <div className="flex justify-center space-x-4 w-full max-w-md">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1 bg-slate-800 text-white rounded-full px-8 py-3 text-lg hover:bg-slate-700 transition-colors duration-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !title.trim() || selectedMessages.length === 0 || isSaving
              }
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full px-8 py-3 text-lg shadow-lg transition-all duration-300"
            >
              {isSaving ? (
                <>
                  <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Memory
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
