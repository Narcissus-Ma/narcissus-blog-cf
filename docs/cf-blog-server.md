# Cloudflare 后端技术方案

## 1. 项目分析

### 1.1 现有项目结构

**Narcissus Blog 后端**：
- 基于 NestJS + Prisma + SQLite
- 包含文章、分类、标签、认证、媒体等功能
- 使用 JWT 进行认证
- 提供 RESTful API

**Cloudflare Workers Blog**：
- 运行在 Cloudflare Workers 上
- 使用 Cloudflare KV 作为数据库
- 使用 Cloudflare 缓存 HTML 来降低 KV 的读写
- 所有 HTML 页面均为缓存，可达到静态博客的速度
- 后台使用 markdown 语法
- 一键发布(页面重构+缓存清理)

### 1.2 可行性评估

| 功能 | 可行性 | 实现方案 |
|------|--------|----------|
| 数据存储 | 高 | 使用 Cloudflare KV 替代 SQLite |
| 认证 | 高 | 使用 Cloudflare Workers 环境变量存储密钥，实现 JWT 认证 |
| API 实现 | 高 | 使用 Cloudflare Workers 实现 RESTful API |
| 媒体资源 | 高 | 使用第三方链接，无需本地存储 |
| 备份迁移 | 高 | 实现数据导出/导入功能 |
| 部署和维护 | 高 | Cloudflare Workers 提供了方便的部署和管理工具 |

## 2. 技术方案

### 2.1 架构设计

```
┌─────────────────────┐
│ Cloudflare Workers  │
├─────────────────────┤
│     API 路由        │
├─────────────────────┤
│ 业务逻辑处理        │
├─────────────────────┤
│ Cloudflare KV (数据)│
└─────────────────────┘
```

### 2.2 数据模型迁移

#### 2.2.1 数据结构设计

| 实体 | KV 键前缀 | 结构 |
|------|-----------|------|
| 文章 | `article:` | `{id: string, title: string, content: string, contentText: string, link: string, createDate: string, updateDate: string, categoryId: string, tags: string[], viewCount: number}` |
| 分类 | `category:` | `{id: string, name: string, count: number}` |
| 标签 | `tag:` | `{id: string, name: string, count: number}` |
| 用户 | `user:` | `{id: string, username: string, password: string, role: string}` |
| 站点设置 | `system:setting` | `{siteName: string, siteDescription: string, ...}` |
| 索引 | `system:index` | `{articleList: string[], categoryList: string[], tagList: string[]}` |

#### 2.2.2 数据迁移方案

1. 从 SQLite 导出数据
2. 转换为 KV 兼容的格式
3. 使用 Cloudflare API 批量导入数据

### 2.3 API 实现

#### 2.3.1 路由设计

