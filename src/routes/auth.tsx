import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { isPasswordPending, setPasswordPending } from "@/lib/pending-password";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in · Daily Speaking Practice" },
      { name: "description", content: "Sign in to practice speaking on a new topic every day." },
      { property: "og:title", content: "Daily Speaking Practice" },
      { property: "og:description", content: "Practice speaking on a new topic every day and build a streak." },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    // A new user who verified their code still needs to set a password here.
    if (data.user && !isPasswordPending()) throw redirect({ to: "/" });
  },
  component: AuthPage,
});

type Tab = "new" | "login";
type NewStep = "email" | "code" | "password";

function AuthPage() {
  const [tab, setTab] = useState<Tab>(() => (isPasswordPending() ? "new" : "login"));

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-mic">
            <Mic className="size-8" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold">Daily Speaking Practice</h1>
          <p className="mt-2 text-muted-foreground">One topic a day. Just speak.</p>
        </div>

        <div className="surface space-y-4 p-6">
          <div className="grid grid-cols-2 rounded-full bg-muted p-1 text-sm font-medium">
            {(
              [
                ["new", "Naya user"],
                ["login", "Login"],
              ] as const
            ).map(([t, label]) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full py-2 transition-colors ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                {label}
              </button>
            ))}
          </div>
          {tab === "login" ? <LoginForm /> : <NewUserForm />}
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) return setError(error.message);
    navigate({ to: "/" });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="lg" className="h-11 w-full rounded-full" disabled={loading}>
        {loading ? "Please wait…" : "Login"}
      </Button>
    </form>
  );
}

function NewUserForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState<NewStep>(() => (isPasswordPending() ? "password" : "email"));
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Returning to a half-finished setup after the session expired: start over.
  useEffect(() => {
    if (step !== "password") return;
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        setPasswordPending(false);
        setStep("email");
      }
    });
  }, [step]);

  async function sendCode(e?: FormEvent) {
    e?.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) return setError(error.message);
    setCode("");
    setStep("code");
    setInfo(`We sent a 6-digit code to ${email.trim()}.`);
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Mark before verifying so the sign-in event doesn't send the user home yet.
    setPasswordPending(true);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code, type: "email" });
    setLoading(false);
    if (error) {
      setPasswordPending(false);
      return setError(error.message);
    }
    setInfo(null);
    setStep("password");
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) return setError("Passwords don't match.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(error.message);
    setPasswordPending(false);
    navigate({ to: "/" });
  }

  if (step === "code") {
    return (
      <form onSubmit={verifyCode} className="space-y-4">
        {info && <p className="text-sm text-muted-foreground">{info}</p>}
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={code} onChange={setCode} autoFocus>
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} className="size-11 text-lg" />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="h-11 w-full rounded-full" disabled={loading || code.length !== 6}>
          {loading ? "Please wait…" : "Verify code"}
        </Button>
        <div className="flex justify-between text-xs text-muted-foreground">
          <button type="button" className="underline-offset-4 hover:underline" onClick={() => { setStep("email"); setError(null); }}>
            Change email
          </button>
          <button type="button" className="underline-offset-4 hover:underline" disabled={loading} onClick={() => sendCode()}>
            Resend code
          </button>
        </div>
      </form>
    );
  }

  if (step === "password") {
    return (
      <form onSubmit={savePassword} className="space-y-4">
        <p className="text-sm text-muted-foreground">Email verified. Now set your password for future logins.</p>
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input id="new-password" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input id="confirm-password" type="password" autoComplete="new-password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-11" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="h-11 w-full rounded-full" disabled={loading}>
          {loading ? "Saving…" : "Set password"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={sendCode} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="new-email">Email</Label>
        <Input id="new-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="lg" className="h-11 w-full rounded-full" disabled={loading}>
        {loading ? "Sending…" : "Send code"}
      </Button>
    </form>
  );
}
