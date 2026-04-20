import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { HeaderSearchModal } from './header-search-modal';

const mockSearchPublic = vi.fn();

vi.mock('@/features/articles/services/articles-service', () => ({
  articlesService: {
    searchPublic: (...args: unknown[]) => mockSearchPublic(...args),
  },
}));

describe('HeaderSearchModal', () => {
  it('按下 Escape 后应关闭弹窗', async () => {
    const onClose = vi.fn();
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <HeaderSearchModal isOpen keyword="" onClose={onClose} onKeywordChange={vi.fn()} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const input = await screen.findByPlaceholderText('请输入搜索关键词');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
