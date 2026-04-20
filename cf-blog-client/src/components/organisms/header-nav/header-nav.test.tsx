import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HeaderNav } from './header-nav';

import { useSiteStore } from '@/stores/site-store';

const mockSearchPublic = vi.fn();
const mockGetRandomPublicArticle = vi.fn();
const mockGetPublicList = vi.fn();

vi.mock('@/features/articles/services/articles-service', () => ({
  articlesService: {
    searchPublic: (...args: unknown[]) => mockSearchPublic(...args),
    getRandomPublicArticle: (...args: unknown[]) => mockGetRandomPublicArticle(...args),
    getPublicList: (...args: unknown[]) => mockGetPublicList(...args),
  },
}));

function renderHeader(initialEntries: string[] = ['/']) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <HeaderNav />
                <Routes>
                  <Route path="/search" element={<div>搜索结果页面</div>} />
                  <Route path="/post/:slug" element={<div>文章详情页面</div>} />
                </Routes>
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('HeaderNav', () => {
  beforeEach(() => {
    mockSearchPublic.mockReset();
    mockGetRandomPublicArticle.mockReset();
    mockGetPublicList.mockReset();
    useSiteStore.setState({
      siteName: 'Narcissus的个人博客',
      siteDescription: '分享一些程序员开发，生活学习记录',
      navItems: [
        { name: '隧道', path: '/archives' },
        { name: '分类', path: '/categories' },
        { name: '标签', path: '/tags' },
      ],
      popupNotice: {
        enabled: false,
        title: '',
        message: '',
        ctaText: '',
        ctaLink: '',
        homeOnly: true,
      },
    });
  });

  it('应渲染搜索按钮、随机文章按钮与主题按钮', () => {
    renderHeader();

    expect(screen.getByRole('button', { name: '搜索' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '随机文章' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '中控台' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '切换主题' })).toBeInTheDocument();
  });

  it('点击中控台按钮后应打开快捷面板并展示最新文章', async () => {
    mockGetPublicList.mockResolvedValue({
      list: [
        {
          id: 'a2',
          title: '最新文章',
          slug: 'latest-post',
          excerpt: '摘要',
          coverUrl: '',
          status: 'published',
          categoryId: 'c1',
          categorySlug: 'frontend',
          categoryName: '前端',
          tagItems: [],
          tags: [],
          createdAt: '2026-04-13T00:00:00.000Z',
          updatedAt: '2026-04-13T00:00:00.000Z',
          publishedAt: '2026-04-13T00:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 5,
    });

    renderHeader();

    fireEvent.click(screen.getByRole('button', { name: '中控台' }));

    expect(await screen.findByText('最新文章')).toBeInTheDocument();

    const dialog = await screen.findByRole('dialog');

    expect(within(dialog).getByRole('link', { name: '隧道' })).toHaveAttribute('href', '/archives');
  });

  it('点击搜索按钮后应打开搜索弹窗并显示后端结果', async () => {
    mockSearchPublic.mockResolvedValue({
      list: [
        {
          id: 'a1',
          title: 'React 搜索测试',
          slug: 'react-search',
          excerpt: '摘要',
          coverUrl: '',
          status: 'published',
          categoryId: 'c1',
          categorySlug: 'frontend',
          categoryName: '前端',
          tagItems: [],
          tags: [],
          createdAt: '2026-04-13T00:00:00.000Z',
          updatedAt: '2026-04-13T00:00:00.000Z',
          publishedAt: '2026-04-13T00:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 5,
    });

    renderHeader();

    fireEvent.click(screen.getByRole('button', { name: '搜索' }));

    const input = await screen.findByPlaceholderText('请输入搜索关键词');
    fireEvent.change(input, { target: { value: 'React' } });

    await waitFor(() => {
      expect(mockSearchPublic).toHaveBeenCalledWith({
        keyword: 'React',
        page: 1,
        pageSize: 5,
      });
    });

    const title = await screen.findByText('React 搜索测试');

    expect(title.closest('a')).toHaveAttribute('href', '/post/react-search');
  });

  it('点击查看更多结果后应跳转到搜索结果页', async () => {
    mockSearchPublic.mockResolvedValue({
      list: [],
      total: 0,
      page: 1,
      pageSize: 5,
    });

    renderHeader();

    fireEvent.click(screen.getByRole('button', { name: '搜索' }));

    const input = await screen.findByPlaceholderText('请输入搜索关键词');
    fireEvent.change(input, { target: { value: 'Rust' } });

    await waitFor(() => {
      expect(mockSearchPublic).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('button', { name: '查看更多结果' }));

    expect(await screen.findByText('搜索结果页面')).toBeInTheDocument();
  });

  it('点击随机文章按钮后应跳转到文章详情页', async () => {
    mockGetRandomPublicArticle.mockResolvedValue({
      slug: 'random-post',
      title: '随机文章',
    });

    renderHeader();

    fireEvent.click(screen.getByRole('button', { name: '随机文章' }));

    await waitFor(() => {
      expect(mockGetRandomPublicArticle).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('文章详情页面')).toBeInTheDocument();
  });
});
