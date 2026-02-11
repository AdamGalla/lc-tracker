import { useState } from "react";
import { Code2, LayoutDashboard, Trophy, RefreshCw, Loader2 } from "lucide-react";
import { useLeetCodeUsers } from "@/hooks/useLeetCodeUsers";
import { UserCard } from "@/components/UserCard";
import { AddUserForm } from "@/components/AddUserForm";
import { Leaderboard } from "@/components/Leaderboard";

type Tab = "dashboard" | "leaderboard";

const Index = () => {
  const [tab, setTab] = useState<Tab>("dashboard");
  const { users, loading, error, addUser, removeUser, refreshUser, refreshAll, setError } = useLeetCodeUsers();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Code2 className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold text-foreground">LC Tracker</h1>
          </div>

          {/* Tabs */}
          <nav className="flex rounded-lg bg-secondary p-1">
            <button
              onClick={() => setTab("dashboard")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === "dashboard"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </button>
            <button
              onClick={() => setTab("leaderboard")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === "leaderboard"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              Leaderboard
            </button>
          </nav>

          {/* Refresh */}
          {users.length > 0 && (
            <button
              onClick={refreshAll}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Refresh
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Add user form */}
        <div className="mb-8">
          <AddUserForm onAdd={addUser} loading={loading} error={error} onClearError={() => setError(null)} />
        </div>

        {tab === "dashboard" ? (
          users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Code2 className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">No users tracked yet. Add a LeetCode username above.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <UserCard key={user.username} user={user} onRemove={removeUser} onRefresh={refreshUser} />
              ))}
            </div>
          )
        ) : (
          <Leaderboard users={users} />
        )}
      </main>
    </div>
  );
};

export default Index;
