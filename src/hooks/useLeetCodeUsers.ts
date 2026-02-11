import { useState, useEffect, useCallback } from "react";
import { LeetCodeUser, fetchLeetCodeUser } from "@/lib/leetcode-api";

const STORAGE_KEY = "leetcode-tracker-users";

function loadUsers(): LeetCodeUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: LeetCodeUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function useLeetCodeUsers() {
  const [users, setUsers] = useState<LeetCodeUser[]>(loadUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  const addUser = useCallback(async (username: string) => {
    const normalized = username.trim().toLowerCase();
    if (users.some((u) => u.username.toLowerCase() === normalized)) {
      setError("User already added");
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      const user = await fetchLeetCodeUser(username.trim());
      setUsers((prev) => [...prev, user]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user");
      return false;
    } finally {
      setLoading(false);
    }
  }, [users]);

  const removeUser = useCallback((username: string) => {
    setUsers((prev) => prev.filter((u) => u.username !== username));
  }, []);

  const refreshUser = useCallback(async (username: string) => {
    try {
      const updated = await fetchLeetCodeUser(username);
      setUsers((prev) =>
        prev.map((u) => (u.username === username ? updated : u))
      );
    } catch {
      // silently fail on refresh
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const updated = await Promise.allSettled(
        users.map((u) => fetchLeetCodeUser(u.username))
      );
      setUsers((prev) =>
        prev.map((user, i) => {
          const result = updated[i];
          return result.status === "fulfilled" ? result.value : user;
        })
      );
    } finally {
      setLoading(false);
    }
  }, [users]);

  return { users, loading, error, addUser, removeUser, refreshUser, refreshAll, setError };
}
