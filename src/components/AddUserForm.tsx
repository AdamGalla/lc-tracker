import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";

interface AddUserFormProps {
  onAdd: (username: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
}

export function AddUserForm({ onAdd, loading, error, onClearError }: AddUserFormProps) {
  const [username, setUsername] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || loading) return;
    const success = await onAdd(username);
    if (success) setUsername("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (error) onClearError();
          }}
          placeholder="Enter LeetCode username..."
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
        />
        {error && (
          <p className="absolute -bottom-5 left-0 text-xs text-destructive">{error}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || !username.trim()}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Add
      </button>
    </form>
  );
}
