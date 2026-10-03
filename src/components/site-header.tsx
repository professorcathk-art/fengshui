import Link from "next/link";
import { LanguageSwitch } from "@/components/language-switch";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getMessages } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const { locale, t } = getMessages();
  let email: string | null = null;
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    email = data.user?.email ?? null;
  } catch {
    email = null;
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-2xl tracking-wide">
          {t.brand}
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground sm:gap-5">
          <LanguageSwitch locale={locale} />
          <Link href="/cases" className="hover:text-foreground">
            {t.navCases}
          </Link>
          <Link href="/audit" className="hover:text-foreground">
            {t.navAudit}
          </Link>
          <Link href="/history" className="hidden hover:text-foreground sm:inline">
            {t.navReports}
          </Link>
          {email ? (
            <SignOutButton email={email} />
          ) : (
            <Link href="/login" className="text-gold hover:text-foreground">
              {t.signIn}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
