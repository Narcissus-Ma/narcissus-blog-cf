import type { CreateUploadTicketRequest } from '@narcissus/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Table, Tag, message } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

import styles from './admin-media-page.module.css';

import { mediaService } from '@/features/media/services/media-service';

interface UploadTicketFormValues {
  filename: string;
  mimeType: string;
  size?: number;
}

function formatFileSize(size: number): string {
  if (!size) {
    return '0 B';
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

export function AdminMediaPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<UploadTicketFormValues>();

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-media-assets'],
    queryFn: mediaService.listAssets,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateUploadTicketRequest) => mediaService.createUploadTicket(payload),
    onSuccess: async (result) => {
      message.success(`上传票据创建成功：${result.url}`);
      await queryClient.invalidateQueries({ queryKey: ['admin-media-assets'] });
      setOpen(false);
      form.resetFields();
    },
    onError: () => {
      message.error('创建上传票据失败，请稍后重试');
    },
  });

  const removeMutation = useMutation({
    mutationFn: mediaService.removeAsset,
    onSuccess: async () => {
      message.success('资源删除成功');
      await queryClient.invalidateQueries({ queryKey: ['admin-media-assets'] });
    },
    onError: () => {
      message.error('资源删除失败');
    },
  });

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>媒体资源</h1>
          <p>当前使用上传票据占位流程，可继续对接真实 OSS/R2 上传。</p>
        </div>
        <Button
          type="primary"
          onClick={() => {
            form.resetFields();
            setOpen(true);
          }}
        >
          创建上传票据
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data}
        pagination={false}
        columns={[
          {
            title: '资源地址',
            dataIndex: 'url',
            render: (value: string) => (
              <a href={value} target="_blank" rel="noreferrer">
                {value}
              </a>
            ),
          },
          { title: 'Key', dataIndex: 'key', width: 260 },
          {
            title: '类型',
            dataIndex: 'mimeType',
            width: 140,
            render: (value: string) => <Tag>{value}</Tag>,
          },
          {
            title: '大小',
            dataIndex: 'size',
            width: 100,
            render: (value: number) => formatFileSize(value),
          },
          {
            title: '创建时间',
            dataIndex: 'createdAt',
            width: 170,
            render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
          },
          {
            title: '操作',
            width: 100,
            render: (_value, record: { id: string }) => (
              <Popconfirm
                title="确认删除该资源吗？"
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
            ),
          },
        ]}
      />

      <Modal
        title="创建上传票据"
        open={open}
        okText="创建"
        onCancel={() => {
          setOpen(false);
        }}
        onOk={() => {
          form.submit();
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            mimeType: 'image/webp',
          }}
          onFinish={(values) => {
            createMutation.mutate(values);
          }}
        >
          <Form.Item
            label="文件名"
            name="filename"
            rules={[{ required: true, message: '请输入文件名，例如 cover.webp' }]}
          >
            <Input placeholder="请输入文件名，例如 cover.webp" />
          </Form.Item>
          <Form.Item
            label="MIME 类型"
            name="mimeType"
            rules={[{ required: true, message: '请输入 MIME 类型，例如 image/webp' }]}
          >
            <Input placeholder="请输入 MIME 类型，例如 image/webp" />
          </Form.Item>
          <Form.Item label="文件大小（字节）" name="size">
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入文件大小（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
