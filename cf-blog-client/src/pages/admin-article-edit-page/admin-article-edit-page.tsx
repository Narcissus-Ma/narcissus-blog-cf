import type { UpdateArticleRequest } from '@narcissus/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Spin, message } from 'antd';
import { useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './admin-article-edit-page.module.css';

import { AdminArticleEditorHeader } from '@/components/organisms/admin-article-editor-header/admin-article-editor-header';
import {
  ArticleEditorForm,
  ArticleEditorFormRef,
} from '@/components/organisms/article-editor-form/article-editor-form';
import { articlesService } from '@/features/articles/services/articles-service';
import { taxonomyService } from '@/features/taxonomy/services/taxonomy-service';

export function AdminArticleEditPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const formRef = useRef<ArticleEditorFormRef | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: taxonomyService.getAdminCategories,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: taxonomyService.getAdminTags,
  });

  const {
    data: detail,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-article-detail', id],
    enabled: Boolean(id),
    queryFn: () => articlesService.getAdminDetail(id ?? ''),
  });

  const syncValues = useMemo(() => {
    if (!detail) {
      return undefined;
    }

    return {
      title: detail.title,
      slug: detail.slug,
      excerpt: detail.excerpt,
      coverUrl: detail.coverUrl,
      status: detail.status,
      categoryId: detail.categoryId ?? undefined,
      tagIds: detail.tagIds ?? [],
      seoTitle: detail.seoTitle,
      seoDescription: detail.seoDescription,
      isTop: detail.isTop,
    };
  }, [detail]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateArticleRequest) => articlesService.update(id ?? '', payload),
    onSuccess: async () => {
      message.success('文章更新成功');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-articles'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-article-detail', id] }),
      ]);
      navigate('/admin/articles');
    },
    onError: () => {
      message.error('更新失败，请稍后重试');
    },
  });

  if (!id) {
    return (
      <section className={styles.page}>
        <h1>参数错误</h1>
        <p>未获取到文章 ID，请返回列表重试。</p>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <AdminArticleEditorHeader
        title="编辑文章"
        description="修改文章内容与 SEO 信息，点击更新默认存草稿，点击发布才会正式发布。"
        submitText="更新文章"
        submitLoading={updateMutation.isPending}
        publishLoading={updateMutation.isPending}
        previewUrl={detail?.slug ? `/post/${detail.slug}` : undefined}
        onBack={() => {
          navigate('/admin/articles');
        }}
        onSubmit={() => {
          formRef.current?.submit({ status: 'draft' });
        }}
        onPublish={() => {
          formRef.current?.submit({ status: 'published' });
        }}
      />

      <Spin spinning={isLoading}>
        {isError ? (
          <div className={styles.error}>文章加载失败，请返回列表后重试。</div>
        ) : (
          <ArticleEditorForm
            ref={formRef}
            categories={categories}
            tags={tags}
            defaultValues={{ status: 'draft', isTop: false }}
            syncKey={detail?.updatedAt}
            syncValues={syncValues}
            syncContent={detail?.content ?? ''}
            showIsTop
            onSubmit={(values) => {
              updateMutation.mutate(values);
            }}
          />
        )}
      </Spin>
    </section>
  );
}
