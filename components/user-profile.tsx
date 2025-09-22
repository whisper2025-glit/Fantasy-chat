"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Settings, Crown, X, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getPublicCharactersByCreator,
  getPrivateCharacters,
} from "@/lib/storage";
import { getFavoritedCharacters } from "@/lib/personal-storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UserSettingsSheet from "@/components/user-settings-sheet";
import type { Character } from "@/lib/types";

interface UserStats {
  followers: number;
  following: number;
  likes: number;
}

interface UserData {
  id: string;
  name: string;
  age: string;
  avatar: string;
  stats: UserStats;
  publicBots: Character[];
  privateBots: Character[];
  favorites: Character[];
  posts: any[];
}

export default function UserProfile() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({
    id: "user_001",
    name: "Leon",
    age: "17 years old",
    avatar:
      "https://cdn.builder.io/api/v1/image/assets%2Fa50c773a6ae64d3196fa855f9682ccad%2Fd5d71c31b66a456094d8724e9235eb90?format=webp&width=800",
    stats: {
      followers: 0,
      following: 0,
      likes: 0,
    },
    publicBots: [],
    privateBots: [],
    favorites: [],
    posts: [],
  });

  const [activeTab, setActiveTab] = useState("bots");
  const [botType, setBotType] = useState("public");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "Leon",
    gender: "Male",
    bio: "17 years old",
    avatarFile: null as File | null,
    avatarPreview: null as string | null,
  });

  useEffect(() => {
    const loadUserData = () => {
      // Load user's public and private bots separately
      const publicBots = getPublicCharactersByCreator(userData.name);
      const privateBots = getPrivateCharacters(userData.name);

      // Load user's favorites
      const favorites = getFavoritedCharacters();

      setUserData((prev) => ({
        ...prev,
        publicBots,
        privateBots,
        favorites: favorites.map((fav) => ({
          id: fav.id,
          name: fav.title,
          description: fav.subtitle,
          image: fav.image,
          tags: fav.tags,
          creator: fav.creator,
          likes: parseInt(fav.messageCount) || 0,
          gender: "unknown",
          createdAt: fav.favoritedAt,
          personality: "",
          scenario: "",
          intro: "",
          messages: [],
          age: "",
          rating: "SFW",
          greeting: "",
          appearance: "",
          visibility: "public",
          publicDefinition: "",
          race: "",
          charClass: "",
          location: "",
          item: "",
          customTokens: {},
          avatar: fav.image,
          sceneCard: null,
          sceneImage: "",
          sceneDisplayMode: "cover",
        })) as Character[],
      }));
    };

    // Load initial data
    loadUserData();

    // Listen for character updates to refresh the bots list
    const handleCharactersUpdate = () => {
      loadUserData();
    };

    window.addEventListener("charactersUpdated", handleCharactersUpdate);

    return () => {
      window.removeEventListener("charactersUpdated", handleCharactersUpdate);
    };
  }, [userData.name]);

  const handleBack = () => {
    router.back();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${userData.name}'s Profile`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleEditProfile = () => {
    // Initialize form with current user data
    setEditForm({
      name: userData.name,
      gender: "Male", // Default or you could add gender to userData
      bio: userData.age,
      avatarFile: null,
      avatarPreview: null,
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = () => {
    // Update user data with form data
    setUserData((prev) => ({
      ...prev,
      name: editForm.name,
      age: editForm.bio,
      // If a new avatar was uploaded, use the preview URL, otherwise keep the current avatar
      avatar: editForm.avatarPreview || prev.avatar,
    }));
    setShowEditModal(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card/95 backdrop-blur-xl border-b border-border">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-muted-foreground" />
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="px-4 py-4">
        {/* Avatar and Basic Info */}
        <div className="flex items-start space-x-4 mb-4">
          <Avatar className="w-20 h-20 ring-4 ring-border">
            <AvatarImage
              src={userData.avatar}
              alt={userData.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xl font-bold">
              {userData.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-sm font-bold text-foreground mb-1">
              {userData.name}
            </h1>
            <p className="text-muted-foreground text-xs mb-3">{userData.age}</p>

            {/* Stats */}
            <div className="flex items-center space-x-6 mb-3">
              <div className="text-center">
                <div className="text-sm font-bold text-foreground">
                  {userData.stats.followers}
                </div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-foreground">
                  {userData.stats.following}
                </div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-foreground">
                  {userData.stats.likes}
                </div>
                <div className="text-xs text-muted-foreground">Likes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Button */}
        <Button
          onClick={handleEditProfile}
          className="w-full mb-4 text-xs"
          variant="outline"
        >
          Edit Profile
        </Button>
      </div>

      {/* Content Tabs */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-transparent border-b border-border">
            <TabsTrigger
              value="bots"
              className="text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent pb-3 transition-all"
            >
              <span className="text-xs">Bots</span>
              <span className="ml-2 text-muted-foreground text-xs">
                {userData.publicBots.length + userData.privateBots.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent pb-3 transition-all"
            >
              <span className="text-xs">Favorites</span>
              <span className="ml-2 text-muted-foreground text-xs">
                {userData.favorites.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="posts"
              className="text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent pb-3 transition-all"
            >
              <span className="text-xs">Post</span>
              <span className="ml-2 text-muted-foreground text-xs">
                {userData.posts.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bots" className="mt-4">
            {/* Dropdown for selecting bot type */}
            <div className="mb-4">
              <Select value={botType} onValueChange={setBotType}>
                <SelectTrigger className="w-full bg-slate-800/50 border-slate-700/50 text-white text-sm">
                  <SelectValue placeholder="Select bot type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="public" className="text-white text-sm">
                    Public Bots ({userData.publicBots.length})
                  </SelectItem>
                  <SelectItem value="private" className="text-white text-sm">
                    Private Bots ({userData.privateBots.length})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Display bots based on selected type */}
            {botType === "public" ? (
              userData.publicBots.length === 0 ? (
                <EmptyState title="No public bots yet, try to create one and set it as public." />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {userData.publicBots.map((bot) => (
                    <BotCard key={bot.id} bot={bot} />
                  ))}
                </div>
              )
            ) : userData.privateBots.length === 0 ? (
              <EmptyState title="No private bots yet, try to create one and set it as private." />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {userData.privateBots.map((bot) => (
                  <BotCard key={bot.id} bot={bot} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="mt-4">
            {userData.favorites.length === 0 ? (
              <EmptyState
                title="No favorites yet."
                subtitle="Start exploring and favorite your preferred characters!"
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {userData.favorites.map((bot) => (
                  <BotCard key={bot.id} bot={bot} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts" className="mt-4">
            <EmptyState
              title="No posts yet."
              subtitle="Share your thoughts and creations with the community!"
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          editForm={editForm}
          setEditForm={setEditForm}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
          avatar={userData.avatar}
        />
      )}

      {/* Settings Sheet */}
      <UserSettingsSheet
        open={showSettingsModal}
        onOpenChange={setShowSettingsModal}
      />
    </div>
  );
}

interface EditProfileModalProps {
  editForm: {
    name: string;
    gender: string;
    bio: string;
    avatarFile: File | null;
    avatarPreview: string | null;
  };
  setEditForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      gender: string;
      bio: string;
      avatarFile: File | null;
      avatarPreview: string | null;
    }>
  >;
  onClose: () => void;
  onSave: () => void;
  avatar: string;
}

function EditProfileModal({
  editForm,
  setEditForm,
  onClose,
  onSave,
  avatar,
}: EditProfileModalProps) {
  const nameLength = editForm.name.length;
  const bioLength = editForm.bio.length;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setEditForm((prev) => ({
          ...prev,
          avatarFile: file,
          avatarPreview: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-sm font-semibold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage
                  src={editForm.avatarPreview || avatar}
                  alt="Profile"
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xl font-bold">
                  {editForm.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center border-2 border-slate-900 transition-colors cursor-pointer">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Name</label>
            <div className="relative">
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    name: e.target.value.slice(0, 20),
                  }))
                }
                className="bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 text-xs"
                placeholder="Enter your name"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                {nameLength}/20
              </span>
            </div>
          </div>

          {/* Gender Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {["Male", "Female", "Non-binary"].map((gender) => (
                <button
                  key={gender}
                  onClick={() => setEditForm((prev) => ({ ...prev, gender }))}
                  className={`py-2 px-4 rounded-full text-xs font-medium transition-all ${
                    editForm.gender === gender
                      ? "bg-blue-600 text-white border-2 border-blue-500"
                      : "bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-700/50"
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          {/* Bio Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Bio</label>
            <div className="relative">
              <Textarea
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    bio: e.target.value.slice(0, 80),
                  }))
                }
                className="bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 text-xs min-h-[100px] resize-none"
                placeholder="Tell us about yourself..."
              />
              <span className="absolute right-3 bottom-3 text-xs text-slate-500">
                {bioLength}/80
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="p-6 pt-0">
          <Button
            onClick={onSave}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 rounded-full text-xs"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  onAction?: () => void;
  actionText?: string;
}

function EmptyState({
  title,
  subtitle,
  onAction,
  actionText,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Chat Bubble Illustration - matching the original design */}
      <div className="mb-6 relative">
        {/* Main chat bubble */}
        <div className="w-20 h-16 bg-slate-600/40 rounded-2xl flex items-center justify-center relative">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
          </div>
        </div>

        {/* Smaller bubble */}
        <div className="absolute -bottom-1 left-6 w-8 h-6 bg-slate-600/30 rounded-xl flex items-center justify-center">
          <div className="flex space-x-0.5">
            <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
            <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
            <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
          </div>
        </div>

        {/* Dotted trail */}
        <div className="absolute -bottom-4 left-12">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-slate-600/50 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-slate-600/40 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-slate-600/30 rounded-full"></div>
          </div>
        </div>
      </div>

      <h3 className="text-slate-400 text-sm font-normal mb-3 text-center">
        {title}
      </h3>

      {subtitle && (
        <p className="text-slate-500 text-xs text-center mb-6 max-w-xs">
          {subtitle}
        </p>
      )}

      {onAction && actionText && (
        <Button
          onClick={onAction}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-xs"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}

interface BotCardProps {
  bot: Character;
}

function BotCard({ bot }: BotCardProps) {
  return (
    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:bg-slate-800/80 transition-all duration-300 cursor-pointer group shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10">
      <div className="relative">
        <img
          src={bot.image || "/placeholder.svg"}
          alt={bot.name}
          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-3">
        <h4 className="text-white font-semibold text-sm mb-1 group-hover:text-cyan-400 transition-colors">
          {bot.name}
        </h4>
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-2">
          {bot.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {bot.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-300 border-slate-600/50 hover:bg-slate-600/50 text-center"
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium text-xs">
            {bot.creator}
          </span>
          <div className="flex items-center text-yellow-400">
            <Crown className="w-3 h-3 mr-1" />
            <span className="font-medium text-xs">
              {bot.likes > 1000
                ? `${(bot.likes / 1000).toFixed(1)}K`
                : bot.likes}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
