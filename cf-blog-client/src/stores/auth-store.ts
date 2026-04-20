import { create } from 'zustand';

import { storage } from '@/utils/storage';

interface UserProfile {
  id: string;
  username: string;
  nickname: string;
}

interface AuthState {
  accessToken: string;
  user: UserProfile | null;
  login: (username: string, password: string) => Promise<void>;
  setAuth: (payload: { accessToken: string; user: UserProfile }) => void;
  clearAuth: () => void;
}

const AUTH_KEY = 'narcissus-auth';

const initialState = storage.get<Omit<AuthState, 'setAuth' | 'clearAuth' | 'login'>>(AUTH_KEY, {
  accessToken: '',
  user: null,
});

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  login: async (username, password) => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8788/api'}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('登录失败');
    }

    const data = await response.json();
    set({
      accessToken: data.token,
      user: { id: '1', username, nickname: username },
    });
    storage.set(AUTH_KEY, { accessToken: data.token, user: { id: '1', username, nickname: username } });
  },
  setAuth(payload) {
    storage.set(AUTH_KEY, payload);
    set(payload);
  },
  clearAuth() {
    storage.remove(AUTH_KEY);
    set({ accessToken: '', user: null });
  },
}));
