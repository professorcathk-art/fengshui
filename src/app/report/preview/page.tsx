"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ReportView, type PreviewPayload } from "@/components/report/report-view";

function PreviewBody() {
  const params = useSearchParams();
  const [report, setReport] = useState<PreviewPayload | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("geomancy-report");
    if (raw) {
      try {
        setReport(JSON.parse(raw) as PreviewPayload);
      } catch {
        setReport(null);
      }
    }
    setReady(true);
  }, []);

  if (!ready) return <p className="text-muted-foreground">Opening the reading…</p>;
  if (!report) {
    return (
      <div>
        <h1 className="font-display text-5xl">No reading in this browser yet.</h1>
        <Link className="mt-6 inline-block text-gold" href="/audit">
          Start an audit
        </Link>
      </div>
    );
  }

  return <ReportView initial={report} sessionId={params.get("session_id")} />;
}

export default function PreviewPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Suspense fallback={<p className="text-muted-foreground">Opening the reading…</p>}>
        <PreviewBody />
      </Suspense>
    </main>
  );
}
