import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  university_id: text("university_id").notNull(),
  password_hash: text("password_hash").notNull(),
  role: text("role", { enum: ['student', 'admin'] }).notNull().default('student'),
  verified: boolean("verified").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Lost items table
export const lostItems = pgTable("lost_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  image_path: text("image_path"),
  date_lost: timestamp("date_lost").notNull(),
  status: text("status", { enum: ['pending', 'matched', 'returned', 'closed'] }).notNull().default('pending'),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Found items table
export const foundItems = pgTable("found_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  image_path: text("image_path"),
  date_found: timestamp("date_found").notNull(),
  status: text("status", { enum: ['pending', 'matched', 'returned', 'closed'] }).notNull().default('pending'),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Match requests table
export const matchRequests = pgTable("match_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lost_id: varchar("lost_id").notNull().references(() => lostItems.id),
  found_id: varchar("found_id").notNull().references(() => foundItems.id),
  score: integer("score").notNull(),
  status: text("status", { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Claims table
export const claims = pgTable("claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  match_id: varchar("match_id").notNull().references(() => matchRequests.id),
  claimant_id: varchar("claimant_id").notNull().references(() => users.id),
  proof_path: text("proof_path"),
  status: text("status", { enum: ['awaiting_proof', 'verified', 'rejected'] }).notNull().default('awaiting_proof'),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  link: text("link"),
  read: boolean("read").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const insertLostItemSchema = createInsertSchema(lostItems).omit({
  id: true,
  user_id: true,
  status: true,
  created_at: true,
});

export const insertFoundItemSchema = createInsertSchema(foundItems).omit({
  id: true,
  user_id: true,
  status: true,
  created_at: true,
});

export const insertMatchRequestSchema = createInsertSchema(matchRequests).omit({
  id: true,
  created_at: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  created_at: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LostItem = typeof lostItems.$inferSelect;
export type InsertLostItem = z.infer<typeof insertLostItemSchema>;
export type FoundItem = typeof foundItems.$inferSelect;
export type InsertFoundItem = z.infer<typeof insertFoundItemSchema>;
export type MatchRequest = typeof matchRequests.$inferSelect;
export type InsertMatchRequest = z.infer<typeof insertMatchRequestSchema>;
export type Claim = typeof claims.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Extended types for API responses
export type LostItemWithUser = LostItem & {
  user: { name: string; university_id: string; };
};

export type FoundItemWithUser = FoundItem & {
  user: { name: string; university_id: string; };
};

export type MatchRequestWithItems = MatchRequest & {
  lostItem: LostItemWithUser;
  foundItem: FoundItemWithUser;
};
