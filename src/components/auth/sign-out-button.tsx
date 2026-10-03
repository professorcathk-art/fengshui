"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ email }: { email: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      className="max-w-40 truncate text-left hover:text-foreground"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
      }}
      type="button"
    >
      {pending ? "Signing out" : email}
    </button>
  );
}
