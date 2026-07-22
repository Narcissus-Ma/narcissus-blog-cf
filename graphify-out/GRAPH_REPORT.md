# Graph Report - .  (2026-07-22)

## Corpus Check
- Corpus is ~16,934 words - fits in a single context window. You may not need a graph.

## Summary
- 415 nodes · 653 edges · 24 communities (22 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.93)
- Token cost: 1,250 input · 3,020 output

## Community Hubs (Navigation)
- Auth Navigation Layout
- Worker API Backend
- Client Tooling Dependencies
- Server Build Dependencies
- React Runtime Dependencies
- Repository Architecture
- Client TypeScript Config
- Monorepo Tooling Config
- Article Editing UI
- Routing Admin Pages
- Shared TypeScript Config
- Home Page Components
- Public Article Features
- Client Scripts
- Taxonomy Admin UI
- Post Detail Feature
- API Services Settings
- Header Search UI
- Route Constants
- Worker Webpack Config

## God Nodes (most connected - your core abstractions)
1. `articlesService` - 14 edges
2. `clearCache()` - 12 edges
3. `handleRequest()` - 12 edges
4. `compilerOptions` - 12 edges
5. `useThemeStore` - 11 edges
6. `rebuildIndexes()` - 11 edges
7. `taxonomyService` - 10 edges
8. `useSiteStore` - 10 edges
9. `scripts` - 9 edges
10. `useAuthStore` - 9 edges

## Surprising Connections (you probably didn't know these)
- `cf-blog-client Workspace` --semantically_similar_to--> `cf-blog-client Package`  [INFERRED] [semantically similar]
  AGENTS.md → pnpm-workspace.yaml
- `cf-blog-server Workspace` --semantically_similar_to--> `cf-blog-server Package`  [INFERRED] [semantically similar]
  AGENTS.md → pnpm-workspace.yaml
- `Narcissus Blog HTML Entry` --conceptually_related_to--> `cf-blog-client Package`  [INFERRED]
  cf-blog-client/index.html → pnpm-workspace.yaml
- `RequireAuth()` --calls--> `useAuthStore`  [EXTRACTED]
  cf-blog-client/src/router/app-router.tsx → cf-blog-client/src/stores/auth-store.ts
- `App()` --calls--> `useThemeStore`  [EXTRACTED]
  cf-blog-client/src/app.tsx → cf-blog-client/src/stores/theme-store.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Repository Workspace Structure** — agents_monorepo_architecture, agents_cf_blog_client_workspace, agents_cf_blog_server_workspace, agents_docs_workspace [EXTRACTED 1.00]
- **Frontend Bootstrap Contract** — cf_blog_client_index_html_document, cf_blog_client_index_root_mount, cf_blog_client_index_main_tsx_entry [INFERRED 0.95]

## Communities (24 total, 2 thin omitted)

### Community 0 - "Auth Navigation Layout"
Cohesion: 0.06
Nodes (40): App(), ClickEffect(), ClickEffectProps, Particle, Loading(), UniverseEffect(), UniverseEffectProps, Footer() (+32 more)

### Community 1 - "Worker API Backend"
Cohesion: 0.09
Nodes (50): buildTaxonomyArticleCountMap(), clearAllData(), clearCache(), createArticle(), createCategory(), createKVAdapter(), createTag(), deleteArticle() (+42 more)

### Community 2 - "Client Tooling Dependencies"
Cohesion: 0.05
Nodes (41): autoprefixer, devDependencies, autoprefixer, eslint, eslint-config-prettier, eslint-plugin-import, eslint-plugin-react, eslint-plugin-react-hooks (+33 more)

### Community 3 - "Server Build Dependencies"
Cohesion: 0.07
Nodes (29): author, dependencies, @cloudflare/kv-asset-handler, jsonwebtoken, description, devDependencies, prettier, webpack (+21 more)

### Community 4 - "React Runtime Dependencies"
Cohesion: 0.08
Nodes (25): @ant-design/icons, antd, axios, dependencies, @ant-design/icons, antd, axios, dayjs (+17 more)

