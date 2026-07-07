import { useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { onValue, ref, set } from 'firebase/database';
import type { Recipe } from '@/types';
import { auth, db, firebaseEnabled, googleProvider, logAnalyticsEvent } from '@/shared/lib/firebase';

type SetRecipes = (updater: (prev: Recipe[]) => Recipe[]) => void;

export function useCloudSync(recipes: Recipe[], setRecipes: SetRecipes) {
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
    const recipesRef = ref(db, `users/${user.uid}/recipes`);
    const unsubscribe = onValue(recipesRef, (snapshot) => {
      const remote = snapshot.val() as Recipe[] | null;
      const remoteJson = remote ? JSON.stringify(remote) : null;
      if (remoteJson === lastSyncedJson.current) return;

      lastSyncedJson.current = remoteJson;
      if (remote && remote.length > 0) {
        setRecipes(() => remote);
      }
      hasHydrated.current = true;
    });
    return () => unsubscribe();
  }, [user, setRecipes]);

  // Push local changes up once we've hydrated from the cloud at least once.
  useEffect(() => {
    if (!firebaseEnabled || !db || !user || !hasHydrated.current) return;
    const json = JSON.stringify(recipes);
    if (json === lastSyncedJson.current) return;
    const timeout = setTimeout(() => {
      lastSyncedJson.current = json;
      set(ref(db!, `users/${user.uid}/recipes`), recipes).catch(() => {
        // offline or blocked - localStorage remains the source of truth
      });
    }, 600);
    return () => clearTimeout(timeout);
  }, [recipes, user]);

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
