import type { ArticleSummary } from '@narcissus/shared';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { PostCard } from './post-card';

const mockArticle: ArticleSummary = {
  id: 'a1',
  title: '测试文章标题',
  slug: 'test-post',
  excerpt: '测试摘要',
  coverUrl: '',
  status: 'published',
  categoryId: 'c1',
  categorySlug: 'frontend',
  categoryName: '前端开发',
  tagItems: [
    { id: 't1', name: 'React', slug: 'react' },
    { id: 't2', name: 'TypeScript', slug: 'typescript' },
  ],
  tags: ['React', 'TypeScript'],
  createdAt: '2026-03-18T00:00:00.000Z',
  updatedAt: '2026-03-18T00:00:00.000Z',
  publishedAt: '2026-03-18T00:00:00.000Z',
};

describe('PostCard', () => {
  it('应渲染分类与标签跳转链接', () => {
    render(
      <MemoryRouter>
        <PostCard item={mockArticle} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: '前端开发' })).toHaveAttribute(
      'href',
      '/categories/frontend',
    );
    expect(screen.getByRole('link', { name: '#React' })).toHaveAttribute('href', '/tags/react');
    expect(screen.getByRole('link', { name: '#TypeScript' })).toHaveAttribute(
      'href',
      '/tags/typescript',
    );
  });
});
