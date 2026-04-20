import { Form, Input, Select, Switch, Tabs, message } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

import styles from './article-editor-form.module.css';

import { VditorEditor } from '@/components/molecules/vditor-editor/vditor-editor';

interface OptionItem {
  id: string;
  name: string;
}

export interface ArticleEditorFormValues {
  title: string;
  slug: string;
  excerpt?: string;
  coverUrl?: string;
  status: 'draft' | 'published';
  categoryId?: string;
  tagIds?: string[];
  seoTitle?: string;
  seoDescription?: string;
  isTop?: boolean;
}

export interface ArticleEditorSubmitValues extends ArticleEditorFormValues {
  content: string;
}

export interface ArticleEditorFormRef {
  submit: (options?: { status?: ArticleEditorFormValues['status'] }) => void;
}

interface ArticleEditorFormProps {
  categories: OptionItem[];
  tags: OptionItem[];
  defaultValues?: Partial<ArticleEditorFormValues>;
  syncKey?: string;
  syncValues?: Partial<ArticleEditorFormValues>;
  syncContent?: string;
  showIsTop?: boolean;
  autoGenerateSlug?: boolean;
  onSubmit: (values: ArticleEditorSubmitValues) => void;
}

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export const ArticleEditorForm = forwardRef<ArticleEditorFormRef, ArticleEditorFormProps>(
  (
    {
      categories,
      tags,
      defaultValues,
      syncKey,
      syncValues,
      syncContent,
      showIsTop,
      autoGenerateSlug,
      onSubmit,
    },
    ref,
  ) => {
    const [form] = Form.useForm<ArticleEditorFormValues>();
    const [content, setContent] = useState(syncContent ?? '');
    const submitOptionsRef = useRef<{ status?: ArticleEditorFormValues['status'] } | undefined>(
      undefined,
    );

    const categoryOptions = useMemo(
      () => categories.map((item) => ({ label: item.name, value: item.id })),
      [categories],
    );
    const tagOptions = useMemo(
      () => tags.map((item) => ({ label: item.name, value: item.id })),
      [tags],
    );

    useImperativeHandle(
      ref,
      () => ({
        submit: (options) => {
          submitOptionsRef.current = options;
          form.submit();
        },
      }),
      [form],
    );

    useEffect(() => {
      // 编辑页有些后端实现不会返回 updatedAt，不能仅依赖 syncKey 触发回填。
      if (!syncKey && !syncValues && syncContent === undefined) {
        return;
      }

      form.setFieldsValue(syncValues ?? {});
      setContent(syncContent ?? '');
    }, [form, syncContent, syncKey, syncValues]);

    return (
      <Form
        form={form}
        layout="vertical"
        className={styles.form}
        initialValues={{ status: 'draft', isTop: false, ...defaultValues }}
        onFinish={(values) => {
          if (!content.trim()) {
            message.warning('请输入正文内容');
            return;
          }

          const submitStatus = submitOptionsRef.current?.status ?? values.status ?? 'draft';
          submitOptionsRef.current = undefined;

          onSubmit({
            ...values,
            status: submitStatus,
            content,
          });
        }}
      >
        <Tabs
          destroyInactiveTabPane={false}
          className={styles.tabs}
          items={[
            {
              key: 'settings',
              label: '表单设置',
              children: (
                <div className={styles.pane}>
                  <div className={styles.grid2}>
                    <Form.Item
                      label="标题"
                      name="title"
                      rules={[{ required: true, message: '请输入文章标题' }]}
                    >
                      <Input
                        placeholder="请输入文章标题"
                        onBlur={(event) => {
                          if (!autoGenerateSlug) {
                            return;
                          }

                          const currentSlug = form.getFieldValue('slug');
                          if (!currentSlug) {
                            form.setFieldValue('slug', toSlug(event.target.value));
                          }
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Slug"
                      name="slug"
                      rules={[{ required: true, message: '请输入文章 slug' }]}
                    >
                      <Input placeholder="请输入文章 slug，例如 react-hooks-guide" />
                    </Form.Item>
                    <Form.Item label="分类" name="categoryId">
                      <Select allowClear options={categoryOptions} placeholder="请选择分类" />
                    </Form.Item>
                    <Form.Item label="标签" name="tagIds">
                      <Select
                        mode="multiple"
                        allowClear
                        options={tagOptions}
                        placeholder="请选择标签（可多选）"
                      />
                    </Form.Item>
                    <Form.Item label="封面图地址" name="coverUrl">
                      <Input placeholder="请输入封面图 URL（可选）" />
                    </Form.Item>
                    <Form.Item label="SEO 标题" name="seoTitle">
                      <Input placeholder="请输入 SEO 标题（可选）" />
                    </Form.Item>
                    <Form.Item label="SEO 描述" name="seoDescription">
                      <Input placeholder="请输入 SEO 描述（可选）" />
                    </Form.Item>
                  </div>

                  <Form.Item label="摘要" name="excerpt">
                    <Input.TextArea rows={3} placeholder="请输入文章摘要（可选）" />
                  </Form.Item>

                  {showIsTop ? (
                    <Form.Item label="置顶文章" name="isTop" valuePropName="checked">
                      <Switch checkedChildren="已置顶" unCheckedChildren="未置顶" />
                    </Form.Item>
                  ) : null}
                </div>
              ),
            },
            {
              key: 'editor',
              label: '正文编辑',
              children: (
                <div className={styles.pane}>
                  <div className={styles.editorWrap}>
                    <label className={styles.editorLabel}>正文（Markdown）</label>
                    <VditorEditor
                      initialValue={syncContent}
                      syncKey={syncKey}
                      onChange={setContent}
                      placeholder="请输入 Markdown 正文内容"
                    />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Form>
    );
  },
);

ArticleEditorForm.displayName = 'ArticleEditorForm';
