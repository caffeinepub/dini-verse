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
import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  UserPlus,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getLocalSettings,
  saveLocalSettings,
} from "../hooks/useAccountSettings";
import { useSessionAuth } from "../hooks/useSessionAuth";
import { saveNotificationPrefs } from "../utils/socialStorage";

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

function generateCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { a, b, answer: a + b };
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

  // CAPTCHA
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  const regenerateCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
    setCaptchaError("");
  };

  // Debounced username availability check
  useEffect(() => {
    if (username.trim().length < 3) {
      setUsernameStatus("idle");
      return;
    }

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
    setCaptchaError("");

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

    // CAPTCHA check
    const userAnswer = Number.parseInt(captchaInput.trim(), 10);
    if (Number.isNaN(userAnswer) || userAnswer !== captcha.answer) {
      setCaptchaError("Incorrect answer. Please try again.");
      regenerateCaptcha();
      return;
    }

    try {
      await signup({
        username: username.trim(),
        displayName: displayName.trim() || username.trim(),
        password,
      });

      const uname = username.trim();

      // Save gender and language
      const existing = getLocalSettings(uname);
      saveLocalSettings(uname, {
        ...existing,
        gender: gender as "female" | "male" | "other",
        language,
      });

      // Set default notification prefs
      saveNotificationPrefs(uname, {
        friendRequests: true,
        groupUpdates: true,
        experienceInvitations: true,
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

            {/* CAPTCHA */}
            <div className="space-y-2">
              <Label htmlFor="captcha">Human Verification</Label>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                <span className="font-semibold text-sm flex-1">
                  What is {captcha.a} + {captcha.b}?
                </span>
                <button
                  type="button"
                  onClick={regenerateCaptcha}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Regenerate question"
                  data-ocid="signup.captcha.toggle"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <Input
                id="captcha"
                type="number"
                placeholder="Your answer"
                value={captchaInput}
                onChange={(e) => {
                  setCaptchaInput(e.target.value);
                  setCaptchaError("");
                }}
                disabled={isLoading}
                data-ocid="signup.captcha.input"
              />
              {captchaError && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="signup.captcha.error_state"
                >
                  {captchaError}
                </p>
              )}
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
