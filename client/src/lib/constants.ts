export const CATEGORIES = [
  "Electronics",
  "Bags & Accessories", 
  "Books & Documents",
  "Clothing",
  "Keys & Cards",
  "Other"
] as const;

export const LOCATIONS = [
  "Main Library",
  "Student Center", 
  "Engineering Building",
  "Cafeteria",
  "Sports Complex",
  "Parking Lot A",
  "Parking Lot B",
  "Other"
] as const;

export const ITEM_STATUS = {
  PENDING: "pending",
  MATCHED: "matched", 
  RETURNED: "returned",
  CLOSED: "closed"
} as const;

export const MATCH_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected"
} as const;

export const USER_ROLES = {
  STUDENT: "student",
  ADMIN: "admin"
} as const;
