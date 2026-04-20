import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ArticleEditorForm, ArticleEditorFormRef } from './article-editor-form';

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

  it('外部按钮触发发布时应提交 published 状态', async () => {
    const handleSubmit = vi.fn();
    const formRef = createRef<ArticleEditorFormRef>();

    render(
      <ArticleEditorForm
        ref={formRef}
        categories={[]}
        tags={[]}
        defaultValues={{ title: '测试标题', slug: 'test-slug' }}
        syncContent="测试正文"
        onSubmit={handleSubmit}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('请输入文章标题'), {
      target: { value: '测试标题' },
    });
    fireEvent.change(screen.getByPlaceholderText('请输入文章 slug，例如 react-hooks-guide'), {
      target: { value: 'test-slug' },
    });

    await act(async () => {
      formRef.current?.submit({ status: 'published' });
    });

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '测试标题',
          slug: 'test-slug',
          status: 'published',
        }),
      );
    });
  });
});
