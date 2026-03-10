import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2, UserPlus, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getLocalSettings,
  saveLocalSettings,
} from "../hooks/useAccountSettings";
import { useSessionAuth } from "../hooks/useSessionAuth";

type UsernameStatus = "idle" | "checking" | "available" | "taken";

function getStoredUsers(): Record<
  string,
  { displayName: string; passwordHash: string }
> {
  try {
    const raw = localStorage.getItem("diniverse_users");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function SignUp() {
  const navigate = useNavigate();
  const { signup, isLoading } = useSessionAuth();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("other");
  const [language, setLanguage] = useState("en");
  const [error, setError] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  // Debounced username availability check
  useEffect(() => {
    if (username.trim().length < 3) {
      setUsernameStatus("idle");
      return;
    }

    // While typing — set to checking
    setUsernameStatus("checking");

    const timer = setTimeout(() => {
      const users = getStoredUsers();
      if (users[username.trim().toLowerCase()] || users[username.trim()]) {
        setUsernameStatus("taken");
      } else {
        setUsernameStatus("available");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (usernameStatus === "taken") {
      setError("That username is already taken. Please choose another.");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await signup({
        username: username.trim(),
        displayName: displayName.trim() || username.trim(),
        password,
      });

      // Save gender and language to localStorage settings
      const uname = username.trim();
      const existing = getLocalSettings(uname);
      saveLocalSettings(uname, {
        ...existing,
        gender: gender as "female" | "male" | "other",
        language,
      });

      navigate({ to: "/" });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Sign up failed. Please try again.";
      setError(msg);
    }
  };

  const isSubmitDisabled = isLoading || usernameStatus === "taken";

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Join Dini.Verse and start exploring</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div
                className="p-3 rounded-md bg-destructive/10 text-destructive text-sm"
                data-ocid="signup.error_state"
              >
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={isLoading}
                data-ocid="signup.username.input"
              />
              {/* Username availability status */}
              {username.trim().length >= 3 && usernameStatus !== "idle" && (
                <div
                  className="flex items-center gap-1.5 text-xs"
                  data-ocid="signup.username_status"
                >
                  {usernameStatus === "checking" && (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Checking availability…
                      </span>
                    </>
                  )}
                  {usernameStatus === "available" && (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      <span className="text-green-600 font-medium">
                        Username is available
                      </span>
                    </>
                  )}
                  {usernameStatus === "taken" && (
                    <>
                      <XCircle className="w-3 h-3 text-destructive" />
                      <span className="text-destructive font-medium">
                        Username is already taken
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">
                Display Name{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
                disabled={isLoading}
                data-ocid="signup.displayname.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isLoading}
                data-ocid="signup.password.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isLoading}
                data-ocid="signup.confirm-password.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={gender}
                onValueChange={setGender}
                disabled={isLoading}
              >
                <SelectTrigger id="gender" data-ocid="signup.gender.select">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={language}
                onValueChange={setLanguage}
                disabled={isLoading}
              >
                <SelectTrigger id="language" data-ocid="signup.language.select">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="nl">Nederlands</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitDisabled}
              data-ocid="signup.submit_button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
                data-ocid="signup.login.link"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
