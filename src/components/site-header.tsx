import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/sign-out-button";

export async function SiteHeader() {
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
          GeoMancy
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link href="/#pentagon" className="hidden hover:text-foreground sm:inline">
            Pentagon
          </Link>
          <Link href="/audit" className="hover:text-foreground">
            Audit
          </Link>
          <Link href="/history" className="hover:text-foreground">
            Reports
          </Link>
          {email ? (
            <SignOutButton email={email} />
          ) : (
            <Link href="/login" className="text-gold hover:text-foreground">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
