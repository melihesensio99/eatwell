import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

export const authService = {
  signIn: async (email: string, password: string) => (await signInWithEmailAndPassword(getFirebaseAuth(), email, password)).user,
  signUp: async (email: string, password: string) => (await createUserWithEmailAndPassword(getFirebaseAuth(), email, password)).user,
  signOut: () => signOut(getFirebaseAuth()),
};
