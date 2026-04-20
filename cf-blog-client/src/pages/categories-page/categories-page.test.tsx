import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import { CategoriesPage } from './categories-page';

vi.mock('@/features/taxonomy/services/taxonomy-service', () => ({
  taxonomyService: {
    getPublicCategories: vi.fn().mockResolvedValue([]),
  },
}));

describe('CategoriesPage', () => {
  it('应将 categories?slug 规范化跳转到 categories/:slug', async () => {
    const client = new QueryClient();

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/categories?slug=frontend']}>
          <Routes>
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/:slug" element={<div>分类详情页面</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('分类详情页面')).toBeInTheDocument();
  });
});
