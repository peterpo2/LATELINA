import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { newsArticles as initialArticles } from '../data/news';
import { NewsArticle } from '../types';

export type CreateNewsArticleInput = Omit<NewsArticle, 'id'> & { id?: string };

interface NewsContextValue {
  news: NewsArticle[];
  addArticle: (article: CreateNewsArticleInput) => NewsArticle;
  deleteArticle: (id: string) => void;
}

const STORAGE_KEY = 'aipharm.news';

const sortArticles = (articles: NewsArticle[]): NewsArticle[] => {
  return articles
    .slice()
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
};

const loadInitialArticles = (): NewsArticle[] => {
  if (typeof window === 'undefined') {
    return sortArticles(initialArticles);
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as NewsArticle[];
      if (Array.isArray(parsed) && parsed.every((item) => typeof item?.id === 'string')) {
        return sortArticles(parsed);
      }
    }
  } catch (error) {
    console.warn('Unable to parse stored news articles', error);
  }

  return sortArticles(initialArticles);
};

const generateNewsId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto && typeof crypto.randomUUID === 'function') {
      return `news-${crypto.randomUUID()}`;
    }
  } catch {
    // Fallback to timestamp based identifier
  }

  return `news-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

const NewsContext = createContext<NewsContextValue | undefined>(undefined);

export const NewsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [news, setNews] = useState<NewsArticle[]>(() => loadInitialArticles());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(news));
    } catch (error) {
      console.warn('Unable to persist news articles', error);
    }
  }, [news]);

  const addArticle = useCallback((input: CreateNewsArticleInput) => {
    const article: NewsArticle = {
      ...input,
      id: input.id && input.id.trim().length > 0 ? input.id : generateNewsId(),
    };

    setNews((previous) => {
      const filtered = previous.filter((item) => item.id !== article.id);
      return sortArticles([article, ...filtered]);
    });

    return article;
  }, []);

  const deleteArticle = useCallback((id: string) => {
    setNews((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const value = useMemo<NewsContextValue>(
    () => ({ news, addArticle, deleteArticle }),
    [news, addArticle, deleteArticle]
  );

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
};

export const useNews = (): NewsContextValue => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider');
  }

  return context;
};
