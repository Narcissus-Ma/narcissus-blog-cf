import type { LoginRequest } from '@narcissus/shared';

import { useAuthStore } from '@/stores/auth-store';

export const authService = {
  async login(payload: LoginRequest): Promise<{ accessToken: string; user: { id: string; username: string; nickname: string } }> {
    await useAuthStore.getState().login(payload.username, payload.password);
    const { accessToken, user } = useAuthStore.getState();
    return { accessToken, user: user! };
  },
};
