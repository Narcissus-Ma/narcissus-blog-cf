import type { CreateArticleRequest } from '@narcissus/shared';
import { useMutation, useQuery } from '@tanstack/react-query';
import { message } from 'antd';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './admin-article-create-page.module.css';

import { AdminArticleEditorHeader } from '@/components/organisms/admin-article-editor-header/admin-article-editor-header';
import {
  ArticleEditorForm,
  ArticleEditorFormRef,
} from '@/components/organisms/article-editor-form/article-editor-form';
import { articlesService } from '@/features/articles/services/articles-service';
import { taxonomyService } from '@/features/taxonomy/services/taxonomy-service';

export function AdminArticleCreatePage() {
  const navigate = useNavigate();
  const formRef = useRef<ArticleEditorFormRef | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: taxonomyService.getAdminCategories,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: taxonomyService.getAdminTags,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateArticleRequest) => articlesService.create(payload),
    onSuccess: () => {
      message.success('文章创建成功');
      navigate('/admin/articles');
    },
    onError: () => {
      message.error('创建失败，请检查 slug 或标题是否重复');
    },
  });

  return (
    <section className={styles.page}>
      <AdminArticleEditorHeader
        title="新建文章"
        description="使用 Vditor 编辑 Markdown 内容，完成后可选择草稿或直接发布。"
        submitText="保存文章"
        submitLoading={createMutation.isPending}
        onBack={() => {
          navigate('/admin/articles');
        }}
        onSubmit={() => {
          formRef.current?.submit();
        }}
      />
      <ArticleEditorForm
        ref={formRef}
        categories={categories}
        tags={tags}
        defaultValues={{ status: 'draft' }}
        autoGenerateSlug
        onSubmit={(values) => {
          createMutation.mutate(values);
        }}
      />
    </section>
  );
}
