"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { LoadingSkeleton } from "@/components/state-panels";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isActive = true;
    const supabase = getSupabaseClient();

    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (!isActive) {
        return;
      }

      if (!data.session) {
        router.replace("/login");
        return;
      }

      setIsChecking(false);
    }

    void checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => {
      isActive = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  if (isChecking) {
    return <LoadingSkeleton />;
  }

  return children;
}
