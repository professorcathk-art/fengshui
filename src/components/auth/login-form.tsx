"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const { locale } = useLocale();
  const zh = locale === "zh-Hant";
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const supabase = createClient();

    if (mode === "sign-up") {
      const { error } = await supabase.auth.signUp({ email, password });
      setPending(false);
      if (error) {
        setMessage(error.message);
        return;
      }
      setMessage(
        zh
          ? "帳戶已建立。如果開啟了電郵確認，請先打開連結再登入。"
          : "Account created. If email confirmation is on, open the link, then sign in.",
      );
      setMode("sign-in");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push("/history");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <label className="block space-y-2 text-sm">
        <span className="text-muted-foreground">{zh ? "電郵" : "Email"}</span>
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>
      <label className="block space-y-2 text-sm">
        <span className="text-muted-foreground">{zh ? "密碼" : "Password"}</span>
        <input
          required
          minLength={6}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>
      {message ? <p className="text-sm text-gold">{message}</p> : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? (zh ? "處理中" : "Working") : mode === "sign-in" ? (zh ? "登入" : "Sign in") : zh ? "建立帳戶" : "Create account"}
      </Button>
      <button
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
        type="button"
      >
        {mode === "sign-in"
          ? zh
            ? "還沒有帳戶？建立一個"
            : "Need an account? Create one"
          : zh
            ? "已經註冊？登入"
            : "Already registered? Sign in"}
      </button>
    </form>
  );
}
