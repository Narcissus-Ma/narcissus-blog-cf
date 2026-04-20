import { Button, Space } from 'antd';

import styles from './admin-article-editor-header.module.css';

interface AdminArticleEditorHeaderProps {
  title: string;
  description: string;
  submitText: string;
  submitLoading?: boolean;
  previewUrl?: string;
  onBack: () => void;
  onSubmit: () => void;
}

export function AdminArticleEditorHeader({
  title,
  description,
  submitText,
  submitLoading,
  previewUrl,
  onBack,
  onSubmit,
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
        <Button type="primary" loading={submitLoading} onClick={onSubmit}>
          {submitText}
        </Button>
      </Space>
    </div>
  );
}
