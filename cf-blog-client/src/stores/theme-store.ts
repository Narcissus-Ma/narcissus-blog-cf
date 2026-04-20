import { create } from 'zustand';

import { storage } from '@/utils/storage';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_KEY = 'narcissus-theme';

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: storage.get<ThemeMode>(THEME_KEY, 'light'),
  setTheme(theme) {
    storage.set(THEME_KEY, theme);
    set({ theme });
    document.documentElement.setAttribute('data-theme', theme);
  },
  toggleTheme() {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(nextTheme);
  },
}));
