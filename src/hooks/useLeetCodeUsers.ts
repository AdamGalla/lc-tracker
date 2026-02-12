import { useState, useEffect } from "react";
import { LeetCodeUser, RateLimitError, RateLimitInfo, fetchLeetCodeUser } from "@/lib/leetcode-api";
import { toast } from "@/hooks/use-toast";

export function useLeetCodeUsers() {
  const [users, setUsers] = useState<LeetCodeUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);

  const formatResetTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("leetcode-users");
    if (saved) {
      try {
        setUsers(JSON.parse(saved));
      } catch {
        console.error("Failed to parse saved users");
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("leetcode-users", JSON.stringify(users));
  }, [users]);

  const addUser = async (username: string): Promise<boolean> => {
    if (users.find((u) => u.username === username)) {
      toast({
        title: "User already added",
        description: `${username} is already being tracked`,
        variant: "default",
      });
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      const user = await fetchLeetCodeUser(username);
      setUsers([...users, user]);
      toast({
        title: "Success",
        description: `Successfully added ${username}`,
      });
      return true;
    } catch (err: any) {
      const errorMsg = err.message || "Failed to fetch user data";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeUser = (username: string) => {
    setUsers(users.filter((u) => u.username !== username));
    toast({
      title: "User removed",
      description: `${username} has been removed from tracking`,
    });
  };

  const refreshUser = async (username: string) => {
    setLoading(true);
    try {
      const updated = await fetchLeetCodeUser(username);
      setUsers(users.map((u) => (u.username === username ? updated : u)));
      toast({
        title: "Refreshed",
        description: `Successfully refreshed ${username}`,
      });
    } catch (err: any) {
      const errorMsg = err.message || "Failed to refresh user data";

      if (err instanceof RateLimitError && err.rateLimit) {
        const { remaining, reset } = err.rateLimit;
        const resetMinutes = Math.ceil(reset / 60);

        toast({
          title: "Error",
          description: `${errorMsg}\n\nRequests remaining: ${remaining}\nResets in: ${resetMinutes} minutes`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

  const refreshAll = async () => {
    setLoading(true);
    setError(null);

    const usersSnapshot = users;
    const updated: LeetCodeUser[] = [];

    try {
      for (const user of usersSnapshot) {
        const refreshed = await fetchLeetCodeUser(user.username);
        updated.push(refreshed);
        await sleep(500);
      }

      setUsers(updated);

      toast({ title: "Success", description: "All users refreshed successfully" });
    } catch (err: any) {
      if (err instanceof RateLimitError) {
        toast({
          title: "Rate limit exceeded",
          description: `Stopped at ${updated.length}/${usersSnapshot.length}. Try again in a few minutes.`,
        });
        setError(err.message);
        return;
      }

      const msg = err?.message ?? "Failed to refresh users";
      toast({ title: "Error refreshing users", description: msg, variant: "destructive" });
      setError(msg);
    } finally {
      setLoading(false);
    }
  };
  return {
    users,
    loading,
    error,
    addUser,
    rateLimitInfo,
    setRateLimitInfo,
    removeUser,
    refreshUser,
    refreshAll,
    setError,
  };
}
