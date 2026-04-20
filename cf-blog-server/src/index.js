// Cloudflare Workers Blog Backend

// 全局配置
const OPT = {
  siteName: 'Narcissus Blog',
  recentlySize: 10,
};

// JWT 相关函数
function generateToken(userId, username, env) {
  const payload = {
    sub: userId,
    username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 小时
  };
  
  const secret = env.SECRET_KEY;
  const token = btoa(JSON.stringify(payload)) + '.' + btoa(secret);
  return token;
}

function verifyToken(token, env) {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    
    const payload = JSON.parse(atob(parts[0]));
    const secret = atob(parts[1]);
    
    if (secret !== env.SECRET_KEY) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    
    return payload;
  } catch (error) {
    return null;
  }
}

// 密码验证
function verifyPassword(password, env) {
  // 检查当前环境
  const isDevelopment = env.ENV === 'development' || env.NODE_ENV === 'development';
  
  // 开发环境中简化处理，直接使用 '123456' 作为密码
  if (isDevelopment) {
    return password === '123456';
  }
  
  // 生产环境中使用 ADMIN_PASSWORD 环境变量
  // 实际项目中应使用 bcrypt 进行哈希验证
  return password === env.ADMIN_PASSWORD;
}

// 生成唯一ID
function generateId() {
  return Date.now().toString() + Math.floor(Math.random() * 10000).toString();
}

