# 前端项目分析与新方案

## 1. 现有前端项目分析

### 1.1 项目结构与技术栈

**现有前端项目** (`/Users/mapengfei/narcissus-blog/apps/client`)：
- 基于 React + TypeScript + Vite
- 使用 Ant Design 组件库
- 使用 React Query 进行数据管理
- 使用 Zustand 进行状态管理
- 使用 Axios 进行 API 请求
- 依赖于 `@narcissus/shared` 包

### 1.2 API 客户端配置

现有前端项目的 API 客户端配置：
- 默认连接到 `http://localhost:3000/api`
- 期望后端返回格式：`{ code: number, message: string, data: T }`
- 实现了 JWT 认证，包括令牌刷新功能
- 对响应进行统一处理，检查 `code` 字段

### 1.3 Cloudflare Workers 后端分析

**Cloudflare Workers 后端** (`/Users/mapengfei/narcissus-blog/apps/cf-blog-server`)：
- 提供 RESTful API 接口
- 使用简化的 JWT 认证实现
- 直接返回数据，不包含 `code` 和 `message` 字段
- 没有实现令牌刷新功能
- 使用 Cloudflare KV 作为数据库
- 提供备份迁移功能

## 2. 复用现有前端项目的方案

### 2.1 方案选择

采用**复制现有前端项目并修改**的方案，这样可以：
- 保持 UI 与原有前端一致
- 复用现有的组件和页面结构
- 减少开发工作量
- 确保用户体验的一致性

### 2.2 需要修改的部分

1. **API 客户端配置**：
   - 修改 baseURL 指向 Cloudflare Workers 后端
   - 调整响应处理逻辑，适应直接返回数据的格式
   - 简化认证流程，移除令牌刷新功能

2. **认证机制**：
   - 调整登录逻辑，适应简化的 JWT 实现
   - 修改认证状态管理

3. **依赖管理**：
   - 使用 pnpm 作为包管理器
   - 确保依赖版本与现有项目一致

4. **部署配置**：
   - 配置 Cloudflare Pages 部署
   - 调整构建输出

## 3. 新前端项目方案

### 3.1 技术栈选择

| 技术 | 版本 | 用途 |
|------|------|------|
| React | ^18.3.1 | 前端框架 |
| TypeScript | ^5.7.2 | 类型系统 |
| Vite | ^6.0.5 | 构建工具 |
| Ant Design | ^5.23.4 | UI 组件库 |
| Axios | ^1.7.9 | HTTP 客户端 |
| Zustand | ^5.0.2 | 状态管理 |
| React Router | ^6.28.1 | 路由管理 |
| Day.js | ^1.11.13 | 日期处理 |
| React Markdown | ^9.0.3 | Markdown 渲染 |
| Vditor | ^3.11.2 | Markdown 编辑器 |

### 3.2 项目结构

```
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── constants/
│   ├── features/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── router/
│   ├── services/
│   │   └── api-client.ts
│   ├── stores/
│   │   └── auth-store.ts
│   ├── utils/
│   ├── app.tsx
│   └── main.tsx
├── .eslintrc.cjs
├── index.html
├── package.json
├── postcss.config.cjs
├── tsconfig.json
└── vite.config.ts
```

### 3.3 API 客户端设计

```typescript
// src/services/api-client.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787/api',
  timeout: 12000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  async (response) => {
    // 直接返回响应数据，不需要处理 code 字段
    return response;
  },
  async (error) => {
    const status = error.response?.status as number | undefined;

    if (status === 401) {
      // 清除认证状态
      useAuthStore.getState().clearAuth();
    }

    return Promise.reject(error);
  },
);

export function unwrapResponse<T>(response: { data: T }): T {
  return response.data;
}

export { apiClient };
```

### 3.4 认证流程设计

```typescript
// src/stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  user: { id: string; username: string } | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      login: async (username, password) => {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787/api'}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          throw new Error('登录失败');
        }

        const data = await response.json();
        set({
          accessToken: data.token,
          user: { id: '1', username },
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        });
      },
      clearAuth: () => {
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### 3.5 部署方案

1. **前端部署**：
   - 使用 Cloudflare Pages 托管前端静态文件
   - 配置自定义域名
   - 构建命令：`pnpm build`

2. **后端部署**：
   - 使用 Cloudflare Workers 部署后端服务
   - 配置 KV 命名空间
   - 设置环境变量

3. **CI/CD**：
   - 使用 GitHub Actions 自动部署
   - 前端构建后部署到 Cloudflare Pages
   - 后端构建后部署到 Cloudflare Workers

## 4. 实施计划

### 4.1 项目初始化
1. 创建新的前端项目目录 `apps/cf-blog-client`
2. 复制现有前端项目 `apps/client` 的所有文件到新目录
3. 修改 `package.json`，使用 pnpm 作为包管理器
4. 安装依赖

### 4.2 核心功能修改
1. 修改 API 客户端配置，适应 Cloudflare Workers 后端
2. 调整认证流程，移除令牌刷新功能
3. 修改响应处理逻辑，适应直接返回数据的格式
4. 测试所有 API 接口

### 4.3 部署配置
1. 配置 Cloudflare Pages 部署
2. 配置 Cloudflare Workers 部署
3. 测试部署流程

## 5. 结论

通过复制现有前端项目并进行必要的修改，我们可以快速构建一个与原有前端 UI 一致的新前端项目，同时确保与 Cloudflare Workers 后端的兼容性。这种方案既保持了用户体验的一致性，又减少了开发工作量，是一个高效且可靠的选择。