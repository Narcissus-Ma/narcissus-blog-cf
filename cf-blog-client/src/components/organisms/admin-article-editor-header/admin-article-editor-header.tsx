import { Button, Space } from 'antd';

import styles from './admin-article-editor-header.module.css';

interface AdminArticleEditorHeaderProps {
  title: string;
  description: string;
  submitText: string;
  publishText?: string;
  submitLoading?: boolean;
  publishLoading?: boolean;
  previewUrl?: string;
  onBack: () => void;
  onSubmit: () => void;
  onPublish: () => void;
}

export function AdminArticleEditorHeader({
  title,
  description,
  submitText,
  publishText = '发布文章',
  submitLoading,
  publishLoading,
  previewUrl,
  onBack,
  onSubmit,
  onPublish,
}: AdminArticleEditorHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.meta}>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <Space>
        <Button onClick={onBack}>返回列表</Button>
        {previewUrl ? (
          <Button
            onClick={() => {
              window.open(previewUrl, '_blank');
            }}
          >
            预览文章
          </Button>
        ) : null}
        <Button loading={submitLoading} onClick={onSubmit}>
          {submitText}
        </Button>
        <Button type="primary" loading={publishLoading} onClick={onPublish}>
          {publishText}
        </Button>
      </Space>
    </div>
  );
}
