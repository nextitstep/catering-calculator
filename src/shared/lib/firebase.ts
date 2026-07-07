import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAnalytics,
  isSupported as analyticsIsSupported,
  logEvent,
  type Analytics,
} from 'firebase/analytics';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const firebaseEnabled = Boolean(firebaseConfig.apiKey && firebaseConfig.databaseURL);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Database | undefined;
let analytics: Analytics | undefined;

if (firebaseEnabled) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getDatabase(app);
  analyticsIsSupported()
    .then((supported) => {
      if (supported && app) analytics = getAnalytics(app);
    })
    .catch(() => {
      // analytics unsupported in this environment (e.g. no cookies) - safe to ignore
    });
}

export const googleProvider = new GoogleAuthProvider();
export { app, auth, db, analytics };

export function logAnalyticsEvent(eventName: string, params?: Record<string, unknown>) {
  if (!analytics) return;
  logEvent(analytics, eventName, params);
}
