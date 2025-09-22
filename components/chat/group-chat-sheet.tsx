"use client";

import { memo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { X, ChevronRight, Plus, Search, Users, Crown } from "lucide-react";

interface GroupChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupSelect: (group: any) => void;
  currentGroup: any;
}

interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  role: "owner" | "admin" | "member";
  isOnline: boolean;
}

interface GroupChat {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  memberCount: number;
  members: GroupMember[];
  isPrivate: boolean;
  lastActivity: string;
  tags: string[];
}

const GroupChatSheet = memo(
  ({ isOpen, onClose, onGroupSelect, currentGroup }: GroupChatSheetProps) => {
    const [mode, setMode] = useState<"browse" | "create">("browse");
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      isPrivate: false,
      selectedMembers: [] as string[],
    });

    // No mock group chats - will load from storage or API
    const [groupChats, setGroupChats] = useState<GroupChat[]>([]);

    // No mock available characters - will load from real data
    const availableCharacters: any[] = [];

    const handleCreateNew = () => {
      setFormData({
        name: "",
        description: "",
        isPrivate: false,
        selectedMembers: [],
      });
      setMode("create");
    };

    const handleSaveGroup = () => {
      const newGroup: GroupChat = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        memberCount: formData.selectedMembers.length + 1, // +1 for owner
        members: [
          { id: "owner", name: "You", role: "owner", isOnline: true },
          ...formData.selectedMembers.map((memberId) => {
            const char = availableCharacters.find((c) => c.id === memberId);
            return {
              id: memberId,
              name: char?.name || "Unknown",
              role: "member" as const,
              isOnline: Math.random() > 0.5,
            };
          }),
        ],
        isPrivate: formData.isPrivate,
        lastActivity: "Just now",
        tags: ["Custom", "New"],
      };

      setGroupChats((prev) => [...prev, newGroup]);
      setMode("browse");
    };

    const handleCancel = () => {
      setMode("browse");
      setFormData({
        name: "",
        description: "",
        isPrivate: false,
        selectedMembers: [],
      });
    };

    const handleGroupSelect = (group: GroupChat) => {
      onGroupSelect(group);
      onClose();
    };

    const updateFormData = (field: keyof typeof formData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleMemberSelection = (memberId: string) => {
      const isSelected = formData.selectedMembers.includes(memberId);
      if (isSelected) {
        updateFormData(
          "selectedMembers",
          formData.selectedMembers.filter((id) => id !== memberId),
        );
      } else {
        updateFormData("selectedMembers", [
          ...formData.selectedMembers,
          memberId,
        ]);
      }
    };

    const getFilteredGroups = () => {
      let filtered = groupChats;

      if (searchQuery) {
        filtered = filtered.filter(
          (group) =>
            group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            group.tags.some((tag) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase()),
            ),
        );
      }

      return filtered.sort(
        (a, b) =>
          new Date(b.lastActivity).getTime() -
          new Date(a.lastActivity).getTime(),
      );
    };

    const renderGroupCard = (group: GroupChat) => (
      <div
        key={group.id}
        onClick={() => handleGroupSelect(group)}
        className={`bg-slate-700/30 border rounded-lg p-4 cursor-pointer hover:bg-slate-700/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 ${
          currentGroup?.id === group.id
            ? "border-cyan-400 bg-slate-700/50 shadow-lg shadow-cyan-500/20"
            : "border-slate-600/30"
        }`}
      >
        <div className="flex items-start space-x-3 mb-3">
          <div className="relative">
            <Avatar className="w-12 h-12 ring-2 ring-cyan-400/30">
              <AvatarImage src={group.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
                {group.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {group.isPrivate && (
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-emerald-400/20">
                <span className="text-white text-xs">🔒</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-white font-medium text-sm">{group.name}</h3>
              {currentGroup?.id === group.id && (
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-[10px] px-1.5 py-0.5 shadow-lg shadow-cyan-500/20"
                >
                  Active
                </Badge>
              )}
            </div>
            <p className="text-slate-400 text-xs mb-2 line-clamp-2">
              {group.description}
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <div className="flex items-center">
                <Users className="w-3 h-3 mr-1 text-cyan-400" />
                <span>{group.memberCount} members</span>
              </div>
              <span>•</span>
              <span>Active {group.lastActivity}</span>
            </div>
          </div>
        </div>

        {/* Member Avatars */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {group.members.slice(0, 4).map((member, index) => (
              <div key={member.id} className="relative">
                <Avatar className="w-6 h-6 border-2 border-slate-800 ring-1 ring-slate-600/50">
                  <AvatarImage src={member.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white text-xs">
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {member.role === "owner" && (
                  <Crown className="absolute -top-1 -right-1 w-3 h-3 text-emerald-400 fill-current" />
                )}
                {member.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-slate-800" />
                )}
              </div>
            ))}
            {group.memberCount > 4 && (
              <div className="w-6 h-6 bg-slate-600/50 border-2 border-slate-800 rounded-full flex items-center justify-center">
                <span className="text-slate-300 text-[10px]">
                  +{group.memberCount - 4}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1">
            {group.tags.slice(0, 4).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="border-slate-600/50 text-slate-300 text-[10px] px-1.5 py-0.5 text-center truncate"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );

    const renderBrowseMode = () => (
      <div className="p-4">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-sm font-semibold">Group Chats</h3>
          <Button
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full w-10 h-10 p-0 shadow-lg shadow-cyan-500/20 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search group chats..."
            className="bg-slate-700/50 border-slate-600/30 text-white text-xs pl-10 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300"
          />
        </div>

        {/* Groups List */}
        <div className="space-y-3">
          {getFilteredGroups().length > 0 ? (
            getFilteredGroups().map(renderGroupCard)
          ) : (
            <div className="text-center text-slate-400 py-8">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No group chats found</p>
              <p className="text-xs mt-1">
                Create your first group chat to get started
              </p>
            </div>
          )}
        </div>
      </div>
    );

    const renderCreateMode = () => (
      <div className="p-4">
        <h3 className="text-white text-sm font-semibold mb-4">
          Create Group Chat
        </h3>

        <div className="space-y-4">
          {/* Group Name */}
          <div>
            <label className="block text-cyan-400 text-xs font-medium mb-2">
              Group Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              placeholder="Enter group name"
              className="bg-slate-700/50 border-slate-600/30 text-white text-xs focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-cyan-400 text-xs font-medium mb-2">
              Description
            </label>
            <Input
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              placeholder="Describe your group chat"
              className="bg-slate-700/50 border-slate-600/30 text-white text-xs focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300"
            />
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="private-group"
              checked={formData.isPrivate}
              onChange={(e) => updateFormData("isPrivate", e.target.checked)}
              className="w-4 h-4 text-cyan-400 bg-slate-700/50 border-slate-600/30 rounded focus:ring-cyan-400/20"
            />
            <label htmlFor="private-group" className="text-white text-xs">
              Make this group private
            </label>
          </div>

          {/* Select Members */}
          <div>
            <label className="block text-cyan-400 text-xs font-medium mb-2">
              Add Characters
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableCharacters.map((character) => (
                <div
                  key={character.id}
                  onClick={() => toggleMemberSelection(character.id)}
                  className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all duration-300 ${
                    formData.selectedMembers.includes(character.id)
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/50"
                      : "bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50"
                  }`}
                >
                  <Avatar className="w-8 h-8 ring-2 ring-cyan-400/30">
                    <AvatarImage src={character.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-xs">
                      {character.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white text-xs">{character.name}</span>
                  {formData.selectedMembers.includes(character.id) && (
                    <div className="ml-auto w-4 h-4 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-400/20">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Members Count */}
          {formData.selectedMembers.length > 0 && (
            <div className="text-cyan-400 text-xs">
              {formData.selectedMembers.length} character
              {formData.selectedMembers.length !== 1 ? "s" : ""} selected
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleCancel}
              className="flex-1 bg-slate-600/50 hover:bg-slate-600/70 text-white py-3 rounded-full text-xs border border-slate-500/30 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveGroup}
              disabled={
                !formData.name.trim() || formData.selectedMembers.length === 0
              }
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed text-xs shadow-lg shadow-cyan-500/20 transition-all duration-300"
            >
              Create Group
            </Button>
          </div>
        </div>
      </div>
    );

    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent
          side="bottom"
          className="bg-background/95 backdrop-blur-md text-foreground border-none h-[90vh] overflow-y-auto p-0 shadow-2xl"
        >
          <SheetHeader>
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={mode === "browse" ? onClose : handleCancel}
                className="text-primary hover:text-primary/80 hover:bg-muted/50 transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
              <SheetTitle className="text-foreground text-sm font-semibold">
                Group Chat
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {mode === "browse" ? renderBrowseMode() : renderCreateMode()}
          </div>
        </SheetContent>
      </Sheet>
    );
  },
);

GroupChatSheet.displayName = "GroupChatSheet";
export default GroupChatSheet;