function toSlug(value = '') {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// 缓存相关函数
async function cacheHTML(key, html, env) {
  await env.KV.put(`cache:${key}`, html, {
    expirationTtl: 86400 // 24 小时
  });
}

async function getCachedHTML(key, env) {
  return await env.KV.get(`cache:${key}`);
}

async function clearCache(env) {
  const keys = await env.KV.list({ prefix: 'cache:' });
  for (const key of keys.keys) {
    await env.KV.delete(key.name);
  }
}

async function cacheAPIResponse(key, data, env) {
  await env.KV.put(`api:${key}`, JSON.stringify(data), {
    expirationTtl: 3600 // 1 小时
  });
}

async function getCachedAPIResponse(key, env) {
  const cached = await env.KV.get(`api:${key}`);
  return cached ? JSON.parse(cached) : null;
}

// 文章相关函数
async function getArticlesList(page = 1, limit = 10, env) {
  const start = (page - 1) * limit;
  const end = start + limit;
  
  const index = await env.KV.get('system:index');
  if (!index || !index.articleList) {
    return [];
  }
  
  const articleIds = index.articleList.slice(start, end);
  const articles = [];
  
  for (const id of articleIds) {
    const article = await env.KV.get(`article:${id}`);
    if (article) {
      if (article.categoryId && (!article.categoryName || !article.categorySlug)) {
        const category = await env.KV.get(`category:${article.categoryId}`);
        if (category) {
          article.categoryName = category.name || article.categoryName;
          article.categorySlug = category.slug || article.categorySlug;
        }
      }
      article.tagIds = Array.isArray(article.tagIds)
        ? article.tagIds
        : Array.isArray(article.tagItems)
          ? article.tagItems.map((item) => item.id).filter(Boolean)
          : [];
      articles.push(article);
    }
  }
  
  return articles;
}

async function resolveCategoryMeta(categoryId, env) {
  if (!categoryId) {
    return {
      categoryName: '',
      categorySlug: '',
    };
  }

  const category = await env.KV.get(`category:${categoryId}`);
  if (!category) {
    return {
      categoryName: '',
      categorySlug: '',
    };
  }

  return {
    categoryName: category.name || '',
    categorySlug: category.slug || '',
  };
}

async function resolveTagMetaByIds(tagIds, env) {
  const safeTagIds = Array.isArray(tagIds) ? tagIds.filter(Boolean) : [];
  const tags = [];
  const tagItems = [];

  for (const id of safeTagIds) {
    const tag = await env.KV.get(`tag:${id}`);
    if (tag) {
      tags.push(tag.name || id);
      tagItems.push({
        id,
        name: tag.name || id,
        slug: tag.slug || toSlug(tag.name || id),
      });
    }
  }

  return {
    tagIds: safeTagIds,
    tags,
    tagItems,
  };
}

function normalizeArticleTagIds(article) {
  if (!article) {
    return article;
  }

  if (!Array.isArray(article.tagIds)) {
    article.tagIds = Array.isArray(article.tagItems)
      ? article.tagItems.map((item) => item.id).filter(Boolean)
      : [];
  }

  return article;
}

async function createArticle(data, env) {
  const id = generateId();
  const now = new Date().toISOString();
  const slug = data.slug || data.title.toLowerCase().replace(/\s+/g, '-');
  const categoryMeta = await resolveCategoryMeta(data.categoryId, env);
  const tagMeta = await resolveTagMetaByIds(data.tagIds, env);
  
  const article = {
    id,
    title: data.title,
    content: data.content,
    contentText: data.content.replace(/<[^>]+>/g, ''),
    slug,
    link: data.link || slug,
    createDate: now,
    updateDate: now,
    categoryId: data.categoryId,
    categoryName: data.categoryName || categoryMeta.categoryName,
    categorySlug: data.categorySlug || categoryMeta.categorySlug,
    tagIds: tagMeta.tagIds,
    tags: tagMeta.tags,
    tagItems: tagMeta.tagItems,
    viewCount: 0,
    status: data.status || 'draft',
    excerpt: data.excerpt || data.content.substring(0, 100) + '...'
  };
  
  await env.KV.put(`article:${id}`, article);
  await env.KV.put(`article:slug:${slug}`, article);
  await rebuildIndexes(env);
  await clearCache(env);
  
  return article;
}

async function updateArticle(id, data, env) {
  const article = await env.KV.get(`article:${id}`);
  if (!article) {
    return null;
  }
  const nextCategoryId = data.categoryId ?? article.categoryId;
  const categoryMeta = await resolveCategoryMeta(nextCategoryId, env);
  const nextTagIds = Array.isArray(data.tagIds)
    ? data.tagIds
    : Array.isArray(article.tagIds)
      ? article.tagIds
      : Array.isArray(article.tagItems)
        ? article.tagItems.map((item) => item.id).filter(Boolean)
        : [];
  const tagMeta = await resolveTagMetaByIds(nextTagIds, env);
  
  const updatedArticle = {
    ...article,
    ...data,
    tagIds: tagMeta.tagIds,
    tags: tagMeta.tags,
    tagItems: tagMeta.tagItems,
    categoryName: data.categoryName || categoryMeta.categoryName || article.categoryName,
    categorySlug: data.categorySlug || categoryMeta.categorySlug || article.categorySlug,
    excerpt: data.excerpt || article.excerpt || article.content.substring(0, 100) + '...',
    updateDate: new Date().toISOString()
  };
  
  await env.KV.put(`article:${id}`, updatedArticle);
  if (data.slug && data.slug !== article.slug) {
    await env.KV.delete(`article:slug:${article.slug}`);
    await env.KV.put(`article:slug:${data.slug}`, updatedArticle);
  }
  await rebuildIndexes(env);
  await clearCache(env);
  
  return updatedArticle;
}

async function deleteArticle(id, env) {
  await env.KV.delete(`article:${id}`);
  await rebuildIndexes(env);
  await clearCache(env);
}

async function buildTaxonomyArticleCountMap(env, index, options) {
  const includeDrafts = options?.includeDrafts ?? true;
  const resolveIds = options?.resolveIds || (() => []);
  const countMap = new Map();
  const articleIds = index?.articleList || [];

  for (const articleId of articleIds) {
    const article = await env.KV.get(`article:${articleId}`);
    if (!article) {
      continue;
    }

    if (!includeDrafts && article.status !== 'published') {
      continue;
    }

    const resolvedIds = resolveIds(article);
    const uniqueIds = new Set(Array.isArray(resolvedIds) ? resolvedIds.filter(Boolean) : []);
    for (const resolvedId of uniqueIds) {
      const currentCount = countMap.get(resolvedId) || 0;
      countMap.set(resolvedId, currentCount + 1);
    }
  }

  return countMap;
}

// 分类相关函数
async function getCategories(env, options = {}) {
  const includeDrafts = options.includeDrafts ?? true;
  const index = await env.KV.get('system:index');
  if (!index || !index.categoryList) {
    return [];
  }
  
  const categories = [];
  const categorySlugToIdMap = new Map();
  const categoryNameToIdMap = new Map();

  for (const id of index.categoryList) {
    const category = await env.KV.get(`category:${id}`);
    if (category) {
      const normalizedSlug = category.slug || toSlug(category.name || '');
      categorySlugToIdMap.set(normalizedSlug, id);
      if (category.name) {
        categoryNameToIdMap.set(category.name, id);
      }
      categories.push({
        ...category,
        slug: normalizedSlug,
        description: category.description || '',
        articleCount: 0,
      });
    }
  }

  const categoryIdCountMap = await buildTaxonomyArticleCountMap(env, index, {
    includeDrafts,
    resolveIds: (article) => {
      let targetCategoryId = article.categoryId;
      if (!targetCategoryId && article.categorySlug) {
        targetCategoryId = categorySlugToIdMap.get(article.categorySlug);
      }
      if (!targetCategoryId && article.categoryName) {
        targetCategoryId = categoryNameToIdMap.get(article.categoryName);
      }
      return targetCategoryId ? [targetCategoryId] : [];
    },
  });

  return categories.map((category) => ({
    ...category,
    articleCount: categoryIdCountMap.get(category.id) || 0,
  }));
}

async function createCategory(data, env) {
  const id = generateId();
  
  const category = {
    id,
    name: data.name,
    slug: data.slug || toSlug(data.name || ''),
    description: data.description || '',
    articleCount: 0
  };
  
  await env.KV.put(`category:${id}`, category);
  await rebuildIndexes(env);
  await clearCache(env);
  
  return category;
}

async function updateCategory(id, data, env) {
  const category = await env.KV.get(`category:${id}`);
  if (!category) {
    return null;
  }
  
  const updatedCategory = {
    ...category,
    ...data,
    slug: data.slug || category.slug || toSlug(data.name || category.name || ''),
    description: data.description ?? category.description ?? '',
    articleCount: category.articleCount ?? category.count ?? 0,
  };
  
  await env.KV.put(`category:${id}`, updatedCategory);
  await rebuildIndexes(env);
  await clearCache(env);
  
  return updatedCategory;
}

async function deleteCategory(id, env) {
  await env.KV.delete(`category:${id}`);
  await rebuildIndexes(env);
  await clearCache(env);
}

// 标签相关函数
async function getTags(env, options = {}) {
  const includeDrafts = options.includeDrafts ?? true;
  const index = await env.KV.get('system:index');
  if (!index || !index.tagList) {
    return [];
  }
  
  const tags = [];
  const tagSlugToIdMap = new Map();
  const tagNameToIdMap = new Map();

  for (const id of index.tagList) {
    const tag = await env.KV.get(`tag:${id}`);
    if (tag) {
      const normalizedSlug = tag.slug || toSlug(tag.name || '');
      tagSlugToIdMap.set(normalizedSlug, id);
      if (tag.name) {
        tagNameToIdMap.set(tag.name, id);
      }
      tags.push({
        ...tag,
        slug: normalizedSlug,
        articleCount: 0,
      });
    }
  }

  const tagIdCountMap = await buildTaxonomyArticleCountMap(env, index, {
    includeDrafts,
    resolveIds: (article) => {
      const tagIds = Array.isArray(article.tagIds)
        ? article.tagIds
        : Array.isArray(article.tagItems)
          ? article.tagItems.map((item) => item.id).filter(Boolean)
          : [];

      const tagNames = Array.isArray(article.tags) ? article.tags : [];
      const tagSlugs = Array.isArray(article.tagItems)
        ? article.tagItems.map((item) => item.slug).filter(Boolean)
        : [];

      const resolvedTagIds = [...tagIds];
      for (const tagSlug of tagSlugs) {
        const mappedId = tagSlugToIdMap.get(tagSlug);
        if (mappedId) {
          resolvedTagIds.push(mappedId);
        }
      }
      for (const tagName of tagNames) {
        const mappedId = tagNameToIdMap.get(tagName);
        if (mappedId) {
          resolvedTagIds.push(mappedId);
        }
      }

      return resolvedTagIds;
    },
  });

  return tags.map((tag) => ({
    ...tag,
    articleCount: tagIdCountMap.get(tag.id) || 0,
  }));
}

async function createTag(data, env) {
  const id = generateId();
  
  const tag = {
    id,
    name: data.name,
    slug: data.slug || toSlug(data.name || ''),
    articleCount: 0
  };
  
  await env.KV.put(`tag:${id}`, tag);
  await rebuildIndexes(env);
  await clearCache(env);
  
  return tag;
}

async function updateTag(id, data, env) {
  const tag = await env.KV.get(`tag:${id}`);
  if (!tag) {
    return null;
  }
  
  const updatedTag = {
    ...tag,
    ...data,
    slug: data.slug || tag.slug || toSlug(data.name || tag.name || ''),
    articleCount: tag.articleCount ?? tag.count ?? 0,
  };
  
  await env.KV.put(`tag:${id}`, updatedTag);
  await rebuildIndexes(env);
  await clearCache(env);
  
  return updatedTag;
}

async function deleteTag(id, env) {
  await env.KV.delete(`tag:${id}`);
  await rebuildIndexes(env);
  await clearCache(env);
}

// 站点设置相关函数
async function getSiteSettings(env) {
  const settings = await env.KV.get('system:setting');
  return settings || {
    siteName: OPT.siteName,
    siteDescription: 'A blog powered by Cloudflare Workers',
    footerText: '© 2026 Narcissus Blog',
    navItems: [
      { name: '隧道', path: '/archives' },
      { name: '分类', path: '/categories' },
      { name: '标签', path: '/tags' }
    ],
    popupNotice: {
      enabled: false,
      title: '通知',
      message: '你好呀',
      ctaText: '查看更多',
      ctaLink: '/about',
      homeOnly: true
    }
  };
}

async function updateSiteSettings(data, env) {
  const settings = await getSiteSettings(env);
  const updatedSettings = {
    ...settings,
    ...data
  };
  
  await env.KV.put('system:setting', updatedSettings);
  await clearCache(env);
  
  return updatedSettings;
}

// 备份迁移相关函数
async function exportData(env) {
  const backup = {
    articles: [],
    categories: [],
    tags: [],
    siteSettings: null,
    exportDate: new Date().toISOString()
  };

  const articleKeys = await env.KV.list({ prefix: 'article:' });
  for (const key of articleKeys.keys) {
    const article = await env.KV.get(key.name);
    if (article) {
      backup.articles.push(article);
    }
  }

  const categoryKeys = await env.KV.list({ prefix: 'category:' });
  for (const key of categoryKeys.keys) {
    const category = await env.KV.get(key.name);
    if (category) {
      backup.categories.push(category);
    }
  }

  const tagKeys = await env.KV.list({ prefix: 'tag:' });
  for (const key of tagKeys.keys) {
    const tag = await env.KV.get(key.name);
    if (tag) {
      backup.tags.push(tag);
    }
  }

  backup.siteSettings = await env.KV.get('system:setting');

  return backup;
}

async function importData(backupData, env) {
  await clearAllData(env);

  for (const article of backupData.articles) {
    await env.KV.put(`article:${article.id}`, article);
  }

  for (const category of backupData.categories) {
    await env.KV.put(`category:${category.id}`, category);
  }

  for (const tag of backupData.tags) {
    await env.KV.put(`tag:${tag.id}`, tag);
  }

  if (backupData.siteSettings) {
    await env.KV.put('system:setting', backupData.siteSettings);
  }

  await rebuildIndexes(env);
  await clearCache(env);
}

async function clearAllData(env) {
  const articleKeys = await env.KV.list({ prefix: 'article:' });
  for (const key of articleKeys.keys) {
    await env.KV.delete(key.name);
  }

  const categoryKeys = await env.KV.list({ prefix: 'category:' });
  for (const key of categoryKeys.keys) {
    await env.KV.delete(key.name);
  }

  const tagKeys = await env.KV.list({ prefix: 'tag:' });
  for (const key of tagKeys.keys) {
    await env.KV.delete(key.name);
  }

  await env.KV.delete('system:setting');
  await env.KV.delete('system:index');
}

async function rebuildIndexes(env) {
  const articleList = [];
  const categoryList = [];
  const tagList = [];

  const articleKeys = await env.KV.list({ prefix: 'article:' });
  for (const key of articleKeys.keys) {
    // 跳过 slug 索引键（article:slug:xxx）
    if (key.name.startsWith('article:slug:')) {
      continue;
    }
    const article = await env.KV.get(key.name);
    if (article) {
      articleList.push(article.id);
    }
  }

  const categoryKeys = await env.KV.list({ prefix: 'category:' });
  for (const key of categoryKeys.keys) {
    const category = await env.KV.get(key.name);
    if (category) {
      categoryList.push(category.id);
    }
  }

  const tagKeys = await env.KV.list({ prefix: 'tag:' });
  for (const key of tagKeys.keys) {
    const tag = await env.KV.get(key.name);
    if (tag) {
      tagList.push(tag.id);
    }
  }

  await env.KV.put('system:index', {
    articleList,
    categoryList,
    tagList
  });
}

// 内存存储，用于本地开发环境
const memoryStorage = new Map();

// 模拟 KV 存储
const mockKV = {
  get: async (key) => {
    const value = memoryStorage.get(key);
    return value ? JSON.parse(value) : null;
  },
  put: async (key, value) => {
    memoryStorage.set(key, JSON.stringify(value));
  },
  delete: async (key) => {
    memoryStorage.delete(key);
  },
  list: async (options) => {
    const prefix = options?.prefix || '';
    const keys = [];
    for (const key of memoryStorage.keys()) {
      if (key.startsWith(prefix)) {
        keys.push({ name: key });
      }
    }
    return { keys };
  }
};

function isProductionEnv(env) {
  const mode = String(env?.ENV || env?.NODE_ENV || 'development').toLowerCase();
  return mode === 'production';
}

function createKVAdapter(kvBinding) {
  if (!kvBinding || kvBinding === mockKV) {
    return kvBinding;
  }

  return {
    get: async (key) => {
      const rawValue = await kvBinding.get(key);

      if (rawValue === null || rawValue === undefined) {
        return null;
      }

      if (typeof rawValue !== 'string') {
        return rawValue;
      }

      try {
        return JSON.parse(rawValue);
      } catch {
        return rawValue;
      }
    },
    put: async (key, value, options) => {
      const normalizedValue = typeof value === 'string' ? value : JSON.stringify(value);
      return kvBinding.put(key, normalizedValue, options);
    },
    delete: async (key) => kvBinding.delete(key),
    list: async (options) => kvBinding.list(options),
  };
}

function resolveRuntimeEnv(env) {
  const runtimeEnv = {
    ...(env || {}),
    ENV: env?.ENV || 'development',
    NODE_ENV: env?.NODE_ENV || 'development',
    SECRET_KEY: env?.SECRET_KEY || 'test-secret-key',
    ADMIN_USERNAME: env?.ADMIN_USERNAME || 'admin',
    ADMIN_PASSWORD: env?.ADMIN_PASSWORD || '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    ALLOW_MOCK_KV: env?.ALLOW_MOCK_KV || 'false',
  };

  if (env?.KV) {
    runtimeEnv.KV = createKVAdapter(env.KV);
    return runtimeEnv;
  }

  if (isProductionEnv(runtimeEnv)) {
    throw new Error('生产环境缺少 KV 绑定（KV）。请检查 wrangler.toml 的 kv_namespaces 配置。');
  }

  if (String(runtimeEnv.ALLOW_MOCK_KV).toLowerCase() === 'true') {
    console.warn('[KV] 当前使用内存 mockKV（仅开发环境）。重启服务后数据会丢失。');
    runtimeEnv.KV = mockKV;
    return runtimeEnv;
  }

  throw new Error(
    '开发环境缺少 KV 绑定（KV）。请使用 wrangler dev 并配置 kv_namespaces；若仅临时调试可设置 ALLOW_MOCK_KV=true。',
  );
}

function resolveRawEnv(env) {
  if (env) {
    return env;
  }

  // 兼容 Service Worker 语法下的全局绑定读取
  return {
    KV: globalThis.KV,
    ENV: globalThis.ENV,
    NODE_ENV: globalThis.NODE_ENV,
    SECRET_KEY: globalThis.SECRET_KEY,
    ADMIN_USERNAME: globalThis.ADMIN_USERNAME,
    ADMIN_PASSWORD: globalThis.ADMIN_PASSWORD,
    ALLOW_MOCK_KV: globalThis.ALLOW_MOCK_KV,
  };
}

// 处理请求
async function handleRequest(request, env) {
  const rawEnv = resolveRawEnv(env);
  
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // 处理 OPTIONS 请求（CORS 预检）
  if (method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true'
      }
    });
  }

  const runtimeEnv = resolveRuntimeEnv(rawEnv);

  // API 路由处理
  if (path.startsWith('/api/')) {
    // 认证中间件
    // 博客主页相关的 GET 请求不需要鉴权
    const isPublicGetRequest = method === 'GET' && (
      path.startsWith('/api/articles') ||
      path.startsWith('/api/categories') ||
      path.startsWith('/api/tags') ||
      path.startsWith('/api/site-settings')
    );
    
    if (!path.startsWith('/api/auth/') && !path.startsWith('/api/public/') && !isPublicGetRequest) {
      const token = request.headers.get('Authorization')?.split(' ')[1];
      if (!token || !verifyToken(token, runtimeEnv)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true'
          }
        });
      }
    }

    // 文章相关 API
    if (path.startsWith('/api/articles')) {
      let response;
      if (path.startsWith('/api/articles/public')) {
        response = await handlePublicArticles(request, path, method, runtimeEnv);
      } else {
        response = await handleArticles(request, path, method, runtimeEnv);
      }
      // 添加 CORS 头部
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    // 分类相关 API
    if (path.startsWith('/api/categories')) {
      const response = await handleCategories(request, path, method, runtimeEnv);
      // 添加 CORS 头部
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    // 标签相关 API
    if (path.startsWith('/api/tags')) {
      const response = await handleTags(request, path, method, runtimeEnv);
      // 添加 CORS 头部
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    // 认证相关 API
    if (path.startsWith('/api/auth')) {
      const response = await handleAuth(request, path, method, runtimeEnv);
      // 添加 CORS 头部
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    // 站点设置相关 API
    if (path.startsWith('/api/site-settings')) {
      const response = await handleSiteSettings(request, path, method, runtimeEnv);
      // 添加 CORS 头部
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    // 备份迁移相关 API
    if (path.startsWith('/api/backup')) {
      const response = await handleBackup(request, path, method, runtimeEnv);
      // 添加 CORS 头部
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }
  }

  // 静态资源和前端页面
  const response = await handleStatic(request);
  // 添加 CORS 头部
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// 处理文章相关请求
async function handleArticles(request, path, method, env) {
  const url = new URL(request.url);
  const id = path.split('/').pop();

  switch (method) {
    case 'GET':
      if (id && !isNaN(id)) {
        const article = await env.KV.get(`article:${id}`);
        if (!article) {
          return new Response(JSON.stringify({ error: 'Article not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(normalizeArticleTagIds(article)), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const articles = await getArticlesList(page, limit, env);
        const index = await env.KV.get('system:index');
        const total = index?.articleList?.length || 0;
        return new Response(JSON.stringify({
          list: articles,
          total,
          page,
          pageSize: limit
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    case 'POST':
      const createData = await request.json();
      const newArticle = await createArticle(createData, env);
      return new Response(JSON.stringify(newArticle), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    case 'PUT':
    case 'PATCH':
      if (id && !isNaN(id)) {
        const updateData = await request.json();
        const updatedArticle = await updateArticle(id, updateData, env);
        if (!updatedArticle) {
          return new Response(JSON.stringify({ error: 'Article not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(updatedArticle), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    case 'DELETE':
      if (id && !isNaN(id)) {
        await deleteArticle(id, env);
        return new Response(JSON.stringify({ message: 'Article deleted' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
  }

  return new Response(JSON.stringify({ error: 'Invalid request' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}

// 处理公开文章相关请求
async function handlePublicArticles(request, path, method, env) {
  const url = new URL(request.url);
  const pathParts = path.split('/');
  // path: /api/articles/public/[slug]
  // pathParts: ['', 'api', 'articles', 'public', slug]
  const slug = pathParts[4];

  switch (method) {
    case 'GET':
      // 获取公开文章列表 /api/articles/public
      if (!slug) {
        const page = parseInt(url.searchParams.get('page') || '1');
        const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
        const categorySlug = url.searchParams.get('categorySlug') || '';
        const tagSlug = url.searchParams.get('tagSlug') || '';
        const articles = await getPublicArticlesList(page, pageSize, env, {
          categorySlug,
          tagSlug,
        });
        return new Response(JSON.stringify(articles), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      // 获取单个公开文章详情 /api/articles/public/:slug
      const article = await env.KV.get(`article:slug:${slug}`);
      if (!article) {
        return new Response(JSON.stringify({ error: 'Article not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify(normalizeArticleTagIds(article)), {
        headers: { 'Content-Type': 'application/json' }
      });
  }

  return new Response(JSON.stringify({ error: 'Invalid request' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}

// 获取公开文章列表
async function getPublicArticlesList(page = 1, limit = 10, env, options = {}) {
  const categorySlug = options.categorySlug || '';
  const tagSlug = options.tagSlug || '';
  const start = (page - 1) * limit;
  
  const index = await env.KV.get('system:index');
  if (!index || !index.articleList) {
    return { list: [], total: 0 };
  }
  
  const filteredArticles = [];
  
  for (const id of index.articleList) {
    const article = await env.KV.get(`article:${id}`);
    if (!article || article.status !== 'published') {
      continue;
    }

    if (categorySlug && article.categorySlug !== categorySlug) {
      continue;
    }

    if (tagSlug) {
      const articleTagSlugs = Array.isArray(article.tagItems)
        ? article.tagItems.map((item) => item.slug).filter(Boolean)
        : [];
      if (!articleTagSlugs.includes(tagSlug)) {
        continue;
      }
    }

    filteredArticles.push(article);
  }

  const total = filteredArticles.length;
  const articleList = filteredArticles.slice(start, start + limit);
  
  return {
    list: articleList,
    total,
    page,
    pageSize: limit
  };
}

// 处理分类相关请求
async function handleCategories(request, path, method, env) {
  const id = path.split('/').pop();
  const isPublicEndpoint = path.includes('/public');

  switch (method) {
    case 'GET':
      const categories = await getCategories(env, { includeDrafts: !isPublicEndpoint });
      return new Response(JSON.stringify(categories), {
        headers: { 'Content-Type': 'application/json' }
      });
    case 'POST':
      const createData = await request.json();
      const newCategory = await createCategory(createData, env);
      return new Response(JSON.stringify(newCategory), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    case 'PUT':
    case 'PATCH':
      if (id && !isNaN(id)) {
        const updateData = await request.json();
        const updatedCategory = await updateCategory(id, updateData, env);
        if (!updatedCategory) {
          return new Response(JSON.stringify({ error: 'Category not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(updatedCategory), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    case 'DELETE':
      if (id && !isNaN(id)) {
        await deleteCategory(id, env);
        return new Response(JSON.stringify({ message: 'Category deleted' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
  }

  return new Response(JSON.stringify({ error: 'Invalid request' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}

// 处理标签相关请求
async function handleTags(request, path, method, env) {
  const id = path.split('/').pop();
  const isPublicEndpoint = path.includes('/public');

  switch (method) {
    case 'GET':
      const tags = await getTags(env, { includeDrafts: !isPublicEndpoint });
      return new Response(JSON.stringify(tags), {
        headers: { 'Content-Type': 'application/json' }
      });
    case 'POST':
      const createData = await request.json();
      const newTag = await createTag(createData, env);
      return new Response(JSON.stringify(newTag), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    case 'PUT':
    case 'PATCH':
      if (id && !isNaN(id)) {
        const updateData = await request.json();
        const updatedTag = await updateTag(id, updateData, env);
        if (!updatedTag) {
          return new Response(JSON.stringify({ error: 'Tag not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(updatedTag), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    case 'DELETE':
      if (id && !isNaN(id)) {
        await deleteTag(id, env);
        return new Response(JSON.stringify({ message: 'Tag deleted' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
  }

  return new Response(JSON.stringify({ error: 'Invalid request' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}

// 处理认证相关请求
async function handleAuth(request, path, method, env) {
  if (path.endsWith('/login') && method === 'POST') {
    const loginData = await request.json();
    if (loginData.username === env.ADMIN_USERNAME && verifyPassword(loginData.password, env)) {
      const token = generateToken('1', env.ADMIN_USERNAME, env);
      return new Response(JSON.stringify({ token }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Invalid request' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}

// 处理站点设置相关请求
async function handleSiteSettings(request, path, method, env) {
  switch (method) {
    case 'GET':
      const settings = await getSiteSettings(env);
      return new Response(JSON.stringify(settings), {
        headers: { 'Content-Type': 'application/json' }
      });
    case 'PUT':
      const updateData = await request.json();
      const updatedSettings = await updateSiteSettings(updateData, env);
      return new Response(JSON.stringify(updatedSettings), {
        headers: { 'Content-Type': 'application/json' }
      });
  }

  return new Response(JSON.stringify({ error: 'Invalid request' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}

// 处理备份迁移相关请求
async function handleBackup(request, path, method, env) {
  switch (method) {
    case 'GET':
      if (path.endsWith('/export')) {
        const backupData = await exportData(env);
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
        const backupData = await request.json();
        await importData(backupData, env);
        return new Response(JSON.stringify({ message: 'Backup imported successfully' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      break;
  }

  return new Response(JSON.stringify({ error: 'Invalid request' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}

// 处理静态资源和前端页面
async function handleStatic(request) {
  // 这里可以处理静态资源和前端页面
  // 实际项目中，前端代码可以部署到 Cloudflare Pages 或其他静态托管服务
  return new Response('Cloudflare Workers Blog Backend', {
    headers: { 'Content-Type': 'text/plain' }
  });
}

// 注册 fetch 事件监听器
addEventListener('fetch', event => {
  event.respondWith(
    handleRequest(event.request, event.env).catch((error) => {
      const message = error instanceof Error ? error.message : 'Internal server error';
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
        },
      });
    }),
  );
});
