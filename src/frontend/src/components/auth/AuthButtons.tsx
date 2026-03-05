import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn, LogOut, UserPlus } from "lucide-react";
import { useSessionAuth } from "../../hooks/useSessionAuth";

export default function AuthButtons() {
  const { isAuthenticated, logout, isLoading } = useSessionAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    navigate({ to: "/" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="flex items-center gap-1.5"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: "/login" })}
        className="flex items-center gap-1.5"
      >
        <LogIn className="w-4 h-4" />
        Login
      </Button>
      <Button
        size="sm"
        onClick={() => navigate({ to: "/signup" })}
        className="flex items-center gap-1.5"
      >
        <UserPlus className="w-4 h-4" />
        Sign Up
      </Button>
    </div>
  );
}
