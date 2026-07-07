import { useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { onValue, ref, set } from 'firebase/database';
import type { Menu } from '@/types';
import { auth, db, firebaseEnabled, googleProvider, logAnalyticsEvent } from '@/shared/lib/firebase';

type SetMenus = (updater: (prev: Menu[]) => Menu[]) => void;

export function useCloudSync(menus: Menu[], setMenus: SetMenus) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!firebaseEnabled);
  const lastSyncedJson = useRef<string | null>(null);
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (!firebaseEnabled || !auth) return;
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Pull remote data (and keep listening for changes from other devices).
  useEffect(() => {
    if (!firebaseEnabled || !db || !user) {
      hasHydrated.current = false;
      return;
    }
    const menusRef = ref(db, `users/${user.uid}/menus`);
    const unsubscribe = onValue(menusRef, (snapshot) => {
      const remote = snapshot.val() as Menu[] | null;
      const remoteJson = remote ? JSON.stringify(remote) : null;
      if (remoteJson === lastSyncedJson.current) return;

      lastSyncedJson.current = remoteJson;
      if (remote && remote.length > 0) {
        setMenus(() => remote);
      }
      hasHydrated.current = true;
    });
    return () => unsubscribe();
  }, [user, setMenus]);

  // Push local changes up once we've hydrated from the cloud at least once.
  useEffect(() => {
    if (!firebaseEnabled || !db || !user || !hasHydrated.current) return;
    const json = JSON.stringify(menus);
    if (json === lastSyncedJson.current) return;
    const timeout = setTimeout(() => {
      lastSyncedJson.current = json;
      set(ref(db!, `users/${user.uid}/menus`), menus).catch(() => {
        // offline or blocked - localStorage remains the source of truth
      });
    }, 600);
    return () => clearTimeout(timeout);
  }, [menus, user]);

  const signIn = async () => {
    if (!firebaseEnabled || !auth) return;
    await signInWithPopup(auth, googleProvider);
    logAnalyticsEvent('login', { method: 'google' });
  };

  const signOutUser = async () => {
    if (!firebaseEnabled || !auth) return;
    await firebaseSignOut(auth);
  };

  return {
    enabled: firebaseEnabled,
    user,
    authReady,
    signIn,
    signOut: signOutUser,
  };
}
