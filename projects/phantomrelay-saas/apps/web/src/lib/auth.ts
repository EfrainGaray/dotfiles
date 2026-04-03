// Auth utility — client-side auth state management

import { getToken, clearToken, getMe, type User } from "./api-client";

let cachedUser: User | null = null;

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

export async function getUser(): Promise<User | null> {
  if (!isAuthenticated()) return null;

  if (cachedUser) return cachedUser;

  try {
    cachedUser = await getMe();
    return cachedUser;
  } catch {
    // Token might be expired/invalid
    clearToken();
    cachedUser = null;
    return null;
  }
}

export function getCachedUser(): User | null {
  return cachedUser;
}

export function logout(): void {
  clearToken();
  cachedUser = null;
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