| 路径 | 方法 | 功能 |
|------|------|------|
| `/api/articles` | GET | 获取文章列表 |
| `/api/articles/:id` | GET | 获取文章详情 |
| `/api/articles` | POST | 创建文章 |
| `/api/articles/:id` | PUT | 更新文章 |
| `/api/articles/:id` | DELETE | 删除文章 |
| `/api/categories` | GET | 获取分类列表 |
| `/api/categories` | POST | 创建分类 |
| `/api/categories/:id` | PUT | 更新分类 |
| `/api/categories/:id` | DELETE | 删除分类 |
| `/api/tags` | GET | 获取标签列表 |
| `/api/tags` | POST | 创建标签 |
| `/api/tags/:id` | PUT | 更新标签 |
| `/api/tags/:id` | DELETE | 删除标签 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/refresh` | POST | 刷新令牌 |
| `/api/site-settings` | GET | 获取站点设置 |
| `/api/site-settings` | PUT | 更新站点设置 |
| `/api/backup/export` | GET | 导出数据备份 |
| `/api/backup/import` | POST | 导入数据备份 |

#### 2.3.2 实现示例

```javascript
// worker/script.js 核心逻辑示例
async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // API 路由处理
  if (path.startsWith('/api/')) {
    // 认证中间件
    if (!path.startsWith('/api/auth/') && !path.startsWith('/api/public/')) {
      const token = request.headers.get('Authorization')?.split(' ')[1];
      if (!token || !verifyToken(token)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 文章相关 API
    if (path.startsWith('/api/articles')) {
      return handleArticles(request, path, method);
    }

    // 分类相关 API
    if (path.startsWith('/api/categories')) {
      return handleCategories(request, path, method);
    }

    // 标签相关 API
    if (path.startsWith('/api/tags')) {
      return handleTags(request, path, method);
    }

    // 认证相关 API
    if (path.startsWith('/api/auth')) {
      return handleAuth(request, path, method);
    }

    // 站点设置相关 API
    if (path.startsWith('/api/site-settings')) {
      return handleSiteSettings(request, path, method);
    }

    // 备份迁移相关 API
    if (path.startsWith('/api/backup')) {
      return handleBackup(request, path, method);
    }
  }

  // 静态资源和前端页面
  return handleStatic(request);
}

// 处理文章相关请求
async function handleArticles(request, path, method) {
  const url = new URL(request.url);
  const id = path.split('/').pop();

  switch (method) {
    case 'GET':
      if (id && !isNaN(id)) {
        // 获取文章详情
        const article = await KV.get(`article:${id}`);
        return new Response(JSON.stringify(article), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        // 获取文章列表
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const articles = await getArticlesList(page, limit);
        return new Response(JSON.stringify(articles), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    case 'POST':
      // 创建文章
      const createData = await request.json();
      const newArticle = await createArticle(createData);
      return new Response(JSON.stringify(newArticle), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    case 'PUT':
      // 更新文章
      if (id && !isNaN(id)) {
        const updateData = await request.json();
        const updatedArticle = await updateArticle(id, updateData);
        return new Response(JSON.stringify(updatedArticle), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    case 'DELETE':
      // 删除文章
      if (id && !isNaN(id)) {
        await deleteArticle(id);
        return new Response(JSON.stringify({ message: 'Article deleted' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
  }
}

// 处理备份迁移相关请求
async function handleBackup(request, path, method) {
  switch (method) {
    case 'GET':
      if (path.endsWith('/export')) {
        // 导出数据备份
        const backupData = await exportData();
        return new Response(JSON.stringify(backupData), {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename="backup.json"'
          }
        });
      }
      break;
    case 'POST':
      if (path.endsWith('/import')) {
        // 导入数据备份
        const backupData = await request.json();
        await importData(backupData);
        return new Response(JSON.stringify({ message: 'Backup imported successfully' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      break;
  }
}

// 导出数据
async function exportData() {
  const backup = {
    articles: [],
    categories: [],
    tags: [],
    siteSettings: null,
    exportDate: new Date().toISOString()
  };

  // 导出文章
  const articleKeys = await KV.list({ prefix: 'article:' });
  for (const key of articleKeys.keys) {
    const article = await KV.get(key.name);
    if (article) {
      backup.articles.push(article);
    }
  }

  // 导出分类
  const categoryKeys = await KV.list({ prefix: 'category:' });
  for (const key of categoryKeys.keys) {
    const category = await KV.get(key.name);
    if (category) {
      backup.categories.push(category);
    }
  }

  // 导出标签
  const tagKeys = await KV.list({ prefix: 'tag:' });
  for (const key of tagKeys.keys) {
    const tag = await KV.get(key.name);
    if (tag) {
      backup.tags.push(tag);
    }
  }

  // 导出站点设置
  backup.siteSettings = await KV.get('system:setting');

  return backup;
}

// 导入数据
async function importData(backupData) {
  // 清空现有数据
  await clearAllData();

  // 导入文章
  for (const article of backupData.articles) {
    await KV.put(`article:${article.id}`, article);
  }

  // 导入分类
  for (const category of backupData.categories) {
    await KV.put(`category:${category.id}`, category);
  }

  // 导入标签
  for (const tag of backupData.tags) {
    await KV.put(`tag:${tag.id}`, tag);
  }

  // 导入站点设置
  if (backupData.siteSettings) {
    await KV.put('system:setting', backupData.siteSettings);
  }

  // 重建索引
  await rebuildIndexes();

  // 清除缓存
  await clearCache();
}

// 清空所有数据
async function clearAllData() {
  // 清空文章
  const articleKeys = await KV.list({ prefix: 'article:' });
  for (const key of articleKeys.keys) {
    await KV.delete(key.name);
  }

  // 清空分类
  const categoryKeys = await KV.list({ prefix: 'category:' });
  for (const key of categoryKeys.keys) {
    await KV.delete(key.name);
  }

  // 清空标签
  const tagKeys = await KV.list({ prefix: 'tag:' });
  for (const key of tagKeys.keys) {
    await KV.delete(key.name);
  }

  // 清空站点设置
  await KV.delete('system:setting');

  // 清空索引
  await KV.delete('system:index');
}

// 重建索引
async function rebuildIndexes() {
  const articleList = [];
  const categoryList = [];
  const tagList = [];

  // 重建文章索引
  const articleKeys = await KV.list({ prefix: 'article:' });
  for (const key of articleKeys.keys) {
    const article = await KV.get(key.name);
    if (article) {
      articleList.push(article.id);
    }
  }

  // 重建分类索引
  const categoryKeys = await KV.list({ prefix: 'category:' });
  for (const key of categoryKeys.keys) {
    const category = await KV.get(key.name);
    if (category) {
      categoryList.push(category.id);
    }
  }

  // 重建标签索引
  const tagKeys = await KV.list({ prefix: 'tag:' });
  for (const key of tagKeys.keys) {
    const tag = await KV.get(key.name);
    if (tag) {
      tagList.push(tag.id);
    }
  }

  // 保存索引
  await KV.put('system:index', {
    articleList,
    categoryList,
    tagList
  });
}

// 其他 API 处理函数...

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
```

### 2.4 认证方案

#### 2.4.1 JWT 实现

```javascript
// 生成 JWT 令牌
function generateToken(userId, username) {
  const payload = {
    sub: userId,
    username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 小时
  };
  
  // 使用 Cloudflare Workers 环境变量存储密钥
  const secret = SECRET_KEY;
  const token = jwt.sign(payload, secret);
  return token;
}

// 验证 JWT 令牌
function verifyToken(token) {
  try {
    const secret = SECRET_KEY;
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    return null;
  }
}
```

#### 2.4.2 环境变量配置

在 Cloudflare Workers 控制台中设置以下环境变量：
- `SECRET_KEY`: JWT 签名密钥
- `ADMIN_USERNAME`: 管理员用户名
- `ADMIN_PASSWORD`: 管理员密码（建议使用 bcrypt 加密）



### 2.6 缓存策略

#### 2.6.1 HTML 缓存

```javascript
// 缓存 HTML 页面
async function cacheHTML(key, html) {
  await KV.put(`cache:${key}`, html, {
    expirationTtl: 86400 // 24 小时
  });
}

// 获取缓存的 HTML 页面
async function getCachedHTML(key) {
  return await KV.get(`cache:${key}`);
}

// 清除缓存
async function clearCache() {
  // 清除所有缓存
  const keys = await KV.list({ prefix: 'cache:' });
  for (const key of keys.keys) {
    await KV.delete(key.name);
  }
}
```

#### 2.6.2 API 响应缓存

对于频繁访问的 API 端点（如文章列表、分类列表等），可以实现响应缓存：

```javascript
// 缓存 API 响应
async function cacheAPIResponse(key, data) {
  await KV.put(`api:${key}`, JSON.stringify(data), {
    expirationTtl: 3600 // 1 小时
  });
}

// 获取缓存的 API 响应
async function getCachedAPIResponse(key) {
  const cached = await KV.get(`api:${key}`);
  return cached ? JSON.parse(cached) : null;
}
```

## 3. 部署步骤

### 3.1 准备工作

1. 注册 Cloudflare 账号
2. 创建 Cloudflare Workers 服务
3. 创建 Cloudflare KV 命名空间
4. 创建 Cloudflare R2 存储桶
5. 安装 Wrangler CLI：`npm install -g wrangler`

### 3.2 配置文件

```toml
# wrangler.toml
name = "narcissus-blog"
type = "javascript"

account_id = "YOUR_ACCOUNT_ID"
workers_dev = true
env = "production"

kv_namespaces = [
  {
    binding = "KV",
    id = "YOUR_KV_NAMESPACE_ID",
    preview_id = "YOUR_KV_NAMESPACE_ID"
  }
]

vars = {
  SECRET_KEY = "YOUR_SECRET_KEY",
  ADMIN_USERNAME = "admin",
  ADMIN_PASSWORD = "YOUR_ENCRYPTED_PASSWORD"
}
```

### 3.3 部署命令

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 部署到 Cloudflare Workers
wrangler publish
```

## 4. 性能优化

### 4.1 缓存策略优化

- 静态资源（CSS、JS、图片）使用 Cloudflare 边缘缓存
- HTML 页面使用 KV 缓存，设置合理的过期时间
- API 响应使用 KV 缓存，减少重复计算

### 4.2 数据库操作优化

- 使用批量操作减少 KV 读写次数
- 合理设计 KV 键结构，提高查询效率
- 使用索引减少遍历操作

### 4.3 代码优化

- 最小化 Worker 脚本大小
- 使用 Webpack 等工具进行代码压缩
- 优化异步操作，减少等待时间

## 5. 限制和注意事项

### 5.1 Cloudflare Workers 限制

- 每日请求限制：免费计划 10 万次/日
- 脚本大小限制：1 MB
- 执行时间限制：10 秒
- 内存限制：128 MB

### 5.2 Cloudflare KV 限制

- 存储限制：免费计划 1 GB
- 写入限制：免费计划 100,000 次/日
- 读取限制：免费计划 1,000,000 次/日
- 键大小限制：512 字节
- 值大小限制：10 MB

### 5.3 注意事项

- 定期备份 KV 数据
- 监控 Workers 执行情况
- 合理设计缓存策略，避免缓存过期导致的性能问题
- 注意敏感信息的安全存储，避免硬编码在脚本中

## 6. 迁移计划

### 6.1 数据迁移

1. 从现有 SQLite 数据库导出数据
2. 转换数据格式为 KV 兼容的结构
3. 使用 Cloudflare API 批量导入数据
4. 验证数据完整性

### 6.2 前端适配

1. 更新前端 API 基础 URL
2. 确保前端与新 API 的兼容性
3. 测试所有功能是否正常

### 6.3 部署和切换

1. 部署 Cloudflare Workers 服务
2. 配置 DNS 记录指向 Cloudflare Workers
3. 监控服务运行情况
4. 逐步切换流量到新服务

## 7. 结论

使用 Cloudflare 作为后端服务是可行的，具有以下优势：

- **无服务器架构**：无需管理服务器，降低运维成本
- **全球边缘网络**：提供更快的访问速度
- **弹性扩展**：自动应对流量变化
- **低成本**：免费计划足以满足大多数个人博客需求
- **易于部署**：使用 Wrangler CLI 快速部署

同时，需要注意 Cloudflare 服务的限制，合理设计缓存策略和数据结构，以确保服务的稳定性和性能。

通过本技术方案，可以将 Narcissus Blog 后端迁移到 Cloudflare Workers 上，实现免服务器的博客系统，同时保持现有功能的完整性。