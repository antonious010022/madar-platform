import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "./supabaseClient";
import { getSession, onAuthStateChange, recoverSessionFromUrl, isStaffUser } from "./db";

/**
 * Shared auth hook (teacher + student).
 * session: undefined = loading | null = guest | object = logged in
 */
export function useAuth() {
  const [session, setSession] = useState(undefined);
  const initDone = useRef(false);

  useEffect(() => {
    let mounted = true;

    const apply = (s) => {
      if (mounted) setSession(s ?? null);
    };

    const unsubscribe = onAuthStateChange((s) => apply(s));

    (async () => {
      if (initDone.current) return;
      initDone.current = true;
      try {
        const recovered = await recoverSessionFromUrl();
        if (recovered) {
          apply(recovered);
          return;
        }

        const existing = await getSession();
        if (existing) {
          apply(existing);
          return;
        }

        await new Promise((r) => setTimeout(r, 150));
        const again = await getSession();
        if (again) {
          apply(again);
          return;
        }

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

/** true if teacher/admin, false if not, undefined while checking */
export function useStaffStatus(session) {
  const [staff, setStaff] = useState(undefined);

  useEffect(() => {
    let mounted = true;
    if (session === undefined) {
      setStaff(undefined);
      return undefined;
    }
    if (!session) {
      setStaff(false);
      return undefined;
    }
    setStaff(undefined);
    isStaffUser()
      .then((ok) => {
        if (mounted) setStaff(!!ok);
      })
      .catch(() => {
        if (mounted) setStaff(false);
      });
    return () => {
      mounted = false;
    };
  }, [session]);

  return staff;
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