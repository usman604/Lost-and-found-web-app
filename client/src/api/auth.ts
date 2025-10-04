import { apiRequest } from "@/lib/queryClient";

export interface SignupData {
  name: string;
  email: string;
  university_id: string;
  password: string;
}

export async function signupUser(data: SignupData) {
  const response = await apiRequest("POST", "/api/auth/signup", data);
  return response.json();
}

export async function loginUser(email: string, password: string) {
  const response = await apiRequest("POST", "/api/auth/login", { email, password });
  return response.json();
}

export async function getCurrentUser() {
  const response = await apiRequest("GET", "/api/auth/me");
  return response.json();
}

export async function logoutUser() {
  const response = await apiRequest("POST", "/api/auth/logout");
  return response.json();
}
