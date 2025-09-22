// Premium Roleplay Quality Metrics and Monitoring

export interface RoleplayMetrics {
  responseTime: number;
  characterConsistency: number;
  immersionLevel: number;
  userEngagement: number;
  qualityScore: number;
}

export interface ConversationAnalysis {
  totalMessages: number;
  averageResponseLength: number;
  characterTraitsUsed: string[];
  conversationFlow: "excellent" | "good" | "needs_improvement";
  emotionalRange: string[];
  topicConsistency: number;
}

class RoleplayQualityMonitor {
  private metrics: Map<string, RoleplayMetrics[]> = new Map();
  private conversationData: Map<string, any[]> = new Map();

  // Track response quality metrics
  recordResponse(
    characterId: string,
    responseTime: number,
    response: string,
    characterAnalysis: any,
  ) {
    const metrics: RoleplayMetrics = {
      responseTime,
      characterConsistency: characterAnalysis?.consistency_score || 85,
      immersionLevel: this.calculateImmersionLevel(response),
      userEngagement: this.calculateEngagement(response),
      qualityScore: this.calculateOverallQuality(response, characterAnalysis),
    };

    if (!this.metrics.has(characterId)) {
      this.metrics.set(characterId, []);
    }

    this.metrics.get(characterId)!.push(metrics);

    // Keep only last 50 responses for performance
    if (this.metrics.get(characterId)!.length > 50) {
      this.metrics.get(characterId)!.shift();
    }
  }

  // Calculate immersion level based on response content
  private calculateImmersionLevel(response: string): number {
    let score = 60; // Base score

    // Check for action descriptions
    if (response.includes("*")) {
      score += 15;
    }

    // Check for sensory details
    const sensoryWords = [
      "sees",
      "hears",
      "feels",
      "smells",
      "tastes",
      "touches",
      "notices",
    ];
    if (sensoryWords.some((word) => response.toLowerCase().includes(word))) {
      score += 10;
    }

    // Check for emotional expression
    const emotionWords = [
      "excited",
      "happy",
      "curious",
      "thoughtful",
      "amazed",
      "surprised",
    ];
    if (emotionWords.some((word) => response.toLowerCase().includes(word))) {
      score += 10;
    }

    // Check for environment references
    if (
      response.toLowerCase().includes("lab") ||
      response.toLowerCase().includes("equipment") ||
      response.toLowerCase().includes("holographic")
    ) {
      score += 10;
    }

    // Penalty for very short responses
    if (response.length < 100) {
      score -= 20;
    }

    return Math.min(Math.max(score, 0), 100);
  }

  // Calculate user engagement potential
  private calculateEngagement(response: string): number {
    let score = 50; // Base score

    // Questions encourage engagement
    const questionCount = (response.match(/\?/g) || []).length;
    score += questionCount * 8;

    // Exclamations show energy
    const exclamationCount = (response.match(/!/g) || []).length;
    score += Math.min(exclamationCount * 5, 15);

    // Invitations to interact
    const invitationWords = [
      "want to",
      "would you like",
      "shall we",
      "how about",
      "what do you think",
    ];
    if (
      invitationWords.some((phrase) => response.toLowerCase().includes(phrase))
    ) {
      score += 15;
    }

    // Response length optimization
    if (response.length >= 150 && response.length <= 350) {
      score += 10; // Optimal length
    } else if (response.length > 350) {
      score -= 5; // Too long might reduce engagement
    }

    return Math.min(Math.max(score, 0), 100);
  }

  // Calculate overall quality score
  private calculateOverallQuality(
    response: string,
    characterAnalysis: any,
  ): number {
    const consistency = characterAnalysis?.consistency_score || 85;
    const immersion = this.calculateImmersionLevel(response);
    const engagement = this.calculateEngagement(response);

    // Weighted average
    const quality = consistency * 0.4 + immersion * 0.35 + engagement * 0.25;

    return Math.round(quality);
  }

  // Get quality insights for a character
  getCharacterInsights(characterId: string): ConversationAnalysis | null {
    const responses = this.metrics.get(characterId);
    if (!responses || responses.length === 0) {
      return null;
    }

    const averageQuality =
      responses.reduce((sum, r) => sum + r.qualityScore, 0) / responses.length;
    const averageResponseTime =
      responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length;

    return {
      totalMessages: responses.length,
      averageResponseLength: 0, // Would need to track this separately
      characterTraitsUsed: [], // Would need to aggregate from character analysis
      conversationFlow:
        averageQuality > 85
          ? "excellent"
          : averageQuality > 70
            ? "good"
            : "needs_improvement",
      emotionalRange: [], // Would analyze emotional variety
      topicConsistency: Math.round(
        responses.reduce((sum, r) => sum + r.characterConsistency, 0) /
          responses.length,
      ),
    };
  }

