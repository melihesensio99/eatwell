import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { onIdTokenChanged } from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '../features/auth/api/firebase';

const TOKEN_KEY = 'eatwell.firebase.id-token';

const getStoredToken = async () => Platform.OS === 'web'
  ? globalThis.localStorage?.getItem(TOKEN_KEY) ?? null
  : await SecureStore.getItemAsync(TOKEN_KEY);

const storeToken = async (token: string | null) => {
  if (Platform.OS === 'web') {
    if (token) globalThis.localStorage?.setItem(TOKEN_KEY, token);
    else globalThis.localStorage?.removeItem(TOKEN_KEY);
    return;
  }

  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
};

interface AuthState {
  readonly token: string | null;
  readonly isHydrated: boolean;
  readonly setToken: (token: string | null) => Promise<void>;
  readonly hydrate: () => Promise<void>;
  readonly signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isHydrated: false,
  setToken: async (token) => {
    await storeToken(token);
    set({ token });
  },
  hydrate: async () => {
    const token = await getStoredToken();
    set({ token, isHydrated: true });
    if (isFirebaseConfigured) {
      onIdTokenChanged(getFirebaseAuth(), async (user) => {
        if (!user) {
          await storeToken(null);
          set({ token: null });
          return;
        }
        const nextToken = await user.getIdToken();
        await storeToken(nextToken);
        set({ token: nextToken });
      });
    }
  },
  signOut: async () => {
    if (isFirebaseConfigured) await getFirebaseAuth().signOut();
    await storeToken(null);
    set({ token: null });
  },
}));
