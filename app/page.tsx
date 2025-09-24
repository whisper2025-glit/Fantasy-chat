"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Menu, Star, X, Loader2 } from "lucide-react"

// Import components
import CharacterCreation from "@/components/character-creation"
import RecentChats from "@/components/recent-chats"
import ExplorePage from "@/components/explore-page"
import PersonalPage from "@/components/personal-page"
import CreatorInfoPage from "@/components/creator-info-page"
import { AdventureInterface } from "@/components/adventure/adventure-interface"
import FormattedText from "@/components/chat/formatted-text"
import { getPublicCharacters } from "@/lib/storage"

import {
  favoriteCharacter,
  unfavoriteCharacter,
  isCharacterFavorited,
  type FavoritedCharacter,
} from "@/lib/personal-storage"
import type { RecentChat } from "@/lib/recent-chats-storage"
import type { Character } from "@/lib/types"
import { Button } from "@/components/ui/button"
import useInfiniteScroll, { scrollUtils } from "@/hooks/use-infinite-scroll"
import LazyImage from "@/components/ui/lazy-image"
import ScrollToTop from "@/components/ui/scroll-to-top"

// No sample characters - will load from storage or API
const sampleCharacters: Character[] = []

// Function to generate additional content for infinite scroll
const generateMoreCharacters = (startId: number, count = 8): Character[] => {
  return []
}

// Sidebar component
const Sidebar = ({
  isOpen,
  onClose,
  onNavigate,
}: {
  isOpen: boolean
  onClose: () => void
  onNavigate: (tab: string) => void
}) => {
  const sidebarItems = ["Discover", "Explore", "Recent Chats", "Personal", "Profile", "Create", "Adventure", "Sign Out"]

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-80 h-full bg-card/95 backdrop-blur-xl border-r border-border transform transition-all duration-300 z-50 shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 flex items-center justify-center">
                {/* Simple blue gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg"></div>

                {/* Icon container */}
                <div className="relative z-10 flex items-center justify-center w-full h-full">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-black" fill="currentColor">
                    {/* Smiley face icon */}
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                </div>

                {/* Decorative dots outside the logo */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-300 rounded-full opacity-70"></div>
                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-60"></div>
              </div>

              <span className="text-white font-semibold text-lg">WhisperChat</span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800/50 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item}
                onClick={() => {
                  onNavigate(item)
                  onClose()
                }}
                className="w-full text-left px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200 text-sm font-medium relative group"
              >
                <span>{item}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}

