"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  User,
  Shield,
  Bell,
  Filter,
  Accessibility,
  Zap,
  Database,
  Code,
  Download,
  Upload,
  RotateCcw,
  Save,
  AlertTriangle,
} from "lucide-react";
import {
  getAppSettings,
  saveAppSettings,
  exportSettings,
  importSettings,
  resetAllSettings,
  type AppSettings,
} from "@/lib/unified-settings-storage";

interface UnifiedSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UnifiedSettingsSheet({
  isOpen,
  onClose,
}: UnifiedSettingsSheetProps) {
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const currentSettings = getAppSettings();
    setSettings(currentSettings);
    setHasChanges(false);
  }, [isOpen]);

  const updateSetting = <K extends keyof AppSettings>(
    category: K,
    updates: Partial<AppSettings[K]>,
  ) => {
    const newSettings = {
      ...settings,
      [category]: { ...settings[category], ...updates },
    };
    setSettings(newSettings);
    setHasChanges(true);

    // Auto-save for immediate effect
    saveAppSettings({ [category]: newSettings[category] });
  };

  const handleSave = () => {
    saveAppSettings(settings);
    setHasChanges(false);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings to defaults?")) {
      resetAllSettings();
      setSettings(getAppSettings());
      setHasChanges(false);
    }
  };

  const handleExport = () => {
    const data = exportSettings();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `xcuteai_settings_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string;
          importSettings(data);
          setSettings(getAppSettings());
          setHasChanges(false);
          alert("Settings imported successfully!");
        } catch (error) {
          alert("Error importing settings: Invalid file format");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-4xl p-0 bg-slate-800/95 backdrop-blur-md border-l border-slate-700/50 shadow-2xl overflow-y-auto"
      >
        <SheetHeader className="border-b border-slate-700/50 p-6 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                <Settings className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <SheetTitle className="text-white text-lg">Settings</SheetTitle>
                <p className="text-slate-400 text-sm">
                  Customize your XCuteAI experience
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:shadow-md"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <label>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:shadow-md"
                  asChild
                >
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="border-red-600 text-red-400 hover:bg-red-600/10 hover:shadow-md"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="p-6">
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-slate-700/30">
              <TabsTrigger value="user" className="text-xs">
                <User className="h-4 w-4 mr-1" />
                User
              </TabsTrigger>
              <TabsTrigger value="privacy" className="text-xs">
                <Shield className="h-4 w-4 mr-1" />
                Privacy
              </TabsTrigger>

              <TabsTrigger value="content" className="text-xs">
                <Filter className="h-4 w-4 mr-1" />
                Content
              </TabsTrigger>
              <TabsTrigger value="accessibility" className="text-xs">
                <Accessibility className="h-4 w-4 mr-1" />
                Access
              </TabsTrigger>
              <TabsTrigger value="performance" className="text-xs">
                <Zap className="h-4 w-4 mr-1" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="backup" className="text-xs">
                <Database className="h-4 w-4 mr-1" />
                Backup
              </TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs">
                <Code className="h-4 w-4 mr-1" />
                Advanced
              </TabsTrigger>
            </TabsList>

            {/* User Settings */}
            <TabsContent value="user" className="space-y-6 mt-6">
              <Card className="bg-slate-700/30 border-slate-600/30">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center">
                    <User className="h-4 w-4 mr-2 text-blue-400" />
                    Profile Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm">Username</Label>
                    <Input
                      value={settings.user.username}
                      onChange={(e) =>
                        updateSetting("user", { username: e.target.value })
                      }
                      className="bg-slate-600/30 border-slate-500/50 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm">Theme</Label>
                    <Select
                      value={settings.user.theme}
                      onValueChange={(value) =>
                        updateSetting("user", { theme: value as any })
                      }
                    >
                      <SelectTrigger className="bg-slate-600/30 border-slate-500/50 text-white hover:border-cyan-400/50 transition-all duration-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm">Language</Label>
                    <Select
                      value={settings.user.language}
                      onValueChange={(value) =>
                        updateSetting("user", { language: value })
                      }
                    >
                      <SelectTrigger className="bg-slate-600/30 border-slate-500/50 text-white hover:border-cyan-400/50 transition-all duration-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="ko">Korean</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm">Timezone</Label>
                    <Input
                      value={settings.user.timezone}
                      onChange={(e) =>
                        updateSetting("user", { timezone: e.target.value })
                      }
                      className="bg-slate-600/30 border-slate-500/50 text-white"
                      placeholder="Auto-detected"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="space-y-6 mt-6">
              <Card className="bg-slate-700/30 border-slate-600/30">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-green-400" />
                    Privacy & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm">
                      Profile Visibility
                    </Label>
                    <Select
                      value={settings.privacy.profileVisibility}
                      onValueChange={(value) =>
                        updateSetting("privacy", {
                          profileVisibility: value as any,
                        })
                      }
                    >
                      <SelectTrigger className="bg-slate-600/30 border-slate-500/50 text-white hover:border-cyan-400/50 transition-all duration-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="bg-slate-600/30" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Allow Direct Messages
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Let others send you direct messages
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.allowDirectMessages}
                      onCheckedChange={(checked) =>
                        updateSetting("privacy", {
                          allowDirectMessages: checked,
                        })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Show Online Status
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Display when you're online
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.showOnlineStatus}
                      onCheckedChange={(checked) =>
                        updateSetting("privacy", { showOnlineStatus: checked })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Data Collection
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Allow anonymous usage analytics
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.dataCollection}
                      onCheckedChange={(checked) =>
                        updateSetting("privacy", { dataCollection: checked })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Analytics Opt-in
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Help improve the platform
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.analyticsOptIn}
                      onCheckedChange={(checked) =>
                        updateSetting("privacy", { analyticsOptIn: checked })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6 mt-6">
              <Card className="bg-slate-700/30 border-slate-600/30">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center">
                    <Bell className="h-4 w-4 mr-2 text-yellow-400" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Enable Notifications
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Master notification toggle
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.enabled}
                      onCheckedChange={(checked) =>
                        updateSetting("notifications", { enabled: checked })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>

                  <Separator className="bg-slate-600/30" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Email Notifications
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) =>
                        updateSetting("notifications", { email: checked })
                      }
                      disabled={!settings.notifications.enabled}
                      className="hover:shadow-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Push Notifications
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Browser push notifications
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) =>
                        updateSetting("notifications", { push: checked })
                      }
                      disabled={!settings.notifications.enabled}
                      className="hover:shadow-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Sound Notifications
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Play sounds for notifications
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.sound}
                      onCheckedChange={(checked) =>
                        updateSetting("notifications", { sound: checked })
                      }
                      disabled={!settings.notifications.enabled}
                      className="hover:shadow-lg"
                    />
                  </div>

                  <Separator className="bg-slate-600/30" />

                  <div className="space-y-3">
                    <Label className="text-slate-300 text-sm">
                      Notification Categories
                    </Label>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-400 text-xs">Messages</Label>
                      <Switch
                        checked={settings.notifications.categories.messages}
                        onCheckedChange={(checked) =>
                          updateSetting("notifications", {
                            categories: {
                              ...settings.notifications.categories,
                              messages: checked,
                            },
                          })
                        }
                        disabled={!settings.notifications.enabled}
                        className="hover:shadow-lg"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-400 text-xs">
                        Followers
                      </Label>
                      <Switch
                        checked={settings.notifications.categories.followers}
                        onCheckedChange={(checked) =>
                          updateSetting("notifications", {
                            categories: {
                              ...settings.notifications.categories,
                              followers: checked,
                            },
                          })
                        }
                        disabled={!settings.notifications.enabled}
                        className="hover:shadow-lg"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-400 text-xs">Likes</Label>
                      <Switch
                        checked={settings.notifications.categories.likes}
                        onCheckedChange={(checked) =>
                          updateSetting("notifications", {
                            categories: {
                              ...settings.notifications.categories,
                              likes: checked,
                            },
                          })
                        }
                        disabled={!settings.notifications.enabled}
                        className="hover:shadow-lg"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-400 text-xs">Comments</Label>
                      <Switch
                        checked={settings.notifications.categories.comments}
                        onCheckedChange={(checked) =>
                          updateSetting("notifications", {
                            categories: {
                              ...settings.notifications.categories,
                              comments: checked,
                            },
                          })
                        }
                        disabled={!settings.notifications.enabled}
                        className="hover:shadow-lg"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-400 text-xs">System</Label>
                      <Switch
                        checked={settings.notifications.categories.system}
                        onCheckedChange={(checked) =>
                          updateSetting("notifications", {
                            categories: {
                              ...settings.notifications.categories,
                              system: checked,
                            },
                          })
                        }
                        disabled={!settings.notifications.enabled}
                        className="hover:shadow-lg"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Settings */}
            <TabsContent value="content" className="space-y-6 mt-6">
              <Card className="bg-slate-700/30 border-slate-600/30">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-purple-400" />
                    Content Filtering
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm">
                      NSFW Filter
                    </Label>
                    <Select
                      value={settings.content.nsfwFilter}
                      onValueChange={(value) =>
                        updateSetting("content", { nsfwFilter: value as any })
                      }
                    >
                      <SelectTrigger className="bg-slate-600/30 border-slate-500/50 text-white hover:border-cyan-400/50 transition-all duration-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="strict">Strict</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="off">Off</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Language Filter
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Filter inappropriate language
                      </p>
                    </div>
                    <Switch
                      checked={settings.content.languageFilter}
                      onCheckedChange={(checked) =>
                        updateSetting("content", { languageFilter: checked })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Auto Translate
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Automatically translate messages
                      </p>
                    </div>
                    <Switch
                      checked={settings.content.autoTranslate}
                      onCheckedChange={(checked) =>
                        updateSetting("content", { autoTranslate: checked })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Content Warnings
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Show warnings for sensitive content
                      </p>
                    </div>
                    <Switch
                      checked={settings.content.contentWarnings}
                      onCheckedChange={(checked) =>
                        updateSetting("content", { contentWarnings: checked })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Accessibility Settings */}
            <TabsContent value="accessibility" className="space-y-6 mt-6">
              <Card className="bg-slate-700/30 border-slate-600/30">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center">
                    <Accessibility className="h-4 w-4 mr-2 text-cyan-400" />
                    Accessibility Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        High Contrast
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Increase contrast for better visibility
                      </p>
                    </div>
                    <Switch
                      checked={settings.accessibility.highContrast}
                      onCheckedChange={(checked) =>
                        updateSetting("accessibility", {
                          highContrast: checked,
                        })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Large Text
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Increase text size throughout the app
                      </p>
                    </div>
                    <Switch
                      checked={settings.accessibility.largeText}
                      onCheckedChange={(checked) =>
                        updateSetting("accessibility", { largeText: checked })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Reduced Motion
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Minimize animations and transitions
                      </p>
                    </div>
                    <Switch
                      checked={settings.accessibility.reducedMotion}
                      onCheckedChange={(checked) =>
                        updateSetting("accessibility", {
                          reducedMotion: checked,
                        })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Screen Reader Support
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Enhanced screen reader compatibility
                      </p>
                    </div>
                    <Switch
                      checked={settings.accessibility.screenReader}
                      onCheckedChange={(checked) =>
                        updateSetting("accessibility", {
                          screenReader: checked,
                        })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Keyboard Navigation
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Enhanced keyboard navigation support
                      </p>
                    </div>
                    <Switch
                      checked={settings.accessibility.keyboardNavigation}
                      onCheckedChange={(checked) =>
                        updateSetting("accessibility", {
                          keyboardNavigation: checked,
                        })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Settings */}
            <TabsContent value="performance" className="space-y-6 mt-6">
              <Card className="bg-slate-700/30 border-slate-600/30">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-orange-400" />
                    Performance & Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Auto Load Images
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Automatically load images in chat
                      </p>
                    </div>
                    <Switch
                      checked={settings.performance.autoLoadImages}
                      onCheckedChange={(checked) =>
                        updateSetting("performance", {
                          autoLoadImages: checked,
                        })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Enable Animations
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Show smooth animations and transitions
                      </p>
                    </div>
                    <Switch
                      checked={settings.performance.enableAnimations}
                      onCheckedChange={(checked) =>
                        updateSetting("performance", {
                          enableAnimations: checked,
                        })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Preload Content
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Preload content for faster loading
                      </p>
                    </div>
                    <Switch
                      checked={settings.performance.preloadContent}
                      onCheckedChange={(checked) =>
                        updateSetting("performance", {
                          preloadContent: checked,
                        })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Low Data Mode
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Reduce data usage
                      </p>
                    </div>
                    <Switch
                      checked={settings.performance.lowDataMode}
                      onCheckedChange={(checked) =>
                        updateSetting("performance", { lowDataMode: checked })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm">
                      Max Cache Size (MB)
                    </Label>
                    <div className="px-2">
                      <Slider
                        value={[settings.performance.maxCacheSize]}
                        onValueChange={([value]) =>
                          updateSetting("performance", { maxCacheSize: value })
                        }
                        max={500}
                        min={50}
                        step={25}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>50 MB</span>
                        <span>{settings.performance.maxCacheSize} MB</span>
                        <span>500 MB</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Backup Settings */}
            <TabsContent value="backup" className="space-y-6 mt-6">
              <Card className="bg-slate-700/30 border-slate-600/30">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center">
                    <Database className="h-4 w-4 mr-2 text-green-400" />
                    Backup & Sync
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Auto Backup
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Automatically backup your data
                      </p>
                    </div>
                    <Switch
                      checked={settings.backup.autoBackup}
                      onCheckedChange={(checked) =>
                        updateSetting("backup", { autoBackup: checked })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm">
                      Backup Frequency
                    </Label>
                    <Select
                      value={settings.backup.backupFrequency}
                      onValueChange={(value) =>
                        updateSetting("backup", {
                          backupFrequency: value as any,
                        })
                      }
                      disabled={!settings.backup.autoBackup}
                    >
                      <SelectTrigger className="bg-slate-600/30 border-slate-500/50 text-white hover:border-cyan-400/50 transition-all duration-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="bg-slate-600/30" />

                  <div className="space-y-3">
                    <Label className="text-slate-300 text-sm">
                      Backup Content
                    </Label>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-400 text-xs">
                        Include Chats
                      </Label>
                      <Switch
                        checked={settings.backup.includeChats}
                        onCheckedChange={(checked) =>
                          updateSetting("backup", { includeChats: checked })
                        }
                        disabled={!settings.backup.autoBackup}
                        className="hover:shadow-lg"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-400 text-xs">
                        Include Memories
                      </Label>
                      <Switch
                        checked={settings.backup.includeMemories}
                        onCheckedChange={(checked) =>
                          updateSetting("backup", { includeMemories: checked })
                        }
                        disabled={!settings.backup.autoBackup}
                        className="hover:shadow-lg"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-400 text-xs">
                        Include Settings
                      </Label>
                      <Switch
                        checked={settings.backup.includeSettings}
                        onCheckedChange={(checked) =>
                          updateSetting("backup", { includeSettings: checked })
                        }
                        disabled={!settings.backup.autoBackup}
                        className="hover:shadow-lg"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Cloud Sync
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Sync data across devices (coming soon)
                      </p>
                    </div>
                    <Switch
                      checked={settings.backup.cloudSync}
                      onCheckedChange={(checked) =>
                        updateSetting("backup", { cloudSync: checked })
                      }
                      disabled={true}
                      className="hover:shadow-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="advanced" className="space-y-6 mt-6">
              <Card className="bg-slate-700/30 border-slate-600/30">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center">
                    <Code className="h-4 w-4 mr-2 text-red-400" />
                    Advanced Settings
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                    These settings are for advanced users only
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Developer Mode
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Enable developer tools and features
                      </p>
                    </div>
                    <Switch
                      checked={settings.advanced.developerMode}
                      onCheckedChange={(checked) =>
                        updateSetting("advanced", { developerMode: checked })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Debug Logging
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Enable detailed console logging
                      </p>
                    </div>
                    <Switch
                      checked={settings.advanced.debugLogging}
                      onCheckedChange={(checked) =>
                        updateSetting("advanced", { debugLogging: checked })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Experimental Features
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Enable experimental and beta features
                      </p>
                    </div>
                    <Switch
                      checked={settings.advanced.experimentalFeatures}
                      onCheckedChange={(checked) =>
                        updateSetting("advanced", {
                          experimentalFeatures: checked,
                        })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 text-sm">
                        Beta Updates
                      </Label>
                      <p className="text-slate-400 text-xs">
                        Receive beta version updates
                      </p>
                    </div>
                    <Switch
                      checked={settings.advanced.betaUpdates}
                      onCheckedChange={(checked) =>
                        updateSetting("advanced", { betaUpdates: checked })
                      }
                      className="hover:shadow-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm">Custom CSS</Label>
                    <Textarea
                      value={settings.advanced.customCSS}
                      onChange={(e) =>
                        updateSetting("advanced", { customCSS: e.target.value })
                      }
                      placeholder="/* Add your custom CSS here */"
                      className="bg-slate-600/30 border-slate-500/50 text-white placeholder:text-slate-400 font-mono text-xs"
                      rows={6}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Changes Button */}
          {hasChanges && (
            <div className="fixed bottom-6 right-6 z-50">
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
