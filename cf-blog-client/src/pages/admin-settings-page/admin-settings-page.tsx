import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { SiteSetting } from '@narcissus/shared';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Card, Checkbox, Form, Input, Space, message } from 'antd';
import { useEffect } from 'react';

import styles from './admin-settings-page.module.css';

import { siteService } from '@/features/site/services/site-service';

export function AdminSettingsPage() {
  const [form] = Form.useForm<SiteSetting>();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-site-setting'],
    queryFn: siteService.getAdminSiteSetting,
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    form.setFieldsValue(data);
  }, [data, form]);

  const updateMutation = useMutation({
    mutationFn: siteService.updateSiteSetting,
    onSuccess: () => {
      message.success('站点设置保存成功');
    },
    onError: () => {
      message.error('站点设置保存失败，请稍后重试');
    },
  });

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <h1>站点设置</h1>
        <p>维护站点基础信息、导航与推荐位配置。</p>
      </div>

      <Form
        form={form}
        layout="vertical"
        className={styles.form}
        onFinish={(values) => {
          updateMutation.mutate({
            siteName: values.siteName ?? '',
            siteDescription: values.siteDescription ?? '',
            navItems: values.navItems ?? [],
            recommendations: values.recommendations ?? [],
            defaultSeoTitle: values.defaultSeoTitle ?? '',
            defaultSeoDescription: values.defaultSeoDescription ?? '',
            defaultOgImage: values.defaultOgImage ?? '',
            popupNotice: {
              enabled: values.popupNotice?.enabled ?? false,
              title: values.popupNotice?.title ?? '通知',
              message: values.popupNotice?.message ?? '你好呀',
              ctaText: values.popupNotice?.ctaText ?? '查看更多',
              ctaLink: values.popupNotice?.ctaLink ?? '/about',
              homeOnly: values.popupNotice?.homeOnly ?? true,
            },
          });
        }}
      >
        <Card title="基础信息" loading={isLoading}>
          <div className={styles.grid2}>
            <Form.Item
              label="站点名称"
              name="siteName"
              rules={[{ required: true, message: '请输入站点名称' }]}
            >
              <Input placeholder="请输入站点名称" />
            </Form.Item>
            <Form.Item
              label="站点描述"
              name="siteDescription"
              rules={[{ required: true, message: '请输入站点描述' }]}
            >
              <Input placeholder="请输入站点描述" />
            </Form.Item>
            <Form.Item
              label="默认 SEO 标题"
              name="defaultSeoTitle"
              rules={[{ required: true, message: '请输入默认 SEO 标题' }]}
            >
              <Input placeholder="请输入默认 SEO 标题" />
            </Form.Item>
            <Form.Item
              label="默认 SEO 描述"
              name="defaultSeoDescription"
              rules={[{ required: true, message: '请输入默认 SEO 描述' }]}
            >
              <Input placeholder="请输入默认 SEO 描述" />
            </Form.Item>
          </div>
          <Form.Item label="默认 OG 图片" name="defaultOgImage">
            <Input placeholder="请输入默认 OG 图片地址" />
          </Form.Item>
        </Card>

        <Card title="导航菜单" loading={isLoading}>
          <Form.List name="navItems">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space key={field.key} className={styles.listRow} align="baseline">
                    <Form.Item
                      {...field}
                      label="菜单名称"
                      name={[field.name, 'name']}
                      rules={[{ required: true, message: '请输入菜单名称' }]}
                    >
                      <Input placeholder="请输入菜单名称" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      label="路径"
                      name={[field.name, 'path']}
                      rules={[{ required: true, message: '请输入路径' }]}
                    >
                      <Input placeholder="请输入路径，例如 /archives" />
                    </Form.Item>
                    <Button
                      icon={<MinusCircleOutlined />}
                      danger
                      onClick={() => {
                        remove(field.name);
                      }}
                    >
                      删除
                    </Button>
                  </Space>
                ))}
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => {
                    add({ name: '', path: '' });
                  }}
                >
                  新增菜单
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Card title="互动弹窗" loading={isLoading}>
          <div className={styles.grid2}>
            <Form.Item label="启用弹窗" name={['popupNotice', 'enabled']} valuePropName="checked">
              <Checkbox>开启首页提示</Checkbox>
            </Form.Item>
            <Form.Item label="仅首页展示" name={['popupNotice', 'homeOnly']} valuePropName="checked">
              <Checkbox>限制首页展示</Checkbox>
            </Form.Item>
            <Form.Item
              label="弹窗标题"
              name={['popupNotice', 'title']}
              rules={[{ required: true, message: '请输入弹窗标题' }]}
            >
              <Input placeholder="请输入弹窗标题" />
            </Form.Item>
            <Form.Item
              label="按钮文案"
              name={['popupNotice', 'ctaText']}
              rules={[{ required: true, message: '请输入按钮文案' }]}
            >
              <Input placeholder="请输入按钮文案" />
            </Form.Item>
          </div>
          <Form.Item
            label="弹窗内容"
            name={['popupNotice', 'message']}
            rules={[{ required: true, message: '请输入弹窗内容' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入弹窗内容" />
          </Form.Item>
          <Form.Item
            label="跳转链接"
            name={['popupNotice', 'ctaLink']}
            rules={[{ required: true, message: '请输入跳转链接' }]}
          >
            <Input placeholder="请输入跳转链接，例如 /about" />
          </Form.Item>
        </Card>

        <Card title="首页推荐位" loading={isLoading}>
          <Form.List name="recommendations">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space key={field.key} className={styles.listRow} align="baseline">
                    <Form.Item
                      {...field}
                      label="推荐标题"
                      name={[field.name, 'title']}
                      rules={[{ required: true, message: '请输入推荐标题' }]}
                    >
                      <Input placeholder="请输入推荐标题" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      label="文章 ID"
                      name={[field.name, 'articleId']}
                      rules={[{ required: true, message: '请输入文章 ID' }]}
                    >
                      <Input placeholder="请输入文章 ID" />
                    </Form.Item>
                    <Button
                      icon={<MinusCircleOutlined />}
                      danger
                      onClick={() => {
                        remove(field.name);
                      }}
                    >
                      删除
                    </Button>
                  </Space>
                ))}
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => {
                    add({ title: '', articleId: '' });
                  }}
                >
                  新增推荐位
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <div className={styles.actions}>
          <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
            保存设置
          </Button>
        </div>
      </Form>
    </section>
  );
}
