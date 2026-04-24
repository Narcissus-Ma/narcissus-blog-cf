import type { ArticleDetail } from '@narcissus/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PostDetailPage } from './post-detail-page';

const mockGetPublicDetail = vi.fn();
const mockGetRecommendations = vi.fn();

vi.mock('@/features/articles/services/articles-service', () => ({
  articlesService: {
    getPublicDetail: (...args: unknown[]) => mockGetPublicDetail(...args),
    getRecommendations: (...args: unknown[]) => mockGetRecommendations(...args),
  },
}));

function renderPostDetail() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/post/test-post']}>
        <Routes>
          <Route path="/post/:slug" element={<PostDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const mockArticleDetail: ArticleDetail = {
  id: 'a1',
  title: '桌面应用开发框架选择',
  slug: 'test-post',
  excerpt: '这是一段摘要',
  coverUrl: '',
  status: 'published',
  categoryId: 'c1',
  categorySlug: 'frontend',
  categoryName: '前端开发',
  tagItems: [{ id: 't1', name: 'Rust', slug: 'rust' }],
  tags: ['Rust'],
  createdAt: '2026-04-01T08:00:00.000Z',
  updatedAt: '2026-04-05T08:00:00.000Z',
  publishedAt: '2026-04-02T08:00:00.000Z',
  content: '# 前言\n\n## 技术对比\n\n内容',
  seoTitle: 'seo-title',
  seoDescription: 'seo-description',
  prevPost: { title: '上一篇文章', slug: 'prev-post' },
  nextPost: { title: '下一篇文章', slug: 'next-post' },
};

describe('PostDetailPage', () => {
  beforeEach(() => {
    mockGetPublicDetail.mockReset();
    mockGetRecommendations.mockReset();
    mockGetPublicDetail.mockResolvedValue(mockArticleDetail);
    mockGetRecommendations.mockResolvedValue([
      {
        id: 'r1',
        title: '相关实践：Tauri 上手指南',
        slug: 'tauri-guide',
        excerpt: '快速上手 Tauri 的实践文章',
        coverUrl: '',
        updatedAt: '2026-04-06T08:00:00.000Z',
      },
    ]);
  });

  it('应展示发布时间、更新时间与阅读进度', async () => {
    renderPostDetail();

    expect(await screen.findByRole('heading', { name: '桌面应用开发框架选择' })).toBeInTheDocument();
    expect(screen.getByText(/发布于/)).toBeInTheDocument();
    expect(screen.getByText(/更新于/)).toBeInTheDocument();
    expect(screen.getByText('阅读进度 0%')).toBeInTheDocument();
  });

  it('应展示文章推荐栏并渲染推荐文章', async () => {
    renderPostDetail();

    expect(await screen.findByText('推荐阅读')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockGetRecommendations).toHaveBeenCalledWith('test-post', 3);
    });

    expect(screen.getByRole('link', { name: '相关实践：Tauri 上手指南' })).toHaveAttribute(
      'href',
      '/post/tauri-guide',
    );
  });
});
