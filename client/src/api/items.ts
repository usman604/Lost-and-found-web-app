import { apiRequest } from "@/lib/queryClient";

export interface ItemFilters {
  category?: string;
  location?: string;
  search?: string;
}

export async function createLostItem(formData: FormData) {
  const response = await fetch("/api/lost", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create lost item");
  }
  
  return response.json();
}

export async function createFoundItem(formData: FormData) {
  const response = await fetch("/api/found", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create found item");
  }
  
  return response.json();
}

export async function getLostItems(filters: ItemFilters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.append("category", filters.category);
  if (filters.location) params.append("location", filters.location);
  if (filters.search) params.append("search", filters.search);
  
  const response = await fetch(`/api/lost?${params}`, {
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch lost items");
  }
  
  return response.json();
}

export async function getFoundItems(filters: ItemFilters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.append("category", filters.category);
  if (filters.location) params.append("location", filters.location);
  if (filters.search) params.append("search", filters.search);
  
  const response = await fetch(`/api/found?${params}`, {
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch found items");
  }
  
  return response.json();
}

export async function getLostItem(id: string) {
  const response = await fetch(`/api/lost/${id}`, {
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch lost item");
  }
  
  return response.json();
}

export async function getFoundItem(id: string) {
  const response = await fetch(`/api/found/${id}`, {
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch found item");
  }
  
  return response.json();
}

export async function getUserLostItems() {
  const response = await fetch("/api/lost/my", {
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch user lost items");
  }
  
  return response.json();
}

export async function getUserFoundItems() {
  const response = await fetch("/api/found/my", {
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch user found items");
  }
  
  return response.json();
}
