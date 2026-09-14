import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "./supabaseClient";
import { getSession, onAuthStateChange, recoverSessionFromUrl } from "./db";

/**
 * Shared auth hook (teacher + student).
 * session: undefined = loading | null = guest | object = logged in
 *
 * Google OAuth returns with ?code= on the URL. We must exchange that into a
 * persisted session before rendering "guest", and keep listening so refresh works.
 */
export function useAuth() {
  const [session, setSession] = useState(undefined);
  const initDone = useRef(false);

  useEffect(() => {
    let mounted = true;

    const apply = (s) => {
      if (mounted) setSession(s ?? null);
    };

    // Subscribe immediately so SIGNED_IN / TOKEN_REFRESHED / INITIAL_SESSION are not missed
    const unsubscribe = onAuthStateChange((s) => apply(s));

    (async () => {
      if (initDone.current) return;
      initDone.current = true;
      try {
        // 1) OAuth return: exchange ?code= / read hash tokens
        const recovered = await recoverSessionFromUrl();
        if (recovered) {
          apply(recovered);
          return;
        }

        // 2) Storage
        const existing = await getSession();
        if (existing) {
          apply(existing);
          return;
        }

        // 3) Brief retry — client init / detectSessionInUrl may still be in flight
        await new Promise((r) => setTimeout(r, 150));
        const again = await getSession();
        if (again) {
          apply(again);
          return;
        }

        // 4) getUser validates JWT against server (more reliable after OAuth)
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data: sessData } = await supabase.auth.getSession();
          apply(sessData?.session ?? null);
          return;
        }

        apply(null);
      } catch (e) {
        console.error("useAuth init:", e);
        apply(null);
      }
    })();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return session;
}

export function useTeacherAuth() {
  return useAuth();
}

export function useAutosave(saveFn, delay = 800) {
  const [status, setStatus] = useState("idle");
  const timerRef = useRef(null);
  const latestArgsRef = useRef(null);

  const flush = useCallback(async () => {
    if (!latestArgsRef.current) return;
    const args = latestArgsRef.current;
    setStatus("saving");
    try {
      await saveFn(...args);
      setStatus("saved");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }, [saveFn]);

  const save = useCallback(
    (...args) => {
      latestArgsRef.current = args;
      setStatus("saving");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, delay);
    },
    [flush, delay]
  );

  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

  return { save, status };
}
