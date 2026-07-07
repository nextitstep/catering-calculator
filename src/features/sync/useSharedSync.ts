import { useEffect, useRef, useState } from 'react';
import { onValue, ref, set } from 'firebase/database';
import { db, ensureAnonymousAuth, firebaseEnabled } from '@/shared/lib/firebase';

type SetValue<T> = (updater: (prev: T) => T) => void;

/**
 * Keeps `value` mirrored to a single shared Realtime Database path, live, for every device that
 * has the app open - there's no per-user account, so anyone signed in (even anonymously) sees the
 * same data update in real time.
 */
export function useSharedSync<T>(path: string, value: T, setValue: SetValue<T>) {
  const [ready, setReady] = useState(!firebaseEnabled);
  const [authFailed, setAuthFailed] = useState(false);
  const lastSyncedJson = useRef<string | null>(null);
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (!firebaseEnabled) return;
    ensureAnonymousAuth()
      .then(() => setReady(true))
      .catch(() => {
        // offline, or anonymous sign-in isn't enabled for this Firebase project yet -
        // localStorage remains the source of truth either way
        setAuthFailed(true);
      });
  }, []);

  // Pull remote data (and keep listening for live changes from every other device).
  useEffect(() => {
    if (!firebaseEnabled || !db || !ready) return;
    const sharedRef = ref(db, path);
    const unsubscribe = onValue(sharedRef, (snapshot) => {
      const remote = snapshot.val() as T | null;
      const remoteJson = remote != null ? JSON.stringify(remote) : null;
      if (remoteJson === lastSyncedJson.current) return;

      lastSyncedJson.current = remoteJson;
      if (remote != null) {
        setValue(() => remote);
      }
      hasHydrated.current = true;
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, path]);

  // Push local changes up once we've hydrated from the shared data at least once.
  useEffect(() => {
    if (!firebaseEnabled || !db || !ready || !hasHydrated.current) return;
    const json = JSON.stringify(value);
    if (json === lastSyncedJson.current) return;
    const timeout = setTimeout(() => {
      lastSyncedJson.current = json;
      set(ref(db!, path), value).catch(() => {
        // offline or blocked - localStorage remains the source of truth
      });
    }, 600);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, ready, path]);

  return { enabled: firebaseEnabled, ready, authFailed };
}
