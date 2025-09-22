"use client";

import { useState, useCallback } from "react";
import {
  ArrowLeft,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Clock,
  AlertTriangle,
  Flag,
  UserPlus,
  Heart,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FormattedText from "./chat/formatted-text";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import type { Character } from "@/lib/types";

interface BotProfilePageProps {
  character: Character;
  onBack: () => void;
  onStartChat: () => void;
  onViewCreatorProfile?: (creatorId: string) => void;
}

interface Review {
  id: string;
  user: {
    name: string;
    avatar: string;
    badge?: string;
  };
  rating: "up" | "down" | "neutral";
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

export default function BotProfilePage({
  character,
  onBack,
  onStartChat,
  onViewCreatorProfile,
}: BotProfilePageProps) {
  const [reviewText, setReviewText] = useState("");
  const [userRating, setUserRating] = useState<"up" | "down" | "neutral">("up");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [characterLikes, setCharacterLikes] = useState(character.likes);
  const [characterDislikes, setCharacterDislikes] = useState(
    Math.floor(character.likes * 0.1),
  ); // Assume 10% dislikes
  // Calculate stats based on character likes and create realistic review counts
  const baseReviews = Math.floor(character.likes / 2500) || 1; // 1 review per 2500 likes
  const [totalReviews, setTotalReviews] = useState(baseReviews);
  const [upvotes, setUpvotes] = useState(Math.floor(baseReviews * 0.7)); // 70% positive reviews
  const [downvotes, setDownvotes] = useState(Math.floor(baseReviews * 0.1)); // 10% negative reviews
  // Generate realistic reviews based on character data
  const generateCharacterReviews = (): Review[] => {
    const reviewTemplates = [
      {
        type: "personality",
        content: `${character.name} has such an interesting personality! Really well developed character.`,
      },
      {
        type: "description",
        content: `Love the concept and background. ${character.description.slice(0, 100)}...`,
      },
      {
        type: "tags",
        content: `Perfect for ${character.tags.slice(0, 2).join(" and ")} roleplay. Highly recommend!`,
      },
      {
        type: "creator",
        content: `${character.creator} always creates amazing characters. This one is no exception!`,
      },
      {
        type: "generic",
        content:
          "Great character, very engaging conversations and stays in character well.",
      },
    ];

    const userNames = [
      "CharacterLover42",
      "RPMaster",
      "StoryTeller99",
      "ChatEnthusiast",
      "FantasyFan",
      "AICompanion",
      "RoleplayPro",
      "CreativeWriter",
    ];

    const timeStamps = [
      "2h ago",
      "1d ago",
      "3d ago",
      "1w ago",
      "2w ago",
      "1m ago",
    ];

    return Array.from({ length: Math.min(baseReviews, 5) }, (_, i) => ({
      id: `review_${i + 1}`,
      user: {
        name: userNames[i % userNames.length],
        avatar: "/placeholder.svg",
        badge: i === 0 ? "👑" : undefined,
      },
      rating: i < Math.floor(baseReviews * 0.8) ? "up" : "down",
      content: reviewTemplates[i % reviewTemplates.length].content,
      timestamp: timeStamps[i % timeStamps.length],
      likes: Math.floor(Math.random() * 20) + 5,
      isLiked: Math.random() > 0.7,
    }));
  };

  const [reviews, setReviews] = useState<Review[]>(generateCharacterReviews());

  // Functional button handlers

  const handleFollow = useCallback(() => {
    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);
  }, [isFollowing, character.creator]);

  const handleFavorite = useCallback(() => {
    const newFavoritedState = !isFavorited;
    setIsFavorited(newFavoritedState);
  }, [isFavorited, character.name, character.id]);

  const handleReport = useCallback(() => {
    // Report functionality would be implemented here
  }, []);

  const handleLikeCharacter = useCallback(() => {
    if (isLiked) {
      // Unlike the character
      setIsLiked(false);
      setCharacterLikes((prev) => prev - 1);
    } else {
      // Like the character
      setIsLiked(true);
      setCharacterLikes((prev) => prev + 1);

      // If user previously disliked, remove dislike
      if (isDisliked) {
        setIsDisliked(false);
        setCharacterDislikes((prev) => prev - 1);
      }
    }
  }, [isLiked, isDisliked, character.name]);

  const handleDislikeCharacter = useCallback(() => {
    if (isDisliked) {
      // Remove dislike
      setIsDisliked(false);
      setCharacterDislikes((prev) => prev - 1);
    } else {
      // Dislike the character
      setIsDisliked(true);
      setCharacterDislikes((prev) => prev + 1);

      // If user previously liked, remove like
      if (isLiked) {
        setIsLiked(false);
        setCharacterLikes((prev) => prev - 1);
      }
    }
  }, [isDisliked, isLiked, character.name]);

  const handlePostReview = useCallback(() => {
    if (!reviewText.trim()) {
      return;
    }

    const newReview: Review = {
      id: Date.now().toString(),
      user: { name: "You", avatar: "/placeholder.svg" },
      rating: userRating,
      content: reviewText,
      timestamp: "now",
      likes: 0,
      isLiked: false,
    };

    setReviews((prev) => [newReview, ...prev]);
    setTotalReviews((prev) => prev + 1);

    if (userRating === "up") {
      setUpvotes((prev) => prev + 1);
    } else if (userRating === "down") {
      setDownvotes((prev) => prev + 1);
    }

    setReviewText("");
    setUserRating("up");
  }, [reviewText, userRating, character.id, character.name]);

  const handleLikeReview = useCallback((reviewId: string) => {
    setReviews((prev) =>
      prev.map((review) => {
        if (review.id === reviewId) {
          return {
            ...review,
            isLiked: !review.isLiked,
            likes: review.isLiked ? review.likes - 1 : review.likes + 1,
          };
        }
        return review;
      }),
    );
  }, []);

  const handleViewCreatorProfile = useCallback(() => {
    if (onViewCreatorProfile) {
      onViewCreatorProfile(character.creator);
    }
  }, [character.creator, onViewCreatorProfile]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex-shrink-0 bg-card/95 border-b border-border px-4 py-3">
        <div className="flex items-center">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white hover:bg-slate-700/50 h-8 w-8 p-0 mr-3"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold text-white" style={{ fontSize: "14px" }}>
            Bot profile
          </h1>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Character Image */}
          <div className="relative">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/30">
              <img
                src={character.image || character.avatar || "/placeholder.svg"}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Character Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2
                className="font-bold text-white truncate"
                style={{ fontSize: "14px" }}
              >
                {character.name}
              </h2>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={onStartChat}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-full font-medium"
                  style={{ fontSize: "12px" }}
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Chat with me
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div
              className="flex items-center space-x-4 text-slate-400"
              style={{ fontSize: "12px" }}
            >
              <div className="flex items-center">
                <MessageCircle className="h-3 w-3 mr-1" />
                <span>{(characterLikes / 1000).toFixed(1)}k</span>
              </div>
              <Button
                onClick={handleLikeCharacter}
                variant="ghost"
                size="sm"
                className={`p-1 h-auto flex items-center space-x-1 ${isLiked ? "text-green-400" : "text-slate-400 hover:text-green-400"}`}
              >
                <ThumbsUp className="h-3 w-3" />
                <span>{(characterLikes / 1000).toFixed(1)}k</span>
              </Button>
              <Button
                onClick={handleDislikeCharacter}
                variant="ghost"
                size="sm"
                className={`p-1 h-auto flex items-center space-x-1 ${isDisliked ? "text-red-400" : "text-slate-400 hover:text-red-400"}`}
              >
                <ThumbsDown className="h-3 w-3" />
                <span>
                  {characterDislikes > 999
                    ? (characterDislikes / 1000).toFixed(1) + "k"
                    : characterDislikes}
                </span>
              </Button>
              <Button
                onClick={handleFavorite}
                variant="ghost"
                size="sm"
                className={`p-1 h-auto ${isFavorited ? "text-red-400" : "text-slate-400 hover:text-red-400"}`}
              >
                <Heart
                  className={`h-3 w-3 ${isFavorited ? "fill-current" : ""}`}
                />
              </Button>
            </div>

            {/* Description */}
            <div className="text-slate-300" style={{ fontSize: "12px" }}>
              <FormattedText content={character.description} />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {character.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-slate-700/50 text-slate-300 hover:bg-slate-700/70 border-slate-600/50 px-2 py-1"
                  style={{ fontSize: "10px" }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Character Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div
                className="flex space-x-3 text-slate-400"
                style={{ fontSize: "12px" }}
              >
                <span>{character.race || "Human"}</span>
                <span>•</span>
                <span>
                  {character.location || character.charClass || "Unknown"}
                </span>
                <span>•</span>
                <span className="capitalize">{character.gender}</span>
              </div>
            </div>

            {/* Creator Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400" style={{ fontSize: "12px" }}>
                  Create by
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-red-400">🌶️</span>
                  <Button
                    onClick={handleViewCreatorProfile}
                    variant="ghost"
                    className="text-white font-medium p-0 h-auto hover:text-cyan-400"
                    style={{ fontSize: "12px" }}
                  >
                    {character.creator}
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleFollow}
                  variant={isFollowing ? "secondary" : "default"}
                  size="sm"
                  className={`${
                    isFollowing
                      ? "bg-slate-700 text-white hover:bg-slate-600"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  } px-3 py-1 rounded-full font-medium`}
                  style={{ fontSize: "11px" }}
                >
                  {isFollowing ? "Following" : "+ Follow"}
                </Button>
                <Button
                  onClick={handleReport}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-yellow-400 hover:bg-slate-700/50 h-7 w-7 p-0"
                >
                  <AlertTriangle className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs for Reviews and Posts */}
          <Tabs defaultValue="review" className="w-full">
            <TabsList className="w-full bg-slate-800/50 border border-slate-700/50">
              <TabsTrigger
                value="review"
                className="flex-1 text-white data-[state=active]:bg-slate-700"
                style={{ fontSize: "12px" }}
              >
                Review
              </TabsTrigger>
              <TabsTrigger
                value="post"
                className="flex-1 text-slate-400 data-[state=active]:bg-slate-700"
                style={{ fontSize: "12px" }}
              >
                Post
              </TabsTrigger>
            </TabsList>

            <TabsContent value="review" className="space-y-3 mt-4">
              {/* Review Input */}
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-3 space-y-3">
                  <Textarea
                    placeholder="Type your reviews about character"
                    defaultValue={reviewText}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      setReviewText(target.value);
                    }}
                    className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 resize-none min-h-[60px]"
                    style={{ fontSize: "12px" }}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Button
                        onClick={() => setUserRating("up")}
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 ${
                          userRating === "up"
                            ? "bg-green-600 text-white"
                            : "text-slate-400 hover:text-green-400"
                        }`}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => setUserRating("down")}
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 ${
                          userRating === "down"
                            ? "bg-red-600 text-white"
                            : "text-slate-400 hover:text-red-400"
                        }`}
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      onClick={handlePostReview}
                      disabled={!reviewText.trim()}
                      className="bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white px-3 py-1 rounded-lg font-medium"
                      style={{ fontSize: "11px" }}
                    >
                      Post review
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Review Stats */}
              <div className="text-slate-400" style={{ fontSize: "12px" }}>
                {totalReviews} reviews ({upvotes}{" "}
                <ThumbsUp className="inline h-3 w-3" /> {downvotes}{" "}
                <ThumbsDown className="inline h-3 w-3" />)
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.map((review) => (
                  <Card
                    key={review.id}
                    className="bg-slate-800/30 border-slate-700/30"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-2">
                        <Avatar className="h-7 w-7 flex-shrink-0">
                          <AvatarImage src={review.user.avatar} />
                          <AvatarFallback
                            className="bg-slate-700 text-white"
                            style={{ fontSize: "10px" }}
                          >
                            {review.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span
                              className="font-medium text-white"
                              style={{ fontSize: "12px" }}
                            >
                              {review.user.name}
                            </span>
                            {review.user.badge && (
                              <span style={{ fontSize: "11px" }}>
                                {review.user.badge}
                              </span>
                            )}
                            <div
                              className={`${
                                review.rating === "up"
                                  ? "text-green-400"
                                  : review.rating === "down"
                                    ? "text-red-400"
                                    : "text-slate-400"
                              }`}
                            >
                              {review.rating === "up" && (
                                <ThumbsUp className="h-3 w-3" />
                              )}
                              {review.rating === "down" && (
                                <ThumbsDown className="h-3 w-3" />
                              )}
                            </div>
                            <span
                              className="text-slate-500"
                              style={{ fontSize: "10px" }}
                            >
                              {review.timestamp}
                            </span>
                          </div>
                          <p
                            className="text-slate-300 leading-relaxed mb-2"
                            style={{ fontSize: "12px" }}
                          >
                            {review.content}
                          </p>
                          <div className="flex items-center space-x-3">
                            <Button
                              onClick={() => handleLikeReview(review.id)}
                              variant="ghost"
                              size="sm"
                              className={`h-6 p-0 ${review.isLiked ? "text-red-400" : "text-slate-400 hover:text-red-400"}`}
                            >
                              <Heart
                                className={`h-3 w-3 mr-1 ${review.isLiked ? "fill-current" : ""}`}
                              />
                              <span style={{ fontSize: "11px" }}>
                                {review.likes}
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-500 hover:text-slate-300 h-6 p-0"
                              style={{ fontSize: "11px" }}
                            >
                              Reply
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-500 hover:text-yellow-400 h-6 p-0"
                            >
                              <Flag className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="post" className="space-y-4 mt-4">
              <div className="text-center text-slate-400 py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p style={{ fontSize: "12px" }}>No posts yet</p>
                <p className="text-slate-500 mt-1" style={{ fontSize: "11px" }}>
                  Posts and updates from the creator will appear here
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
