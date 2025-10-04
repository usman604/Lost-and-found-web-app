import { db } from "./db";
import { users, lostItems, foundItems, matchRequests, notifications } from "@shared/schema";
import bcrypt from "bcrypt";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  try {
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("[Seed] Database already seeded, skipping...");
      return;
    }

    console.log("[Seed] Starting database seed...");

    const adminUser = await db.insert(users).values({
      name: "Admin User",
      email: "admin@university.test",
      university_id: "ADMIN-001",
      password_hash: await bcrypt.hash("Admin@123", 10),
      role: "admin",
      verified: true,
    }).returning();

    const students = await db.insert(users).values([
      {
        name: "Ali Smith",
        email: "ali@university.test",
        university_id: "U2025-001",
        password_hash: await bcrypt.hash("Student@123", 10),
        role: "student",
        verified: true,
      },
      {
        name: "Sara Martinez",
        email: "sara@university.test",
        university_id: "U2025-002",
        password_hash: await bcrypt.hash("Student@123", 10),
        role: "student",
        verified: true,
      },
      {
        name: "Bilal Khan",
        email: "bilal@university.test",
        university_id: "U2025-003",
        password_hash: await bcrypt.hash("Student@123", 10),
        role: "student",
        verified: true,
      },
    ]).returning();

    const lostItemsData = await db.insert(lostItems).values([
      {
        user_id: students[0].id,
        title: "iPhone 13 Pro",
        category: "Electronics",
        description: "Black iPhone with blue case, lost near library",
        location: "Main Library",
        date_lost: new Date("2024-12-15"),
        status: "pending",
      },
      {
        user_id: students[1].id,
        title: "Black Backpack",
        category: "Bags & Accessories",
        description: "Nike backpack with laptop inside",
        location: "Student Center",
        date_lost: new Date("2024-12-12"),
        status: "pending",
      },
      {
        user_id: students[2].id,
        title: "Calculus Textbook",
        category: "Books & Documents",
        description: "Red cover, name written inside",
        location: "Engineering Building",
        date_lost: new Date("2024-12-10"),
        status: "pending",
      },
    ]).returning();

    const foundItemsData = await db.insert(foundItems).values([
      {
        user_id: students[0].id,
        title: "Black iPhone",
        category: "Electronics",
        description: "Found near library entrance, has blue case",
        location: "Main Library",
        date_found: new Date("2024-12-15"),
        status: "pending",
      },
      {
        user_id: students[1].id,
        title: "Denim Jacket",
        category: "Clothing",
        description: "Light blue denim jacket, size M",
        location: "Cafeteria",
        date_found: new Date("2024-12-14"),
        status: "pending",
      },
      {
        user_id: students[2].id,
        title: "Student ID Card",
        category: "Keys & Cards",
        description: "University ID with blue lanyard",
        location: "Student Center",
        date_found: new Date("2024-12-11"),
        status: "pending",
      },
    ]).returning();

    const match = await db.insert(matchRequests).values({
      lost_id: lostItemsData[0].id,
      found_id: foundItemsData[0].id,
      score: 85,
      status: "pending",
    }).returning();

    await db.insert(notifications).values([
      {
        user_id: students[0].id,
        title: "Potential Match Found!",
        body: "Your lost iPhone might match a found item. Score: 85",
        link: `/matches/${match[0].id}`,
        read: false,
      },
      {
        user_id: adminUser[0].id,
        title: "New Match Request",
        body: "A new match request requires your review",
        link: `/admin/matches/${match[0].id}`,
        read: false,
      },
    ]);

    console.log("[Seed] Database seeded successfully!");
  } catch (error) {
    console.error("[Seed] Error seeding database:", error);
  }
}
