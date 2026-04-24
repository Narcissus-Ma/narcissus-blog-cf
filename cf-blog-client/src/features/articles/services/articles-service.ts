import type {
  ArticleDetail,
  ArticleSummary,
  ArticleStatus,
  CreateArticleRequest,
  PaginationResult,
  RandomArticleResult,
  UpdateArticleRequest,
} from '@narcissus/shared';

import { apiClient, unwrapResponse } from '@/services/api-client';

export interface ArticleQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: 'draft' | 'published';
  categorySlug?: string;
  tagSlug?: string;
}

export interface PublicSearchQuery {
  keyword: string;
  page?: number;
  pageSize?: number;
}

export interface ArticleRecommendation {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverUrl: string;
  updatedAt: string;
}

export interface AdminArticleDetail extends ArticleDetail {
  categoryId: string | null;
  tagIds: string[];
  isTop: boolean;
  status: ArticleStatus;
}

export const articlesService = {
  async getPublicList(query: ArticleQuery): Promise<PaginationResult<ArticleSummary & { isUnread: boolean; commentCount: number }>> {
    const response = await apiClient.get('/articles/public', { params: query });
    const result = unwrapResponse<PaginationResult<ArticleSummary>>(response);
    
    // 处理未读标记
    const readArticles = localStorage.getItem('readArticles');
    const readArticleIds = readArticles ? JSON.parse(readArticles) : [];
    
    // 为每篇文章添加未读标记和评论数
    const processedList = result.list.map(article => ({
      ...article,
      isUnread: !readArticleIds.includes(article.id),
      commentCount: (article as any).commentCount || 0,
    }));
    
    return {
      ...result,
      list: processedList
    };
  },
  async searchPublic(query: PublicSearchQuery): Promise<PaginationResult<ArticleSummary & { isUnread: boolean; commentCount: number }>> {
    const response = await apiClient.get('/articles/public/search', { params: query });
    const result = unwrapResponse<PaginationResult<ArticleSummary>>(response);
    
    // 处理未读标记
    const readArticles = localStorage.getItem('readArticles');
    const readArticleIds = readArticles ? JSON.parse(readArticles) : [];
    
    // 为每篇文章添加未读标记和评论数
    const processedList = result.list.map(article => ({
      ...article,
      isUnread: !readArticleIds.includes(article.id),
      commentCount: (article as any).commentCount || 0,
    }));
    
    return {
      ...result,
      list: processedList
    };
  },
  async getPublicDetail(slug: string): Promise<ArticleDetail> {
    const response = await apiClient.get(`/articles/public/${slug}`);
    const article = unwrapResponse<ArticleDetail>(response);
    
    // 标记为已读
    this.markAsRead(article.id);
    
    return article;
  },
  async getRecommendations(slug: string, size = 3): Promise<ArticleRecommendation[]> {
    const response = await apiClient.get(`/articles/public/${slug}/recommendations`, {
      params: { size },
    });
    return unwrapResponse<ArticleRecommendation[]>(response);
  },
  // 标记文章为已读
  markAsRead(articleId: string): void {
    const readArticles = localStorage.getItem('readArticles');
    const readArticleIds = readArticles ? JSON.parse(readArticles) : [];
    
    if (!readArticleIds.includes(articleId)) {
      readArticleIds.push(articleId);
      localStorage.setItem('readArticles', JSON.stringify(readArticleIds));
    }
  },
  async getRandomPublicArticle(): Promise<RandomArticleResult> {
    const response = await apiClient.get('/articles/public/random');
    return unwrapResponse<RandomArticleResult>(response);
  },
  async getAdminList(query: ArticleQuery): Promise<PaginationResult<ArticleSummary>> {
    const response = await apiClient.get('/articles', { params: query });
    return unwrapResponse<PaginationResult<ArticleSummary>>(response);
  },
  async getAdminDetail(id: string): Promise<AdminArticleDetail> {
    const response = await apiClient.get(`/articles/${id}`);
    return unwrapResponse<AdminArticleDetail>(response);
  },
  async create(payload: CreateArticleRequest): Promise<ArticleSummary> {
    const response = await apiClient.post('/articles', payload);
    return unwrapResponse<ArticleSummary>(response);
  },
  async update(id: string, payload: UpdateArticleRequest): Promise<AdminArticleDetail> {
    const response = await apiClient.patch(`/articles/${id}`, payload);
    return unwrapResponse<AdminArticleDetail>(response);
  },
  async remove(id: string): Promise<{ id: string }> {
    const response = await apiClient.delete(`/articles/${id}`);
    return unwrapResponse<{ id: string }>(response);
  },
};
