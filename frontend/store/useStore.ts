import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: { username: string } | null;
  token: string | null;
  setUser: (user: { username: string } | null, token: string | null) => void;
}

export const useStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user, token) => set({ user, token }),
    }),
    {
      name: 'auth-storage', 
      storage: createJSONStorage(() => localStorage),
    },
  ),
);