import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <p className="text-xs tracking-[0.18em] text-gold uppercase">Account</p>
      <h1 className="mt-2 font-display text-5xl">Sign in</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Signed-in audits are kept in your report history. You can still run a reading without an
        account.
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </main>
  );
}
