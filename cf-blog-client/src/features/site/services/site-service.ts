import type { SiteSetting } from '@narcissus/shared';

import { apiClient, unwrapResponse } from '@/services/api-client';

export const siteService = {
  async getPublicSiteSetting(): Promise<SiteSetting> {
    const response = await apiClient.get('/site-settings/public');
    return unwrapResponse<SiteSetting>(response);
  },
  async getAdminSiteSetting(): Promise<SiteSetting> {
    const response = await apiClient.get('/site-settings');
    return unwrapResponse<SiteSetting>(response);
  },
  async updateSiteSetting(payload: SiteSetting): Promise<SiteSetting> {
    const response = await apiClient.put('/site-settings', payload);
    return unwrapResponse<SiteSetting>(response);
  },
};
