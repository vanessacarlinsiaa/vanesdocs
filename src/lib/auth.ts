import { supa } from "./supa";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      const { data } = await supa.auth.getUser();
      if (active) setUser(data.user ?? null);
    })();

    const { data: sub } = supa.auth.onAuthStateChange((_ev, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      sub.subscription.unsubscribe();
      active = false;
    };
  }, []);

  return user;
}

export async function loginWithGoogle() {
  const redirectTo = window.location.origin;
  await supa.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
}

export async function logout() {
  await supa.auth.signOut();
}