  // Get real-time quality dashboard data
  getQualityDashboard(characterId: string) {
    const responses = this.metrics.get(characterId);
    if (!responses || responses.length === 0) {
      return {
        averageQuality: 0,
        averageResponseTime: 0,
        consistency: 0,
        immersion: 0,
        engagement: 0,
        trend: "stable",
      };
    }

    const recent = responses.slice(-10); // Last 10 responses
    const earlier = responses.slice(-20, -10); // Previous 10 responses

    const recentAvg =
      recent.reduce((sum, r) => sum + r.qualityScore, 0) / recent.length;
    const earlierAvg =
      earlier.length > 0
        ? earlier.reduce((sum, r) => sum + r.qualityScore, 0) / earlier.length
        : recentAvg;

    const trend =
      recentAvg > earlierAvg + 5
        ? "improving"
        : recentAvg < earlierAvg - 5
          ? "declining"
          : "stable";

    return {
      averageQuality: Math.round(recentAvg),
      averageResponseTime: Math.round(
        recent.reduce((sum, r) => sum + r.responseTime, 0) / recent.length,
      ),
      consistency: Math.round(
        recent.reduce((sum, r) => sum + r.characterConsistency, 0) /
          recent.length,
      ),
      immersion: Math.round(
        recent.reduce((sum, r) => sum + r.immersionLevel, 0) / recent.length,
      ),
      engagement: Math.round(
        recent.reduce((sum, r) => sum + r.userEngagement, 0) / recent.length,
      ),
      trend,
    };
  }

  // Performance optimization recommendations
  getOptimizationRecommendations(characterId: string): string[] {
    const dashboard = this.getQualityDashboard(characterId);
    const recommendations: string[] = [];

    if (dashboard.averageResponseTime > 3000) {
      recommendations.push(
        "Consider optimizing prompt length for faster responses",
      );
    }

    if (dashboard.consistency < 80) {
      recommendations.push(
        "Character consistency could be improved with better trait definitions",
      );
    }

    if (dashboard.immersion < 75) {
      recommendations.push(
        "Add more sensory details and environmental descriptions",
      );
    }

    if (dashboard.engagement < 70) {
      recommendations.push(
        "Include more questions and interactive elements in responses",
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Character performance is excellent! No optimizations needed.",
      );
    }

    return recommendations;
  }
}

// Global instance for the application
export const roleplayMonitor = new RoleplayQualityMonitor();

// Quality benchmarks for different character types
export const QUALITY_BENCHMARKS = {
  scientist: {
    minConsistency: 85,
    minImmersion: 80,
    minEngagement: 75,
    preferredResponseTime: 2000,
  },
  casual: {
    minConsistency: 80,
    minImmersion: 70,
    minEngagement: 80,
    preferredResponseTime: 1500,
  },
  professional: {
    minConsistency: 90,
    minImmersion: 75,
    minEngagement: 70,
    preferredResponseTime: 2500,
  },
};

// Helper function to determine character type for benchmarking
export function getCharacterType(
  character: any,
): keyof typeof QUALITY_BENCHMARKS {
  const description = (character.description || "").toLowerCase();
  const personality = (character.personality || "").toLowerCase();

  if (
    description.includes("scientist") ||
    description.includes("research") ||
    description.includes("physics")
  ) {
    return "scientist";
  }

  if (
    description.includes("professional") ||
    description.includes("formal") ||
    personality.includes("serious")
  ) {
    return "professional";
  }

  return "casual";
}

// Utility to check if response meets quality standards
export function meetsQualityStandards(
  response: string,
  characterAnalysis: any,
  characterType: keyof typeof QUALITY_BENCHMARKS,
): boolean {
  const monitor = new RoleplayQualityMonitor();
  const immersion = monitor["calculateImmersionLevel"](response);
  const engagement = monitor["calculateEngagement"](response);
  const consistency = characterAnalysis?.consistency_score || 85;

  const benchmarks = QUALITY_BENCHMARKS[characterType];

  return (
    consistency >= benchmarks.minConsistency &&
    immersion >= benchmarks.minImmersion &&
    engagement >= benchmarks.minEngagement
  );
}
