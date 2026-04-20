import { Button, Form, Input, message } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './admin-login-page.module.css';

import { authService } from '@/features/authentication/services/auth-service';
import { useAuthStore } from '@/stores/auth-store';

interface LoginFormValues {
  username: string;
  password: string;
}

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      const result = await authService.login(values);
      setAuth(result);
      message.success('登录成功');
      navigate('/admin');
    } catch {
      message.error('登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h1>后台登录</h1>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Button block type="primary" htmlType="submit" loading={loading}>
            登录
          </Button>
        </Form>
      </div>
    </section>
  );
}
