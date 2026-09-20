import { getApp, getApps, initializeApp } from "firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  createUserWithEmailAndPassword,
  getAuth,
  initializeAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  // @ts-expect-error Firebase root typings omit this platform-specific export.
  getReactNativePersistence,
} from "firebase/auth";

const env = (globalThis as any).process?.env ?? {};
const firebaseConfig = {
  apiKey:
    env.EXPO_PUBLIC_FIREBASE_API_KEY ??
    "AIzaSyDfFgapWan0sss4-5njG7KEtQiyaTcnIME",
  authDomain:
    env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "eatwell-e1379.firebaseapp.com",
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "eatwell-e1379",
  storageBucket:
    env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    "eatwell-e1379.firebasestorage.app",
  messagingSenderId:
    env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "104180330780",
  appId:
    env.EXPO_PUBLIC_FIREBASE_APP_ID ??
    "1:104180330780:web:049a700b5bdaca05ca4ad9",
  measurementId: env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-81V5TZP5S8",
};

export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId,
);

let auth: Auth | null = null;
if (firebaseConfigured) {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth =
    Platform.OS === "web"
      ? getAuth(app)
      : initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
}

export const firebaseAuth = auth;
export const loginWithEmail = (email: string, password: string) => {
  if (!auth) return Promise.resolve(null);
  return signInWithEmailAndPassword(auth, email, password);
};
export const registerWithEmail = (email: string, password: string) => {
  if (!auth) return Promise.resolve(null);
  return createUserWithEmailAndPassword(auth, email, password);
};
export const resetPassword = (email: string) => {
  if (!auth) return Promise.resolve();
  return sendPasswordResetEmail(auth, email);
};
export const logout = () => (auth ? signOut(auth) : Promise.resolve());
