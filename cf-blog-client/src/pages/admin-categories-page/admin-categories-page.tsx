import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Modal, Popconfirm, Space, Table, message } from 'antd';
import { useState } from 'react';

import styles from './admin-categories-page.module.css';

import { taxonomyService } from '@/features/taxonomy/services/taxonomy-service';

interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
}

interface EditingCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EditingCategory | null>(null);
  const [form] = Form.useForm<CategoryFormValues>();

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: taxonomyService.getAdminCategories,
  });

  const createMutation = useMutation({
    mutationFn: taxonomyService.createCategory,
    onSuccess: async () => {
      message.success('分类创建成功');
      await queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setOpen(false);
      form.resetFields();
    },
    onError: () => {
      message.error('分类创建失败，请检查名称或 slug 是否重复');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: CategoryFormValues }) =>
      taxonomyService.updateCategory(id, values),
    onSuccess: async () => {
      message.success('分类更新成功');
      await queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setOpen(false);
      setEditing(null);
      form.resetFields();
    },
    onError: () => {
      message.error('分类更新失败，请稍后重试');
    },
  });

  const removeMutation = useMutation({
    mutationFn: taxonomyService.removeCategory,
    onSuccess: async () => {
      message.success('分类删除成功');
      await queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: () => {
      message.error('分类删除失败，请确认该分类是否仍被引用');
    },
  });

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>分类管理</h1>
          <p>维护博客分类信息，支持新建、编辑与删除。</p>
        </div>
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        >
          新建分类
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data}
        pagination={false}
        columns={[
          { title: '分类名称', dataIndex: 'name', width: 180 },
          { title: 'Slug', dataIndex: 'slug', width: 200 },
          { title: '描述', dataIndex: 'description' },
          { title: '文章数', dataIndex: 'articleCount', width: 100 },
          {
            title: '操作',
            width: 150,
            render: (_value, record: EditingCategory) => (
              <Space>
                <Button
                  size="small"
                  onClick={() => {
                    setEditing(record);
                    form.setFieldsValue(record);
                    setOpen(true);
                  }}
                >
                  编辑
                </Button>
                <Popconfirm
                  title="确认删除该分类吗？"
                  okText="删除"
                  cancelText="取消"
                  onConfirm={() => {
                    removeMutation.mutate(record.id);
                  }}
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

      <Modal
        title={editing ? '编辑分类' : '新建分类'}
        open={open}
        okText="保存"
        onCancel={() => {
          setOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        onOk={() => {
          form.submit();
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            if (editing) {
              updateMutation.mutate({ id: editing.id, values });
              return;
            }

            createMutation.mutate(values);
          }}
        >
          <Form.Item
            label="分类名称"
            name="name"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: '请输入 slug，例如 frontend-dev' }]}
          >
            <Input placeholder="请输入 slug，例如 frontend-dev" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} placeholder="请输入分类描述（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
