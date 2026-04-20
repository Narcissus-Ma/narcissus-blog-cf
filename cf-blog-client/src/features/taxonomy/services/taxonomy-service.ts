import type {
  CategoryItem,
  TagItem,
  UpsertCategoryRequest,
  UpsertTagRequest,
} from '@narcissus/shared';

import { apiClient, unwrapResponse } from '@/services/api-client';

export const taxonomyService = {
  async getPublicCategories(): Promise<CategoryItem[]> {
    const response = await apiClient.get('/categories/public');
    return unwrapResponse<CategoryItem[]>(response);
  },
  async getPublicTags(): Promise<TagItem[]> {
    const response = await apiClient.get('/tags/public');
    return unwrapResponse<TagItem[]>(response);
  },
  async getAdminCategories(): Promise<CategoryItem[]> {
    const response = await apiClient.get('/categories');
    return unwrapResponse<CategoryItem[]>(response);
  },
  async getAdminTags(): Promise<TagItem[]> {
    const response = await apiClient.get('/tags');
    return unwrapResponse<TagItem[]>(response);
  },
  async createCategory(payload: UpsertCategoryRequest): Promise<CategoryItem> {
    const response = await apiClient.post('/categories', payload);
    return unwrapResponse<CategoryItem>(response);
  },
  async updateCategory(id: string, payload: UpsertCategoryRequest): Promise<CategoryItem> {
    const response = await apiClient.patch(`/categories/${id}`, payload);
    return unwrapResponse<CategoryItem>(response);
  },
  async removeCategory(id: string): Promise<{ id: string }> {
    const response = await apiClient.delete(`/categories/${id}`);
    return unwrapResponse<{ id: string }>(response);
  },
  async createTag(payload: UpsertTagRequest): Promise<TagItem> {
    const response = await apiClient.post('/tags', payload);
    return unwrapResponse<TagItem>(response);
  },
  async updateTag(id: string, payload: UpsertTagRequest): Promise<TagItem> {
    const response = await apiClient.patch(`/tags/${id}`, payload);
    return unwrapResponse<TagItem>(response);
  },
  async removeTag(id: string): Promise<{ id: string }> {
    const response = await apiClient.delete(`/tags/${id}`);
    return unwrapResponse<{ id: string }>(response);
  },
};
