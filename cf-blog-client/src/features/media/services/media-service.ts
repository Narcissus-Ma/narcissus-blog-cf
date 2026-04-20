import type {
  CreateUploadTicketRequest,
  MediaAssetItem,
  UploadTicketResult,
} from '@narcissus/shared';

import { apiClient, unwrapResponse } from '@/services/api-client';

export const mediaService = {
  async listAssets(): Promise<MediaAssetItem[]> {
    const response = await apiClient.get('/media');
    return unwrapResponse<MediaAssetItem[]>(response);
  },
  async createUploadTicket(payload: CreateUploadTicketRequest): Promise<UploadTicketResult> {
    const response = await apiClient.post('/media/upload-ticket', payload);
    return unwrapResponse<UploadTicketResult>(response);
  },
  async removeAsset(id: string): Promise<{ id: string }> {
    const response = await apiClient.delete(`/media/${id}`);
    return unwrapResponse<{ id: string }>(response);
  },
};
