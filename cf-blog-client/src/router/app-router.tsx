import { Navigate, Outlet, Route, HashRouter as Router, Routes } from 'react-router-dom';

import { AdminLayout } from '@/layouts/admin-layout/admin-layout';
import { BlogLayout } from '@/layouts/blog-layout/blog-layout';
import { AdminArticleCreatePage } from '@/pages/admin-article-create-page/admin-article-create-page';
import { AdminArticleEditPage } from '@/pages/admin-article-edit-page/admin-article-edit-page';
import { AdminArticlesPage } from '@/pages/admin-articles-page/admin-articles-page';
import { AdminCategoriesPage } from '@/pages/admin-categories-page/admin-categories-page';
import { AdminDashboardPage } from '@/pages/admin-dashboard-page/admin-dashboard-page';
import { AdminLoginPage } from '@/pages/admin-login-page/admin-login-page';
import { AdminSettingsPage } from '@/pages/admin-settings-page/admin-settings-page';
import { AdminTagsPage } from '@/pages/admin-tags-page/admin-tags-page';
import { ArchivesPage } from '@/pages/archives-page/archives-page';
import { CategoriesPage } from '@/pages/categories-page/categories-page';
import { CategoryDetailPage } from '@/pages/category-detail-page/category-detail-page';
import { HomePage } from '@/pages/home-page/home-page';
import { NotFoundPage } from '@/pages/not-found-page/not-found-page';
import { PostDetailPage } from '@/pages/post-detail-page/post-detail-page';
import { SearchPage } from '@/pages/search-page/search-page';
import { TagDetailPage } from '@/pages/tag-detail-page/tag-detail-page';
import { TagsPage } from '@/pages/tags-page/tags-page';
import { useAuthStore } from '@/stores/auth-store';

function RequireAuth() {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!accessToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

export function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/articles" element={<AdminArticlesPage />} />
            <Route path="/admin/articles/new" element={<AdminArticleCreatePage />} />
            <Route path="/admin/articles/:id/edit" element={<AdminArticleEditPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/tags" element={<AdminTagsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        <Route element={<BlogLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:slug" element={<PostDetailPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:slug" element={<CategoryDetailPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/tags/:slug" element={<TagDetailPage />} />
          <Route path="/archives" element={<ArchivesPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
