import { 
  type User, 
  type InsertUser, 
  type LostItem, 
  type InsertLostItem,
  type FoundItem,
  type InsertFoundItem,
  type MatchRequest,
  type InsertMatchRequest,
  type Notification,
  type InsertNotification,
  type LostItemWithUser,
  type FoundItemWithUser,
  type MatchRequestWithItems,
  users,
  lostItems,
  foundItems,
  matchRequests,
  notifications
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, like, desc, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import type { IStorage } from "./storage";

export class PostgreSQLStorage implements IStorage {
  
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const result = await db.insert(users).values({
      name: insertUser.name,
      email: insertUser.email,
      university_id: insertUser.university_id,
      password_hash: hashedPassword,
      role: "student",
      verified: insertUser.email.endsWith("@university.test"),
    }).returning();
    return result[0];
  }

  async verifyUser(id: string): Promise<void> {
    await db.update(users).set({ verified: true }).where(eq(users.id, id));
  }

  async createLostItem(item: InsertLostItem, userId: string): Promise<LostItem> {
    const result = await db.insert(lostItems).values({
      user_id: userId,
      title: item.title,
      category: item.category,
      description: item.description,
      location: item.location,
      image_path: item.image_path,
      date_lost: item.date_lost,
      status: "pending",
    }).returning();
    return result[0];
  }

  async getLostItems(filters?: { category?: string; location?: string; search?: string }): Promise<LostItemWithUser[]> {
    const conditions = [];
    
    if (filters?.category && filters.category !== "All Categories") {
      conditions.push(eq(lostItems.category, filters.category));
    }
    if (filters?.location && filters.location !== "All Locations") {
      conditions.push(eq(lostItems.location, filters.location));
    }
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          like(lostItems.title, searchTerm),
          like(lostItems.description, searchTerm)
        )
      );
    }

    const items = await db
      .select({
        id: lostItems.id,
        user_id: lostItems.user_id,
        title: lostItems.title,
        category: lostItems.category,
        description: lostItems.description,
        location: lostItems.location,
        image_path: lostItems.image_path,
        date_lost: lostItems.date_lost,
        status: lostItems.status,
        created_at: lostItems.created_at,
        userName: users.name,
        universityId: users.university_id,
      })
      .from(lostItems)
      .leftJoin(users, eq(lostItems.user_id, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return items.map(item => ({
      id: item.id,
      user_id: item.user_id,
      title: item.title,
      category: item.category,
      description: item.description,
      location: item.location,
      image_path: item.image_path,
      date_lost: item.date_lost,
      status: item.status,
      created_at: item.created_at,
      user: {
        name: item.userName || "Unknown",
        university_id: item.universityId || "Unknown"
      }
    }));
  }

  async getLostItem(id: string): Promise<LostItemWithUser | undefined> {
    const items = await db
      .select({
        id: lostItems.id,
        user_id: lostItems.user_id,
        title: lostItems.title,
        category: lostItems.category,
        description: lostItems.description,
        location: lostItems.location,
        image_path: lostItems.image_path,
        date_lost: lostItems.date_lost,
        status: lostItems.status,
        created_at: lostItems.created_at,
        userName: users.name,
        universityId: users.university_id,
      })
      .from(lostItems)
      .leftJoin(users, eq(lostItems.user_id, users.id))
      .where(eq(lostItems.id, id));

    if (items.length === 0) return undefined;

    const item = items[0];
    return {
      id: item.id,
      user_id: item.user_id,
      title: item.title,
      category: item.category,
      description: item.description,
      location: item.location,
      image_path: item.image_path,
      date_lost: item.date_lost,
      status: item.status,
      created_at: item.created_at,
      user: {
        name: item.userName || "Unknown",
        university_id: item.universityId || "Unknown"
      }
    };
  }

  async getUserLostItems(userId: string): Promise<LostItem[]> {
    return await db.select().from(lostItems).where(eq(lostItems.user_id, userId));
  }

  async deleteLostItem(id: string, userId: string): Promise<void> {
    await db.delete(lostItems).where(and(eq(lostItems.id, id), eq(lostItems.user_id, userId)));
  }

  async updateLostItemStatus(id: string, status: string): Promise<void> {
    await db.update(lostItems).set({ status: status as any }).where(eq(lostItems.id, id));
  }

  async createFoundItem(item: InsertFoundItem, userId: string): Promise<FoundItem> {
    const result = await db.insert(foundItems).values({
      user_id: userId,
      title: item.title,
      category: item.category,
      description: item.description,
      location: item.location,
      image_path: item.image_path,
      date_found: item.date_found,
      status: "pending",
    }).returning();
    return result[0];
  }

  async getFoundItems(filters?: { category?: string; location?: string; search?: string }): Promise<FoundItemWithUser[]> {
    const conditions = [];
    
    if (filters?.category && filters.category !== "All Categories") {
      conditions.push(eq(foundItems.category, filters.category));
    }
    if (filters?.location && filters.location !== "All Locations") {
      conditions.push(eq(foundItems.location, filters.location));
    }
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          like(foundItems.title, searchTerm),
          like(foundItems.description, searchTerm)
        )
      );
    }

    const items = await db
      .select({
        id: foundItems.id,
        user_id: foundItems.user_id,
        title: foundItems.title,
        category: foundItems.category,
        description: foundItems.description,
        location: foundItems.location,
        image_path: foundItems.image_path,
        date_found: foundItems.date_found,
        status: foundItems.status,
        created_at: foundItems.created_at,
        userName: users.name,
        universityId: users.university_id,
      })
      .from(foundItems)
      .leftJoin(users, eq(foundItems.user_id, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return items.map(item => ({
      id: item.id,
      user_id: item.user_id,
      title: item.title,
      category: item.category,
      description: item.description,
      location: item.location,
      image_path: item.image_path,
      date_found: item.date_found,
      status: item.status,
      created_at: item.created_at,
      user: {
        name: item.userName || "Unknown",
        university_id: item.universityId || "Unknown"
      }
    }));
  }

  async getFoundItem(id: string): Promise<FoundItemWithUser | undefined> {
    const items = await db
      .select({
        id: foundItems.id,
        user_id: foundItems.user_id,
        title: foundItems.title,
        category: foundItems.category,
        description: foundItems.description,
        location: foundItems.location,
        image_path: foundItems.image_path,
        date_found: foundItems.date_found,
        status: foundItems.status,
        created_at: foundItems.created_at,
        userName: users.name,
        universityId: users.university_id,
      })
      .from(foundItems)
      .leftJoin(users, eq(foundItems.user_id, users.id))
      .where(eq(foundItems.id, id));

    if (items.length === 0) return undefined;

    const item = items[0];
    return {
      id: item.id,
      user_id: item.user_id,
      title: item.title,
      category: item.category,
      description: item.description,
      location: item.location,
      image_path: item.image_path,
      date_found: item.date_found,
      status: item.status,
      created_at: item.created_at,
      user: {
        name: item.userName || "Unknown",
        university_id: item.universityId || "Unknown"
      }
    };
  }

  async getUserFoundItems(userId: string): Promise<FoundItem[]> {
    return await db.select().from(foundItems).where(eq(foundItems.user_id, userId));
  }

  async deleteFoundItem(id: string, userId: string): Promise<void> {
    await db.delete(foundItems).where(and(eq(foundItems.id, id), eq(foundItems.user_id, userId)));
  }

  async updateFoundItemStatus(id: string, status: string): Promise<void> {
    await db.update(foundItems).set({ status: status as any }).where(eq(foundItems.id, id));
  }

  async createMatchRequest(match: InsertMatchRequest): Promise<MatchRequest> {
    const result = await db.insert(matchRequests).values({
      lost_id: match.lost_id,
      found_id: match.found_id,
      score: match.score,
      status: "pending",
    }).returning();
    return result[0];
  }

  async getMatchRequests(): Promise<MatchRequestWithItems[]> {
    const matches = await db.select().from(matchRequests);
    return await this.enrichMatchesWithItems(matches);
  }

  async getPendingMatchRequests(): Promise<MatchRequestWithItems[]> {
    const matches = await db.select().from(matchRequests).where(eq(matchRequests.status, "pending"));
    return await this.enrichMatchesWithItems(matches);
  }

  async updateMatchRequestStatus(id: string, status: string): Promise<void> {
    await db.update(matchRequests).set({ status: status as any }).where(eq(matchRequests.id, id));
  }

  async getUserMatches(userId: string): Promise<MatchRequestWithItems[]> {
    const matches = await db.select().from(matchRequests);
    const enrichedMatches = await this.enrichMatchesWithItems(matches);
    return enrichedMatches.filter(match => 
      match.lostItem.user_id === userId || match.foundItem.user_id === userId
    );
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values({
      user_id: notification.user_id,
      title: notification.title,
      body: notification.body,
      link: notification.link,
      read: false,
    }).returning();
    return result[0];
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.user_id, userId))
      .orderBy(desc(notifications.created_at));
  }

  async markNotificationAsRead(id: string, userId: string): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, id), eq(notifications.user_id, userId)));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.user_id, userId), eq(notifications.read, false)));
    return Number(result[0].count);
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getPendingUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.verified, false));
  }

  async getStats(): Promise<{
    totalLost: number;
    totalFound: number;
    pendingMatches: number;
    successRate: number;
  }> {
    const lostCount = await db.select({ count: sql<number>`count(*)` }).from(lostItems);
    const foundCount = await db.select({ count: sql<number>`count(*)` }).from(foundItems);
    const pendingCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(matchRequests)
      .where(eq(matchRequests.status, "pending"));
    const totalCount = await db.select({ count: sql<number>`count(*)` }).from(matchRequests);
    const approvedCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(matchRequests)
      .where(eq(matchRequests.status, "approved"));

    const totalMatches = Number(totalCount[0].count);
    const approvedMatches = Number(approvedCount[0].count);
    const successRate = totalMatches > 0 ? Math.round((approvedMatches / totalMatches) * 100) : 0;

    return {
      totalLost: Number(lostCount[0].count),
      totalFound: Number(foundCount[0].count),
      pendingMatches: Number(pendingCount[0].count),
      successRate,
    };
  }

  private async enrichMatchesWithItems(matches: MatchRequest[]): Promise<MatchRequestWithItems[]> {
    const enriched: MatchRequestWithItems[] = [];
    
    for (const match of matches) {
      const lostItem = await this.getLostItem(match.lost_id);
      const foundItem = await this.getFoundItem(match.found_id);
      
      if (lostItem && foundItem) {
        enriched.push({
          ...match,
          lostItem,
          foundItem,
        });
      }
    }
    
    return enriched;
  }
}
