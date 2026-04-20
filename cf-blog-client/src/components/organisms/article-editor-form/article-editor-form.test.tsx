import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ArticleEditorForm } from './article-editor-form';

vi.mock('@/components/molecules/vditor-editor/vditor-editor', () => ({
  VditorEditor: ({ onChange }: { onChange: (value: string) => void }) => (
    <textarea
      aria-label="正文（Markdown）"
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
  ),
}));

describe('ArticleEditorForm', () => {
  it('编辑模式在缺少 syncKey 时也应回填表单字段', async () => {
    const handleSubmit = vi.fn();

    render(
      <ArticleEditorForm
        categories={[]}
        tags={[]}
        syncValues={{
          title: '回填标题',
          slug: 'filled-slug',
          status: 'published',
        }}
        syncContent="回填正文"
        onSubmit={handleSubmit}
      />,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('回填标题')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('filled-slug')).toBeInTheDocument();
  });
});
