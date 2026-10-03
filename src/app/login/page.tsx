import { LoginForm } from "@/components/auth/login-form";
import { getMessages } from "@/lib/i18n/server";

export default function LoginPage() {
  const { t } = getMessages();
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <p className="text-xs tracking-[0.18em] text-gold uppercase">{t.signIn}</p>
      <h1 className="mt-2 font-display text-5xl">{t.loginTitle}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{t.loginBody}</p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </main>
  );
}
