import Link from "next/link";
import { redirect } from "next/navigation";
import { getMessages } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  const { t } = getMessages();

  const { data: audits, error } = await supabase
    .from("audits")
    .select("id, audit_type, facing_degree, year_built, status, created_at, image_url")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-5xl">{t.historyTitle}</h1>
      {error ? <p className="mt-4 text-sm text-destructive">{error.message}</p> : null}
      <div className="mt-8 divide-y divide-border">
        {(audits ?? []).map((audit) => (
          <Link key={audit.id} href={`/report/${audit.id}`} className="block py-4 hover:text-gold">
            <span className="block text-base capitalize">{audit.audit_type}</span>
            <span className="text-sm text-muted-foreground">
              {audit.year_built ?? "Year unknown"} · {audit.facing_degree ?? "—"}° · {audit.status}
              {audit.image_url ? ` · ${audit.image_url}` : ""}
            </span>
          </Link>
        ))}
      </div>
      {audits && audits.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          {t.historyEmpty} <Link href="/audit">{t.runOne}</Link>
        </p>
      ) : null}
    </main>
  );
}
