import { apiRequest } from "@/lib/queryClient";

export async function getAdminStats() {
  const response = await apiRequest("GET", "/api/admin/stats");
  return response.json();
}

export async function getPendingMatches() {
  const response = await apiRequest("GET", "/api/matches/pending");
  return response.json();
}

export async function getUserMatches() {
  const response = await apiRequest("GET", "/api/matches/my");
  return response.json();
}

export async function getPendingUsers() {
  const response = await apiRequest("GET", "/api/admin/users/pending");
  return response.json();
}

export async function verifyUser(userId: string) {
  const response = await apiRequest("POST", `/api/admin/users/${userId}/verify`);
  return response.json();
}

export async function verifyMatch(matchId: string, status: string) {
  const response = await apiRequest("POST", `/api/matches/${matchId}/verify`, { status });
  return response.json();
}

export async function getUserNotifications() {
  const response = await fetch("/api/notifications", {
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }
  
  return response.json();
}

export async function getNotificationCount() {
  const response = await fetch("/api/notifications/count", {
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch notification count");
  }
  
  return response.json();
}

export async function markNotificationAsRead(notificationId: string) {
  const response = await apiRequest("POST", "/api/notifications/mark-read", { notificationId });
  return response.json();
}
