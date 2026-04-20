import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Popconfirm, Space, Table, Tag, message } from 'antd';
import { useNavigate } from 'react-router-dom';

import styles from './admin-articles-page.module.css';

import { articlesService } from '@/features/articles/services/articles-service';

export function AdminArticlesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: () => articlesService.getAdminList({ page: 1, pageSize: 50 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => articlesService.remove(id),
    onSuccess: async () => {
      message.success('文章删除成功');
      await queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
    },
    onError: () => {
      message.error('删除失败');
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => articlesService.update(id, { status: 'draft' }),
    onSuccess: async () => {
      message.success('文章已取消发布');
      await queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
    },
    onError: () => {
      message.error('取消发布失败');
    },
  });

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>文章管理</h1>
          <span className={styles.subTitle}>维护博客文章内容与发布状态，新增在独立编辑页完成</span>
        </div>
        <Button type="primary" onClick={() => navigate('/admin/articles/new')}>
          新建文章
        </Button>
      </div>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.list ?? []}
        pagination={false}
        columns={[
          { title: '标题', dataIndex: 'title', width: 280 },
          { title: '分类', dataIndex: 'categoryName', width: 120 },
          {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            render: (status: 'draft' | 'published') =>
              status === 'published' ? (
                <Tag color="success">已发布</Tag>
              ) : (
                <Tag color="warning">草稿</Tag>
              ),
          },
          {
            title: '操作',
            width: 340,
            render: (_value, record: { id: string; slug: string; status: 'draft' | 'published' }) => (
              <Space>
                <Button size="small" onClick={() => navigate(`/admin/articles/${record.id}/edit`)}>
                  编辑
                </Button>
                <Button size="small" onClick={() => window.open(`/post/${record.slug}`, '_blank')}>
                  预览
                </Button>
                {record.status === 'published' ? (
                  <Popconfirm
                    title="确认取消发布该文章吗？"
                    okText="确认"
                    cancelText="取消"
                    onConfirm={() => unpublishMutation.mutate(record.id)}
                  >
                    <Button size="small" loading={unpublishMutation.isPending}>
                      取消发布
                    </Button>
                  </Popconfirm>
                ) : null}
                <Popconfirm
                  title="确认删除该文章吗？"
                  okText="删除"
                  cancelText="取消"
                  onConfirm={() => deleteMutation.mutate(record.id)}
                >
                  <Button danger size="small">
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
    </section>
  );
}
