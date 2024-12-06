import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (isLoading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  theme: 'light',
  isLoading: true,
  setUser: (user) => set({ user }),
  setTheme: (theme) => set({ theme }),
  setLoading: (isLoading) => set({ isLoading }),
}));