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
  type MatchRequestWithItems
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyUser(id: string): Promise<void>;
  
  // Lost Items
  createLostItem(item: InsertLostItem, userId: string): Promise<LostItem>;
  getLostItems(filters?: { category?: string; location?: string; search?: string }): Promise<LostItemWithUser[]>;
  getLostItem(id: string): Promise<LostItemWithUser | undefined>;
  getUserLostItems(userId: string): Promise<LostItem[]>;
  deleteLostItem(id: string, userId: string): Promise<void>;
  updateLostItemStatus(id: string, status: string): Promise<void>;
  
  // Found Items
  createFoundItem(item: InsertFoundItem, userId: string): Promise<FoundItem>;
  getFoundItems(filters?: { category?: string; location?: string; search?: string }): Promise<FoundItemWithUser[]>;
  getFoundItem(id: string): Promise<FoundItemWithUser | undefined>;
  getUserFoundItems(userId: string): Promise<FoundItem[]>;
  deleteFoundItem(id: string, userId: string): Promise<void>;
  updateFoundItemStatus(id: string, status: string): Promise<void>;
  
  // Match Requests
  createMatchRequest(match: InsertMatchRequest): Promise<MatchRequest>;
  getMatchRequests(): Promise<MatchRequestWithItems[]>;
  getPendingMatchRequests(): Promise<MatchRequestWithItems[]>;
  updateMatchRequestStatus(id: string, status: string): Promise<void>;
  getUserMatches(userId: string): Promise<MatchRequestWithItems[]>;
  
  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string, userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  
  // Admin
  getUsers(): Promise<User[]>;
  getPendingUsers(): Promise<User[]>;
  getStats(): Promise<{
    totalLost: number;
    totalFound: number;
    pendingMatches: number;
    successRate: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private lostItems: Map<string, LostItem>;
  private foundItems: Map<string, FoundItem>;
  private matchRequests: Map<string, MatchRequest>;
  private notifications: Map<string, Notification>;

  constructor() {
    this.users = new Map();
    this.lostItems = new Map();
    this.foundItems = new Map();
    this.matchRequests = new Map();
    this.notifications = new Map();
    
    // Initialize with seed data
    this.initializeSeedData();
  }

  private async initializeSeedData() {
    // Create admin user
    const adminId = randomUUID();
    const adminUser: User = {
      id: adminId,
      name: "Admin User",
      email: "admin@university.test",
      university_id: "ADMIN-001",
      password_hash: await bcrypt.hash("Admin@123", 10),
      role: "admin",
      verified: true,
      created_at: new Date(),
    };
    this.users.set(adminId, adminUser);

    // Create student users
    const students = [
      { name: "Ali Smith", email: "ali@university.test", universityId: "U2025-001" },
      { name: "Sara Martinez", email: "sara@university.test", universityId: "U2025-002" },
      { name: "Bilal Khan", email: "bilal@university.test", universityId: "U2025-003" },
    ];

    const userIds: string[] = [];
    for (const student of students) {
      const userId = randomUUID();
      const user: User = {
        id: userId,
        name: student.name,
        email: student.email,
        university_id: student.universityId,
        password_hash: await bcrypt.hash("Student@123", 10),
        role: "student",
        verified: true,
        created_at: new Date(),
      };
      this.users.set(userId, user);
      userIds.push(userId);
    }

    // Create lost items
    const lostItemData = [
      {
        title: "iPhone 13 Pro",
        category: "Electronics",
        description: "Black iPhone with blue case, lost near library",
        location: "Main Library",
        date_lost: new Date("2024-12-15"),
      },
      {
        title: "Black Backpack",
        category: "Bags & Accessories",
        description: "Nike backpack with laptop inside",
        location: "Student Center",
        date_lost: new Date("2024-12-12"),
      },
      {
        title: "Calculus Textbook",
        category: "Books & Documents",
        description: "Red cover, name written inside",
        location: "Engineering Building",
        date_lost: new Date("2024-12-10"),
      },
    ];

    const lostItemIds: string[] = [];
    lostItemData.forEach((item, index) => {
      const itemId = randomUUID();
      const lostItem: LostItem = {
        id: itemId,
        user_id: userIds[index],
        title: item.title,
        category: item.category,
        description: item.description,
        location: item.location,
        image_path: null,
        date_lost: item.date_lost,
        status: "pending",
        created_at: new Date(),
      };
      this.lostItems.set(itemId, lostItem);
      lostItemIds.push(itemId);
    });

    // Create found items
    const foundItemData = [
      {
        title: "Black iPhone",
        category: "Electronics",
        description: "Found near library entrance, has blue case",
        location: "Main Library",
        date_found: new Date("2024-12-15"),
      },
      {
        title: "Denim Jacket",
        category: "Clothing",
        description: "Light blue denim jacket, size M",
        location: "Cafeteria",
        date_found: new Date("2024-12-14"),
      },
      {
        title: "Student ID Card",
        category: "Keys & Cards",
        description: "University ID with blue lanyard",
        location: "Student Center",
        date_found: new Date("2024-12-11"),
      },
    ];

    const foundItemIds: string[] = [];
    foundItemData.forEach((item, index) => {
      const itemId = randomUUID();
      const foundItem: FoundItem = {
        id: itemId,
        user_id: userIds[index],
        title: item.title,
        category: item.category,
        description: item.description,
        location: item.location,
        image_path: null,
        date_found: item.date_found,
        status: "pending",
        created_at: new Date(),
      };
      this.foundItems.set(itemId, foundItem);
      foundItemIds.push(itemId);
    });

    // Create a pending match request
    const matchId = randomUUID();
    const matchRequest: MatchRequest = {
      id: matchId,
      lost_id: lostItemIds[0], // iPhone lost item
      found_id: foundItemIds[0], // iPhone found item
      score: 85,
      status: "pending",
      created_at: new Date(),
    };
    this.matchRequests.set(matchId, matchRequest);

    // Create notifications
    const notifications = [
      {
        user_id: userIds[0],
        title: "Potential Match Found!",
        body: "Your lost iPhone might match a found item. Score: 85",
        link: `/matches/${matchId}`,
      },
      {
        user_id: adminId,
        title: "New Match Request",
        body: "A new match request requires your review",
        link: `/admin/matches/${matchId}`,
      },
    ];

    notifications.forEach((notif) => {
      const notificationId = randomUUID();
      const notification: Notification = {
        id: notificationId,
        user_id: notif.user_id,
        title: notif.title,
        body: notif.body,
        link: notif.link,
        read: false,
        created_at: new Date(),
      };
      this.notifications.set(notificationId, notification);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      id,
      name: insertUser.name,
      email: insertUser.email,
      university_id: insertUser.university_id,
      password_hash: hashedPassword,
      role: "student",
      verified: insertUser.email.endsWith("@university.test"),
      created_at: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async verifyUser(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.verified = true;
      this.users.set(id, user);
    }
  }

  // Lost Item methods
  async createLostItem(item: InsertLostItem, userId: string): Promise<LostItem> {
    const id = randomUUID();
    const lostItem: LostItem = {
      id,
      user_id: userId,
      title: item.title,
      category: item.category,
      description: item.description,
      location: item.location,
      image_path: item.image_path,
      date_lost: item.date_lost,
      status: "pending",
      created_at: new Date(),
    };
    this.lostItems.set(id, lostItem);
    return lostItem;
  }

  async getLostItems(filters?: { category?: string; location?: string; search?: string }): Promise<LostItemWithUser[]> {
    let items = Array.from(this.lostItems.values());
    
    if (filters) {
      if (filters.category && filters.category !== "All Categories") {
        items = items.filter(item => item.category === filters.category);
      }
      if (filters.location && filters.location !== "All Locations") {
        items = items.filter(item => item.location === filters.location);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        items = items.filter(item => 
          item.title.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search)
        );
      }
    }
    
    return items.map(item => ({
      ...item,
      user: this.getUserInfo(item.user_id),
    }));
  }

  async getLostItem(id: string): Promise<LostItemWithUser | undefined> {
    const item = this.lostItems.get(id);
    if (!item) return undefined;
    
    return {
      ...item,
      user: this.getUserInfo(item.user_id),
    };
  }

  async getUserLostItems(userId: string): Promise<LostItem[]> {
    return Array.from(this.lostItems.values()).filter(item => item.user_id === userId);
  }

  async deleteLostItem(id: string, userId: string): Promise<void> {
    const item = this.lostItems.get(id);
    if (item && item.user_id === userId) {
      this.lostItems.delete(id);
    }
  }

  async updateLostItemStatus(id: string, status: string): Promise<void> {
    const item = this.lostItems.get(id);
    if (item) {
      item.status = status as any;
      this.lostItems.set(id, item);
    }
  }

  // Found Item methods
  async createFoundItem(item: InsertFoundItem, userId: string): Promise<FoundItem> {
    const id = randomUUID();
    const foundItem: FoundItem = {
      id,
      user_id: userId,
      title: item.title,
      category: item.category,
      description: item.description,
      location: item.location,
      image_path: item.image_path,
      date_found: item.date_found,
      status: "pending",
      created_at: new Date(),
    };
    this.foundItems.set(id, foundItem);
    return foundItem;
  }

  async getFoundItems(filters?: { category?: string; location?: string; search?: string }): Promise<FoundItemWithUser[]> {
    let items = Array.from(this.foundItems.values());
    
    if (filters) {
      if (filters.category && filters.category !== "All Categories") {
        items = items.filter(item => item.category === filters.category);
      }
      if (filters.location && filters.location !== "All Locations") {
        items = items.filter(item => item.location === filters.location);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        items = items.filter(item => 
          item.title.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search)
        );
      }
    }
    
    return items.map(item => ({
      ...item,
      user: this.getUserInfo(item.user_id),
    }));
  }

  async getFoundItem(id: string): Promise<FoundItemWithUser | undefined> {
    const item = this.foundItems.get(id);
    if (!item) return undefined;
    
    return {
      ...item,
      user: this.getUserInfo(item.user_id),
    };
  }

  async getUserFoundItems(userId: string): Promise<FoundItem[]> {
    return Array.from(this.foundItems.values()).filter(item => item.user_id === userId);
  }

  async deleteFoundItem(id: string, userId: string): Promise<void> {
    const item = this.foundItems.get(id);
    if (item && item.user_id === userId) {
      this.foundItems.delete(id);
    }
  }

  async updateFoundItemStatus(id: string, status: string): Promise<void> {
    const item = this.foundItems.get(id);
    if (item) {
      item.status = status as any;
      this.foundItems.set(id, item);
    }
  }

  // Match Request methods
  async createMatchRequest(match: InsertMatchRequest): Promise<MatchRequest> {
    const id = randomUUID();
    const matchRequest: MatchRequest = {
      id,
      lost_id: match.lost_id,
      found_id: match.found_id,
      score: match.score,
      status: "pending",
      created_at: new Date(),
    };
    this.matchRequests.set(id, matchRequest);
    return matchRequest;
  }

  async getMatchRequests(): Promise<MatchRequestWithItems[]> {
    return this.getMatchRequestsWithItems();
  }

  async getPendingMatchRequests(): Promise<MatchRequestWithItems[]> {
    const matches = this.getMatchRequestsWithItems();
    return matches.filter(match => match.status === "pending");
  }

  async updateMatchRequestStatus(id: string, status: string): Promise<void> {
    const match = this.matchRequests.get(id);
    if (match) {
      match.status = status as any;
      this.matchRequests.set(id, match);
    }
  }

  async getUserMatches(userId: string): Promise<MatchRequestWithItems[]> {
    const matches = this.getMatchRequestsWithItems();
    return matches.filter(match => 
      match.lostItem.user_id === userId || match.foundItem.user_id === userId
    );
  }

  // Notification methods
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notif: Notification = {
      id,
      user_id: notification.user_id,
      title: notification.title,
      body: notification.body,
      link: notification.link,
      read: false,
      created_at: new Date(),
    };
    this.notifications.set(id, notif);
    return notif;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notif => notif.user_id === userId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async markNotificationAsRead(id: string, userId: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification && notification.user_id === userId) {
      notification.read = true;
      this.notifications.set(id, notification);
    }
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(notif => notif.user_id === userId && !notif.read).length;
  }

  // Admin methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getPendingUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => !user.verified);
  }

  async getStats(): Promise<{
    totalLost: number;
    totalFound: number;
    pendingMatches: number;
    successRate: number;
  }> {
    const totalLost = this.lostItems.size;
    const totalFound = this.foundItems.size;
    const pendingMatches = Array.from(this.matchRequests.values())
      .filter(match => match.status === "pending").length;
    
    const totalMatches = this.matchRequests.size;
    const approvedMatches = Array.from(this.matchRequests.values())
      .filter(match => match.status === "approved").length;
    
    const successRate = totalMatches > 0 ? Math.round((approvedMatches / totalMatches) * 100) : 0;
    
    return {
      totalLost,
      totalFound,
      pendingMatches,
      successRate,
    };
  }

  // Helper methods
  private getUserInfo(userId: string): { name: string; university_id: string; } {
    const user = this.users.get(userId);
    return user ? { name: user.name, university_id: user.university_id } : { name: "Unknown", university_id: "Unknown" };
  }

  private getMatchRequestsWithItems(): MatchRequestWithItems[] {
    return Array.from(this.matchRequests.values()).map(match => {
      const lostItem = this.lostItems.get(match.lost_id);
      const foundItem = this.foundItems.get(match.found_id);
      
      if (!lostItem || !foundItem) {
        throw new Error(`Match request ${match.id} has invalid item references`);
      }
      
      return {
        ...match,
        lostItem: {
          ...lostItem,
          user: this.getUserInfo(lostItem.user_id),
        },
        foundItem: {
          ...foundItem,
          user: this.getUserInfo(foundItem.user_id),
        },
      };
    });
  }
}

export const storage = new MemStorage();
