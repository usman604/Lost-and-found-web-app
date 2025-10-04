import { LostItem, FoundItem, InsertMatchRequest } from "@shared/schema";
import { storage } from "../storage";
import { createNotification } from "./notifier";

interface MatchScore {
  lostItem: LostItem;
  foundItem: FoundItem;
  score: number;
  breakdown: {
    category: number;
    location: number;
    date: number;
    keywords: number;
    images: number;
  };
}

/**
 * Matching Engine for Campus Lost & Found
 * 
 * Scoring Algorithm:
 * - Category match: 40 points (exact match)
 * - Location exact match: 20 points
 * - Date proximity: up to 15 points (closer dates = higher score)
 * - Keyword overlap: up to 20 points (based on description similarity)
 * - Images present: 5 points bonus
 * 
 * Threshold: ≥60 points creates a match request
 */
export class MatchingEngine {
  private static readonly THRESHOLD = 60;
  private static readonly WEIGHTS = {
    CATEGORY: 40,
    LOCATION: 20,
    DATE_PROXIMITY: 15,
    KEYWORD_OVERLAP: 20,
    IMAGES_PRESENT: 5,
  };

  /**
   * Run matching engine for a new lost item against all found items
   */
  static async matchLostItem(lostItem: LostItem): Promise<void> {
    console.log(`[MatchingEngine] Running matches for lost item: ${lostItem.title}`);
    
    const foundItems = await storage.getFoundItems();
    const matches: MatchScore[] = [];

    for (const foundItem of foundItems) {
      // Skip if same user
      if (foundItem.user_id === lostItem.user_id) continue;
      
      // Skip if found item is already matched
      if (foundItem.status !== "pending") continue;

      const score = this.calculateMatchScore(lostItem, foundItem);
      
      if (score.score >= this.THRESHOLD) {
        matches.push(score);
        console.log(`[MatchingEngine] Match found! Score: ${score.score} for ${lostItem.title} <-> ${foundItem.title}`);
      }
    }

    // Create match requests for qualifying matches
    for (const match of matches) {
      await this.createMatchRequest(match);
    }

    console.log(`[MatchingEngine] Created ${matches.length} match requests for lost item: ${lostItem.title}`);
  }

  /**
   * Run matching engine for a new found item against all lost items
   */
  static async matchFoundItem(foundItem: FoundItem): Promise<void> {
    console.log(`[MatchingEngine] Running matches for found item: ${foundItem.title}`);
    
    const lostItems = await storage.getLostItems();
    const matches: MatchScore[] = [];

    for (const lostItem of lostItems) {
      // Skip if same user
      if (lostItem.user_id === foundItem.user_id) continue;
      
      // Skip if lost item is already matched
      if (lostItem.status !== "pending") continue;

      const score = this.calculateMatchScore(lostItem, foundItem);
      
      if (score.score >= this.THRESHOLD) {
        matches.push(score);
        console.log(`[MatchingEngine] Match found! Score: ${score.score} for ${lostItem.title} <-> ${foundItem.title}`);
      }
    }

    // Create match requests for qualifying matches
    for (const match of matches) {
      await this.createMatchRequest(match);
    }

    console.log(`[MatchingEngine] Created ${matches.length} match requests for found item: ${foundItem.title}`);
  }

  /**
   * Calculate match score between a lost and found item
   */
  private static calculateMatchScore(lostItem: LostItem, foundItem: FoundItem): MatchScore {
    let totalScore = 0;
    const breakdown = {
      category: 0,
      location: 0,
      date: 0,
      keywords: 0,
      images: 0,
    };

    // 1. Category match (40 points)
    if (lostItem.category.toLowerCase() === foundItem.category.toLowerCase()) {
      breakdown.category = this.WEIGHTS.CATEGORY;
      totalScore += this.WEIGHTS.CATEGORY;
    }

    // 2. Location exact match (20 points)
    if (lostItem.location.toLowerCase() === foundItem.location.toLowerCase()) {
      breakdown.location = this.WEIGHTS.LOCATION;
      totalScore += this.WEIGHTS.LOCATION;
    }

    // 3. Date proximity (up to 15 points)
    const dateScore = this.calculateDateProximityScore(lostItem.date_lost, foundItem.date_found);
    breakdown.date = dateScore;
    totalScore += dateScore;

    // 4. Keyword overlap (up to 20 points)
    const keywordScore = this.calculateKeywordScore(lostItem.title + " " + lostItem.description, foundItem.title + " " + foundItem.description);
    breakdown.keywords = keywordScore;
    totalScore += keywordScore;

    // 5. Images present bonus (5 points)
    if (lostItem.image_path && foundItem.image_path) {
      breakdown.images = this.WEIGHTS.IMAGES_PRESENT;
      totalScore += this.WEIGHTS.IMAGES_PRESENT;
    }

    return {
      lostItem,
      foundItem,
      score: Math.round(totalScore),
      breakdown,
    };
  }

