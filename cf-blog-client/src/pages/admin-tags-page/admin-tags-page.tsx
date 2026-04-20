import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Modal, Popconfirm, Space, Table, message } from 'antd';
import { useState } from 'react';

import styles from './admin-tags-page.module.css';

import { taxonomyService } from '@/features/taxonomy/services/taxonomy-service';

interface TagFormValues {
  name: string;
  slug: string;
}

interface EditingTag {
  id: string;
  name: string;
  slug: string;
}

export function AdminTagsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EditingTag | null>(null);
  const [form] = Form.useForm<TagFormValues>();

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: taxonomyService.getAdminTags,
  });

  const createMutation = useMutation({
    mutationFn: taxonomyService.createTag,
    onSuccess: async () => {
      message.success('标签创建成功');
      await queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      setOpen(false);
      form.resetFields();
    },
    onError: () => {
      message.error('标签创建失败，请检查名称或 slug 是否重复');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: TagFormValues }) =>
      taxonomyService.updateTag(id, values),
    onSuccess: async () => {
      message.success('标签更新成功');
      await queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      setOpen(false);
      setEditing(null);
      form.resetFields();
    },
    onError: () => {
      message.error('标签更新失败，请稍后重试');
    },
  });

  const removeMutation = useMutation({
    mutationFn: taxonomyService.removeTag,
    onSuccess: async () => {
      message.success('标签删除成功');
      await queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
    },
    onError: () => {
      message.error('标签删除失败，请确认该标签是否仍被引用');
    },
  });

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>标签管理</h1>
          <p>维护博客标签信息，支持新建、编辑与删除。</p>
        </div>
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        >
          新建标签
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data}
        pagination={false}
        columns={[
          { title: '标签名称', dataIndex: 'name', width: 220 },
          { title: 'Slug', dataIndex: 'slug' },
          { title: '文章数', dataIndex: 'articleCount', width: 100 },
          {
            title: '操作',
            width: 150,
            render: (_value, record: EditingTag) => (
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
                  title="确认删除该标签吗？"
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
        title={editing ? '编辑标签' : '新建标签'}
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
            label="标签名称"
            name="name"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>
          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: '请输入 slug，例如 ai-tools' }]}
          >
            <Input placeholder="请输入 slug，例如 ai-tools" />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