export default function OriginalHomePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("Characters")
  const [isUnfiltered, setIsUnfiltered] = useState<boolean>(true)
  const [sortBy, setSortBy] = useState("Popular")
  const [genderFilter, setGenderFilter] = useState("All")
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showGenderDropdown, setShowGenderDropdown] = useState(false)
  const [showTagsDropdown, setShowTagsDropdown] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [selectedChatHistory, setSelectedChatHistory] = useState<RecentChat["chatHistory"] | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showRecentChats, setShowRecentChats] = useState(false)
  const [showExplorePage, setShowExplorePage] = useState(false)
  const [showPersonalPage, setShowPersonalPage] = useState(false)
  const [showCreatorInfo, setShowCreatorInfo] = useState(false)
  const [showAdventure, setShowAdventure] = useState(false)
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement | null>(null)
  const [selectedTag, setSelectedTag] = useState("All")
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [favoritedCharacterIds, setFavoritedCharacterIds] = useState<Set<string>>(new Set())

  // Cleanup scroll lock on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  // Load initial characters on mount - only public characters for main feed
  useEffect(() => {
    try {
      const storedPublicCharacters = getPublicCharacters()
      setCharacters(storedPublicCharacters)
    } catch (error) {
      console.error("Error loading data:", error)
      setCharacters([])
    }
  }, [])

  // Separate effect for loading favorited character IDs
  useEffect(() => {
    const updateFavoritedIds = () => {
      const favoritedIds = new Set<string>()
      const allPublicCharacters = getPublicCharacters()
      allPublicCharacters.forEach((char) => {
        if (isCharacterFavorited(char.id)) {
          favoritedIds.add(char.id)
        }
      })
      setFavoritedCharacterIds(favoritedIds)
    }

    updateFavoritedIds()
  }, [])

  // Separate effect for handling storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedPublicCharacters = getPublicCharacters()
        setCharacters(storedPublicCharacters)
      } catch (error) {
        console.error("Error updating data:", error)
      }
    }

    const handleFavoritesUpdate = () => {
      const favoritedIds = new Set<string>()
      const allPublicCharacters = getPublicCharacters()
      allPublicCharacters.forEach((char) => {
        if (isCharacterFavorited(char.id)) {
          favoritedIds.add(char.id)
        }
      })
      setFavoritedCharacterIds(favoritedIds)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("charactersUpdated", handleStorageChange)
    window.addEventListener("favoritesUpdated", handleFavoritesUpdate)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("charactersUpdated", handleStorageChange)
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdate)
    }
  }, [])

  // Improved load more content function
  const loadMoreContent = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)

    // Simulate network delay with progressive loading
    const delay = Math.min(500 + page * 100, 1200) // Gradually increase delay
    await new Promise((resolve) => setTimeout(resolve, delay))

    try {
      if (activeTab === "Characters") {
        const batchSize = 8
        const newCharacters = generateMoreCharacters(characters.length + page * batchSize, batchSize)

        setCharacters((prev) => [...prev, ...newCharacters])
        setPage((prev) => prev + 1)

        // More realistic pagination - stop after 10 pages (80 characters)
        if (page >= 10) {
          setHasMore(false)
        }
      }
    } catch (error) {
      console.error("Error loading more characters:", error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, activeTab, characters.length, page])

  // Enhanced infinite scroll
  const {
    targetRef: infiniteScrollRef,
    isLoading: infiniteScrollLoading,
    hasMore: infiniteScrollHasMore,
  } = useInfiniteScroll(loadMoreContent, {
    threshold: 0.1,
    rootMargin: "50px",
    enabled: activeTab === "Characters",
    hasMore,
    isLoading,
  })

  // Reset pagination when tab changes
  useEffect(() => {
    setPage(1)
    setHasMore(true)
  }, [activeTab])

  const getSortOptions = () => ["Popular", "Recent", "Trending", "New", "Following", "Ranking"]
  const getGenderOptions = () => ["All", "Male", "Female", "Other"]
  const getTagOptions = () => [
    "All",
    "Fantasy",
    "Sci-Fi",
    "Romance",
    "Adventure",
    "Comedy",
    "Drama",
    "Horror",
    "Mystery",
    "Slice of Life",
  ]

  const handleCharacterFavorite = (character: Character, event: React.MouseEvent) => {
    event.stopPropagation()

    const isFavorited = favoritedCharacterIds.has(character.id)

    if (isFavorited) {
      unfavoriteCharacter(character.id)
      setFavoritedCharacterIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(character.id)
        return newSet
      })
    } else {
      const favoritedCharacter: FavoritedCharacter = {
        id: character.id,
        creator: character.creator,
        title: character.name,
        subtitle: character.description,
        image: character.image,
        tags: character.tags,
        isNSFW: character.tags.some((tag) => tag.toLowerCase().includes("nsfw")),
        messageCount: `${character.likes}`,
        favoritedAt: Date.now(),
      }

      favoriteCharacter(favoritedCharacter)
      setFavoritedCharacterIds((prev) => new Set(prev).add(character.id))
    }
  }

  const handleSidebarNavigate = (item: string) => {
    setSelectedCharacter(null)
    setSelectedChatHistory(null)
    setShowCreateForm(false)
    setShowRecentChats(false)
    setShowExplorePage(false)
    setShowPersonalPage(false)
    setShowCreatorInfo(false)
    setShowAdventure(false)

    switch (item) {
      case "Discover":
        setActiveTab("Characters")
        break
      case "Explore":
        setShowExplorePage(true)
        break
      case "Create":
        setShowCreateForm(true)
        break
      case "Recent Chats":
        setShowRecentChats(true)
        break
      case "Personal":
        setShowPersonalPage(true)
        break
      case "Profile":
        router.push("/profile")
        break
      case "Adventure":
        setShowAdventure(true)
        break
      default:
        console.log(`Navigate to: ${item}`)
    }
  }

  const handleCharacterClick = (character: Character) => {
    try {
      if (!character || !character.id || !character.name) {
        throw new Error("Invalid character data")
      }

      alert(
        `Character: ${character.name}\n\nDescription: ${character.description}\n\nChat functionality has been removed from this application.`,
      )
    } catch (error) {
      console.error("Failed to show character details:", error)
    }
  }

  const handleChatStart = (character: Character) => {
    handleCharacterClick(character)
  }

  const handleViewCreatorProfile = (creatorId: string) => {
    setSelectedCreatorId(creatorId)
    setShowCreatorInfo(true)
  }

  const handleChatSelect = (chat: RecentChat) => {
    try {
      if (!chat || !chat.character) {
        throw new Error("Invalid chat data")
      }

      if (!chat.character.id || !chat.character.name) {
        throw new Error("Chat contains invalid character data")
      }

      handleCharacterClick(chat.character)
    } catch (error) {
      console.error("Failed to load chat:", error)
    }
  }

  const handleTagClick = (tag: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setActiveTab("Characters")
    setSelectedTag(tag)
    setSortBy("Popular")
    setGenderFilter("All")

    setSelectedCharacter(null)
    setSelectedChatHistory(null)
    setShowCreateForm(false)
    setShowRecentChats(false)
    setShowExplorePage(false)
    setShowPersonalPage(false)
    setShowCreatorInfo(false)
    setShowAdventure(false)
    setSelectedCreatorId(null)

    setShowSortDropdown(false)
    setShowGenderDropdown(false)
    setShowTagsDropdown(false)
  }

  // Show creator info page
  if (showCreatorInfo && selectedCreatorId) {
    return (
      <CreatorInfoPage
        creatorId={selectedCreatorId}
        onBack={() => {
          setShowCreatorInfo(false)
          setSelectedCreatorId(null)
        }}
        onCharacterSelect={handleCharacterClick}
      />
    )
  }

  // Show character creation form
  if (showCreateForm) {
    return (
      <CharacterCreation
        updateState={(updates) => {
          if (updates.activeTab !== "Create") {
            setShowCreateForm(false)
          }
        }}
      />
    )
  }

  // Show recent chats page
  if (showRecentChats) {
    return <RecentChats onBack={() => setShowRecentChats(false)} onChatSelect={handleChatSelect} />
  }

  // Show explore page
  if (showExplorePage) {
    return <ExplorePage onBack={() => setShowExplorePage(false)} onCharacterSelect={handleCharacterClick} />
  }

  // Show personal page
  if (showPersonalPage) {
    return (
      <PersonalPage
        onBack={() => setShowPersonalPage(false)}
        onCharacterSelect={handleCharacterClick}
        onCreatorSelect={(creatorId: string) => {
          setSelectedCreatorId(creatorId)
          setShowCreatorInfo(true)
          setShowPersonalPage(false)
        }}
      />
    )
  }

  // Show adventure game
  if (showAdventure) {
    return (
      <AdventureInterface
        onBack={() => setShowAdventure(false)}
      />
    )
  }

  // Filter and sort characters
  const filteredCharacters = characters.filter((character) => {
    if (genderFilter !== "All" && character.gender !== genderFilter.toLowerCase()) {
      return false
    }
    if (selectedTag !== "All" && !character.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())) {
      return false
    }
    return true
  })

  const sortedCharacters = [...filteredCharacters].sort((a, b) => {
    switch (sortBy) {
      case "Popular":
        return b.likes - a.likes
      case "Recent":
      case "New":
        return b.createdAt - a.createdAt
      case "Trending":
      default:
        return b.likes - a.likes
    }
  })

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Enhanced Header */}
      <div className="flex-shrink-0 bg-card/95 backdrop-blur-xl border-b border-border px-4 py-3 z-30 shadow-xl">
        {/* Top Row - Menu and User Controls */}
        <div className="flex items-center justify-between mb-3">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-muted-foreground hover:text-primary transition-all duration-200 p-2 hover:bg-muted/50 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {isSignedIn ? (
              <Avatar
                className="w-8 h-8 ring-2 ring-cyan-400/30 cursor-pointer hover:ring-cyan-400/50 transition-all duration-200"
                onClick={() => setIsSignedIn(false)}
              >
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white">U</AvatarFallback>
              </Avatar>
            ) : (
              <Button
                onClick={() => setIsSignedIn(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs py-1 px-3 h-7 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Middle Row - Filter Controls, NSFW Toggle, and GIF Button */}
        <div className="flex items-center justify-between mb-3">
          {/* Left Section - Filter Controls */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                onClick={() => {
                  setShowSortDropdown(!showSortDropdown)
                  setShowGenderDropdown(false)
                  setShowTagsDropdown(false)
                }}
                className="bg-muted/70 border border-border rounded-xl px-3 py-1.5 text-xs text-foreground flex items-center space-x-2 hover:bg-muted transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span>{sortBy}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showSortDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-popover/95 backdrop-blur-xl border border-border rounded-xl py-2 z-10 min-w-0 w-fit shadow-2xl">
                  {getSortOptions().map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option)
                        setShowSortDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-xs hover:bg-muted/50 transition-colors whitespace-nowrap ${
                        sortBy === option ? "bg-muted/50 text-primary" : "text-popover-foreground"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowGenderDropdown(!showGenderDropdown)
                  setShowSortDropdown(false)
                  setShowTagsDropdown(false)
                }}
                className="bg-muted/70 border border-border rounded-xl px-3 py-1.5 text-xs text-foreground flex items-center space-x-2 hover:bg-muted transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span>Gender</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showGenderDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-popover/95 backdrop-blur-xl border border-border rounded-xl py-2 z-10 min-w-0 w-fit shadow-2xl">
                  {getGenderOptions().map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setGenderFilter(option)
                        setShowGenderDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-xs hover:bg-muted/50 transition-colors whitespace-nowrap ${
                        genderFilter === option ? "bg-muted/50 text-primary" : "text-popover-foreground"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Section - NSFW Toggle and GIF Button */}
          <div className="flex items-center space-x-4">
            {/* NSFW Toggle */}
            <div className="flex items-center space-x-2"></div>

            {/* GIF Button */}
            <Button
              variant="outline"
              className="bg-muted/70 border-border text-foreground text-xs px-4 py-1.5 h-auto hover:bg-muted transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              GIF
            </Button>
          </div>
        </div>

        {/* Tags Row - Horizontal Scrollable */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2 pb-1">
            {getTagOptions().map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTag(tag)
                  setShowSortDropdown(false)
                  setShowGenderDropdown(false)
                  setShowTagsDropdown(false)
                }}
                className={`flex-shrink-0 px-4 py-1.5 text-xs rounded-xl border transition-all duration-200 whitespace-nowrap shadow-lg hover:shadow-xl ${
                  selectedTag === tag
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-muted/70 border-border text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area with Enhanced Styling */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 overscroll-contain scroll-container scrollbar-hide smooth-scroll">
        {activeTab === "Characters" && (
          <div className="grid grid-cols-2 gap-4 pt-4">
            {sortedCharacters.map((character) => {
              const isFavorited = favoritedCharacterIds.has(character.id)

              return (
                <Card
                  key={character.id}
                  className="bg-card/60 backdrop-blur-sm border border-border overflow-hidden hover:bg-card/80 transition-all duration-300 cursor-pointer group shadow-xl hover:shadow-2xl hover:border-border hover:border-primary/20"
                  onClick={() => handleCharacterClick(character)}
                >
                  <div className="relative">
                    <LazyImage
                      src={character.image || "/placeholder.svg"}
                      alt={character.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      placeholder="/placeholder.svg"
                      fallback="/placeholder.svg"
                    />

                    {/* Interactive Star Button */}
                    <button
                      onClick={(e) => handleCharacterFavorite(character, e)}
                      className="absolute top-3 right-3 transition-all duration-300 p-1 rounded-full hover:bg-black/20 backdrop-blur-sm"
                    >
                      <Star
                        className={`w-5 h-5 transition-all duration-300 hover:scale-110 drop-shadow-lg ${
                          isFavorited ? "text-yellow-400 fill-yellow-400" : "text-white/80 hover:text-yellow-400"
                        }`}
                      />
                    </button>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-white font-semibold text-sm leading-tight group-hover:text-cyan-400 transition-colors">
                        {character.name}
                      </h3>
                    </div>
                    <div className="text-slate-300 text-xs mb-4 leading-relaxed line-clamp-2">
                      <FormattedText content={character.description} />
                    </div>
                    <div className="grid grid-cols-2 gap-1 mb-2">
                      {character.tags.slice(0, 4).map((tag) => (
                        <Badge
                          key={tag}
                          onClick={(e) => handleTagClick(tag, e)}
                          className="text-xs px-2 py-0.5 border cursor-pointer hover:scale-105 transition-all duration-200 bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground text-center truncate"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">{character.creator}</span>
                      <div className="flex items-center text-white">
                        <Star className="w-3 h-3 mr-1.5 text-yellow-400" />
                        <span className="font-medium">
                          {character.likes > 1000 ? `${(character.likes / 1000).toFixed(1)}K` : character.likes}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
        {activeTab === "Characters" && (
          <div ref={infiniteScrollRef} className="flex justify-center items-center py-8 min-h-[80px]">
            {infiniteScrollLoading && (
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm font-medium">Loading more characters...</span>
              </div>
            )}
            {!infiniteScrollHasMore && !infiniteScrollLoading && characters.length > 16 && (
              <div className="text-center">
                <p className="text-muted-foreground text-sm font-medium mb-2">You've reached the end</p>
                <Button onClick={() => scrollUtils.scrollToTop()} variant="outline" size="sm" className="text-xs">
                  Back to top
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onNavigate={handleSidebarNavigate} />

      {/* Click outside to close dropdowns */}
      {(showSortDropdown || showGenderDropdown || showTagsDropdown) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => {
            setShowSortDropdown(false)
            setShowGenderDropdown(false)
            setShowTagsDropdown(false)
          }}
        />
      )}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Scroll to Top Button */}
      <ScrollToTop threshold={300} />
    </div>
  )
}
