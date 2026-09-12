import { useEffect, useRef, useState, useCallback } from "react";
import { getSession, onAuthStateChange } from "./db";

export function useTeacherAuth() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = signed out

  useEffect(() => {
    let mounted = true;
    getSession().then((s) => mounted && setSession(s));
    const unsubscribe = onAuthStateChange((s) => mounted && setSession(s));
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return session;
}

// Debounces a value-saving callback (used for autosave). Returns a `save`
// function that always fires against the *latest* args, plus a status
// string: 'idle' | 'saving' | 'saved' | 'error'.
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
      // eslint-disable-next-line no-console
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