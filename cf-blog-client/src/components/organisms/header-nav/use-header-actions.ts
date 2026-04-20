import { useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

import { articlesService } from '@/features/articles/services/articles-service';

export function useHeaderActions() {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [isRandomLoading, setIsRandomLoading] = useState(false);

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  const openConsole = () => {
    setIsConsoleOpen(true);
  };

  const closeConsole = () => {
    setIsConsoleOpen(false);
  };

  const goSearchPage = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return;
    }

    setIsSearchOpen(false);
    navigate(`/search?keyword=${encodeURIComponent(trimmedValue)}`);
  };

  const goRandomPost = async () => {
    if (isRandomLoading) {
      return;
    }

    setIsRandomLoading(true);

    try {
      const result = await articlesService.getRandomPublicArticle();

      navigate(`/post/${result.slug}`);
    } catch {
      message.warning('暂时没有可跳转的已发布文章');
    } finally {
      setIsRandomLoading(false);
    }
  };

  return {
    isRandomLoading,
    isConsoleOpen,
    isSearchOpen,
    closeConsole,
    keyword,
    closeSearch,
    goRandomPost,
    goSearchPage,
    openConsole,
    openSearch,
    setKeyword,
  };
}