### Community 5 - "Repository Architecture"
Cohesion: 0.10
Nodes (21): Backend Manual Verification, Centralized API Authentication and Error Handling, cf-blog-client Workspace, cf-blog-server Workspace, Project Documentation, Environment-based API Configuration, Feature-grouped API Calls, Frontend Testing Strategy (+13 more)

### Community 6 - "Client TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, baseUrl, jsx, lib, module, moduleResolution, paths, target (+11 more)

### Community 7 - "Monorepo Tooling Config"
Cohesion: 0.10
Nodes (19): description, devDependencies, prettier, typescript, prettier, typescript, name, packageManager (+11 more)

### Community 8 - "Article Editing UI"
Cohesion: 0.17
Nodes (12): VditorEditor(), VditorEditorProps, AdminArticleEditorHeader(), AdminArticleEditorHeaderProps, ArticleEditorForm, ArticleEditorFormProps, ArticleEditorFormRef, ArticleEditorFormValues (+4 more)

### Community 9 - "Routing Admin Pages"
Cohesion: 0.16
Nodes (10): AdminArticlesPage(), AdminDashboardPage(), QUICK_LINKS, ArchivesPage(), CategoriesPage(), CategoryDetailPage(), NotFoundPage(), SearchPage() (+2 more)

### Community 10 - "Shared TypeScript Config"
Cohesion: 0.12
Nodes (15): compilerOptions, baseUrl, esModuleInterop, forceConsistentCasingInFileNames, jsx, lib, module, moduleResolution (+7 more)

### Community 11 - "Home Page Components"
Cohesion: 0.17
Nodes (10): CategoryBar(), CategoryBarItem, CategoryBarProps, PaginationBar(), PaginationBarProps, HeroBanner(), HeroBannerProps, SidebarPanel() (+2 more)

### Community 12 - "Public Article Features"
Cohesion: 0.23
Nodes (8): PostCard(), PostCardProps, mockArticle, AdminArticleDetail, ArticleQuery, ArticleRecommendation, articlesService, PublicSearchQuery

### Community 13 - "Client Scripts"
Cohesion: 0.14
Nodes (13): name, private, scripts, build, deploy, dev, lint, predeploy (+5 more)

### Community 14 - "Taxonomy Admin UI"
Cohesion: 0.18
Nodes (8): taxonomyService, AdminCategoriesPage(), CategoryFormValues, EditingCategory, AdminTagsPage(), EditingTag, TagFormValues, TagsPage()

### Community 15 - "Post Detail Feature"
Cohesion: 0.25
Nodes (8): extractToc(), formatDateTime(), PostDetailPage(), mockArticleDetail, mockGetPublicDetail, mockGetRecommendations, TocItem, toHeadingSlug()

### Community 16 - "API Services Settings"
Cohesion: 0.43
Nodes (4): siteService, AdminSettingsPage(), apiClient, unwrapResponse()

### Community 17 - "Header Search UI"
Cohesion: 0.50
Nodes (3): HeaderSearchModal(), HeaderSearchModalProps, mockSearchPublic

## Knowledge Gaps
- **158 isolated node(s):** `name`, `version`, `private`, `type`, `dev` (+153 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Client Tooling Dependencies` to `Client Scripts`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `dependencies` connect `React Runtime Dependencies` to `Client Scripts`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `articlesService` connect `Public Article Features` to `Auth Navigation Layout`, `Article Editing UI`, `Routing Admin Pages`, `Home Page Components`, `Post Detail Feature`, `Header Search UI`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _158 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth Navigation Layout` be split into smaller, more focused modules?**
  _Cohesion score 0.06093189964157706 - nodes in this community are weakly interconnected._
- **Should `Worker API Backend` be split into smaller, more focused modules?**
  _Cohesion score 0.09023569023569024 - nodes in this community are weakly interconnected._
- **Should `Client Tooling Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.04878048780487805 - nodes in this community are weakly interconnected._