  /**
   * Calculate date proximity score (closer dates = higher score)
   */
  private static calculateDateProximityScore(lostDate: Date, foundDate: Date): number {
    const daysDiff = Math.abs((lostDate.getTime() - foundDate.getTime()) / (1000 * 3600 * 24));
    
    if (daysDiff === 0) return this.WEIGHTS.DATE_PROXIMITY; // Same day
    if (daysDiff <= 1) return Math.round(this.WEIGHTS.DATE_PROXIMITY * 0.9); // 1 day
    if (daysDiff <= 3) return Math.round(this.WEIGHTS.DATE_PROXIMITY * 0.7); // 3 days
    if (daysDiff <= 7) return Math.round(this.WEIGHTS.DATE_PROXIMITY * 0.5); // 1 week
    if (daysDiff <= 30) return Math.round(this.WEIGHTS.DATE_PROXIMITY * 0.2); // 1 month
    
    return 0; // More than 1 month
  }

  /**
   * Calculate keyword overlap score using simple word matching
   */
  private static calculateKeywordScore(lostText: string, foundText: string): number {
    const lostWords = this.extractKeywords(lostText);
    const foundWords = this.extractKeywords(foundText);
    
    if (lostWords.length === 0 || foundWords.length === 0) return 0;

    const intersection = lostWords.filter(word => foundWords.includes(word));
    const union = [...new Set([...lostWords, ...foundWords])];
    
    const jaccardSimilarity = intersection.length / union.length;
    return Math.round(jaccardSimilarity * this.WEIGHTS.KEYWORD_OVERLAP);
  }

  /**
   * Extract meaningful keywords from text
   */
  private static extractKeywords(text: string): string[] {
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", 
      "is", "are", "was", "were", "be", "been", "have", "has", "had", "will", "would", "could", "should",
      "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them", "my", "your", "his", "her", "its", "our", "their"
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates
  }

  /**
   * Create a match request and send notifications
   */
  private static async createMatchRequest(match: MatchScore): Promise<void> {
    // Create the match request
    const matchRequest: InsertMatchRequest = {
      lost_id: match.lostItem.id,
      found_id: match.foundItem.id,
      score: match.score,
      status: "pending",
    };

    const createdMatch = await storage.createMatchRequest(matchRequest);

    // Notify the users and admin
    await createNotification({
      user_id: match.lostItem.user_id,
      title: "Potential Match Found!",
      body: `Your lost item "${match.lostItem.title}" might match a found item. Score: ${match.score}%`,
      link: `/dashboard?tab=matches`,
    });

    await createNotification({
      user_id: match.foundItem.user_id,
      title: "Potential Match Found!",
      body: `Your found item "${match.foundItem.title}" might match a lost item. Score: ${match.score}%`,
      link: `/dashboard?tab=matches`,
    });

    // Notify admin
    const adminUsers = (await storage.getUsers()).filter(user => user.role === "admin");
    for (const admin of adminUsers) {
      await createNotification({
        user_id: admin.id,
        title: "New Match Request",
        body: `Match between "${match.lostItem.title}" and "${match.foundItem.title}" requires review (Score: ${match.score}%)`,
        link: `/admin/matches/${createdMatch.id}`,
      });
    }
  }

  /**
   * Manual match generation for admin use
   */
  static async generateAllMatches(): Promise<number> {
    console.log("[MatchingEngine] Running full match generation...");
    
    const lostItems = await storage.getLostItems();
    const foundItems = await storage.getFoundItems();
    let matchCount = 0;

    for (const lostItem of lostItems) {
      if (lostItem.status === "pending") {
        await this.matchLostItem(lostItem);
        matchCount++;
      }
    }

    console.log(`[MatchingEngine] Full match generation completed. Processed ${matchCount} lost items.`);
    return matchCount;
  }
}
