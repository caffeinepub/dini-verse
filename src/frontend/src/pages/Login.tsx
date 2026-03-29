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
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Fingerprint,
  KeyRound,
  Loader2,
  LogIn,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSessionAuth } from "../hooks/useSessionAuth";

type LoginStep = "login" | "ii2fa" | "pin" | "recovery";

// Mirrors the simpleHash in useSessionAuth — used for account recovery password update.
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useSessionAuth();

  const [step, setStep] = useState<LoginStep>("login");

  // Login form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // PIN 2FA form
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  // Recovery form
  const [recoveryUsername, setRecoveryUsername] = useState("");
  const [recoveryPin, setRecoveryPin] = useState("");
  const [recoveryNewPassword, setRecoveryNewPassword] = useState("");
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  // After credential verification succeeds, check 2FA before navigating
  const completeLoginAndCheckTwoFA = (uname: string) => {
    const iiEnabled =
      localStorage.getItem(`diniverse_ii2fa_${uname}`) === "true";
    const pinHash = localStorage.getItem(`diniverse_pin2fa_hash_${uname}`);

    if (iiEnabled) {
      setStep("ii2fa");
    } else if (pinHash) {
      setStep("pin");
    } else {
      navigate({ to: "/" });
    }
  };

  // After II 2FA is confirmed, check if PIN is also required
  const proceedAfterII = () => {
    const uname = username.trim();
    const pinHash = localStorage.getItem(`diniverse_pin2fa_hash_${uname}`);
    if (pinHash) {
      setStep("pin");
    } else {
      navigate({ to: "/" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    try {
      await login({ username: username.trim(), password });
      completeLoginAndCheckTwoFA(username.trim());
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");
    const uname = username.trim();
    const storedHash = localStorage.getItem(`diniverse_pin2fa_hash_${uname}`);
    if (!storedHash) {
      // PIN was removed; proceed
      navigate({ to: "/" });
      return;
    }
    if (btoa(pinInput) !== storedHash) {
      setPinError("Incorrect PIN. Please try again.");
      return;
    }
    navigate({ to: "/" });
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError("");
    const uname = recoveryUsername.trim();
    if (
      !uname ||
      !recoveryPin ||
      !recoveryNewPassword ||
      !recoveryConfirmPassword
    ) {
      setRecoveryError("All fields are required.");
      return;
    }
    if (recoveryPin.length !== 6) {
      setRecoveryError("PIN must be exactly 6 digits.");
      return;
    }
    if (recoveryNewPassword !== recoveryConfirmPassword) {
      setRecoveryError("New passwords do not match.");
      return;
    }
    if (recoveryNewPassword.length < 6) {
      setRecoveryError("New password must be at least 6 characters.");
      return;
    }
    const storedHash = localStorage.getItem(`diniverse_pin2fa_hash_${uname}`);
    if (!storedHash) {
      setRecoveryError("No PIN is set for this account. Cannot recover.");
      return;
    }
    if (btoa(recoveryPin) !== storedHash) {
      setRecoveryError("Incorrect PIN.");
      return;
    }
    // Update password
    const usersRaw = localStorage.getItem("diniverse_users");
    const users = usersRaw ? JSON.parse(usersRaw) : {};
    if (!users[uname]) {
      setRecoveryError("Account not found.");
      return;
    }
    users[uname].passwordHash = simpleHash(recoveryNewPassword);
    localStorage.setItem("diniverse_users", JSON.stringify(users));
    setRecoverySuccess(true);
    toast.success("Password reset! You can now log in.");
  };

  // ── II 2FA step ──────────────────────────────────────────────────────────
  if (step === "ii2fa") {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Fingerprint className="w-6 h-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Verify Your Identity</CardTitle>
            <CardDescription>
              Internet Identity Verification is required for your account.
              Complete verification in the window, then click continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-primary/5 border border-primary/20 p-4 text-sm text-muted-foreground">
              <ShieldCheck className="w-4 h-4 inline mr-1.5 text-primary" />
              Your account requires Internet Identity verification as an extra
              security step. Click the button below to open the verification
              window.
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              className="w-full"
              onClick={() => window.open("https://identity.ic0.app", "_blank")}
              data-ocid="login.ii2fa.open_modal_button"
            >
              <Fingerprint className="w-4 h-4 mr-2" />
              Open Internet Identity
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={proceedAfterII}
              data-ocid="login.ii2fa.confirm_button"
            >
              I have verified — Continue
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setStep("login")}
              data-ocid="login.ii2fa.cancel_button"
            >
              <ArrowLeft className="w-3 h-3 mr-1" /> Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ── PIN 2FA step ─────────────────────────────────────────────────────────
  if (step === "pin") {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Enter Your PIN</CardTitle>
            <CardDescription>
              Your account is protected with a 6-digit PIN. Please enter it to
              continue.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handlePinSubmit}>
            <CardContent className="space-y-4">
              {pinError && (
                <div
                  className="p-3 rounded-md bg-destructive/10 text-destructive text-sm"
                  data-ocid="login.pin.error_state"
                >
                  {pinError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="pinInput">6-Digit PIN</Label>
                <Input
                  id="pinInput"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) =>
                    setPinInput(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="Enter your 6-digit PIN"
                  autoComplete="one-time-code"
                  autoFocus
                  data-ocid="login.pin.input"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full"
                data-ocid="login.pin.submit_button"
              >
                Verify PIN
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => setStep("login")}
                data-ocid="login.pin.cancel_button"
              >
                <ArrowLeft className="w-3 h-3 mr-1" /> Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  // ── Account Recovery step ─────────────────────────────────────────────────
  if (step === "recovery") {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Account Recovery</CardTitle>
            <CardDescription>
              Enter your username, security PIN, and a new password to recover
              your account.
            </CardDescription>
          </CardHeader>
          {recoverySuccess ? (
            <CardContent className="space-y-4">
              <div className="p-4 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm">
                ✓ Password reset successfully! You can now log in with your new
                password.
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setRecoverySuccess(false);
                  setRecoveryUsername("");
                  setRecoveryPin("");
                  setRecoveryNewPassword("");
                  setRecoveryConfirmPassword("");
                  setStep("login");
                }}
                data-ocid="login.recovery.back_button"
              >
                Back to Login
              </Button>
            </CardContent>
          ) : (
            <form onSubmit={handleRecovery}>
              <CardContent className="space-y-4">
                {recoveryError && (
                  <div
                    className="p-3 rounded-md bg-destructive/10 text-destructive text-sm"
                    data-ocid="login.recovery.error_state"
                  >
                    {recoveryError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="recoveryUsername">Username</Label>
                  <Input
                    id="recoveryUsername"
                    type="text"
                    placeholder="Your username"
                    value={recoveryUsername}
                    onChange={(e) => setRecoveryUsername(e.target.value)}
                    data-ocid="login.recovery.username.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recoveryPin">6-Digit Security PIN</Label>
                  <Input
                    id="recoveryPin"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter your 6-digit PIN"
                    value={recoveryPin}
                    onChange={(e) =>
                      setRecoveryPin(
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    data-ocid="login.recovery.pin.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recoveryNewPassword">New Password</Label>
                  <Input
                    id="recoveryNewPassword"
                    type="password"
                    placeholder="At least 6 characters"
                    value={recoveryNewPassword}
                    onChange={(e) => setRecoveryNewPassword(e.target.value)}
                    autoComplete="new-password"
                    data-ocid="login.recovery.newpassword.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recoveryConfirmPassword">
                    Confirm New Password
                  </Label>
                  <Input
                    id="recoveryConfirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={recoveryConfirmPassword}
                    onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    data-ocid="login.recovery.confirmpassword.input"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  data-ocid="login.recovery.submit_button"
                >
                  Reset Password
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => setStep("login")}
                  data-ocid="login.recovery.cancel_button"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" /> Back to Login
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    );
  }

  // ── Main login form ────────────────────────────────────────────────────────
  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <LogIn className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your Dini.Verse account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div
                className="p-3 rounded-md bg-destructive/10 text-destructive text-sm"
                data-ocid="login.error_state"
              >
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={isLoading}
                data-ocid="login.username.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isLoading}
                data-ocid="login.password.input"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-ocid="login.submit_button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => setStep("recovery")}
              data-ocid="login.recovery.link"
            >
              Forgot password? Recover with PIN
            </button>
            <p className="text-sm text-muted-foreground text-center">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
