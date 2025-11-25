import React, { useMemo, useState } from 'react';
import { Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useNews } from '../../context/NewsContext';

const News: React.FC = () => {
  const { language, t } = useLanguage();
  const { news } = useNews();
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);

  const articles = useMemo(
    () =>
      news.map((article) => ({
        ...article,
        title: language === 'bg' ? article.title : article.titleEn,
        excerpt: language === 'bg' ? article.excerpt : article.excerptEn,
        content: language === 'bg' ? article.content : article.contentEn,
        category: language === 'bg' ? article.category : article.categoryEn,
      })),
    [language, news]
  );

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(language === 'bg' ? 'bg-BG' : 'en-GB', {
      dateStyle: 'medium',
    }).format(date);
  };

  const toggleArticle = (id: string) => {
    setExpandedArticleId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-gray-50 py-12 min-h-screen">
      <div className="container mx-auto px-4 space-y-12">
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
            {t('news.latest')}
          </span>
          <h1 className="text-4xl font-bold text-gray-900">{t('news.title')}</h1>
          <p className="text-lg text-gray-600">{t('news.subtitle')}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {articles.map((article) => {
            const isExpanded = expandedArticleId === article.id;
            const paragraphs = article.content.split('\n\n');

            return (
              <article
                key={article.id}
                className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                      {article.category}
                    </span>
                    <span className="inline-flex items-center space-x-1 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {t('news.published')} {formatDate(article.publishedAt)}
                      </span>
                    </span>
                    <span className="inline-flex items-center space-x-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{t('news.readTime', { minutes: article.readTimeMinutes })}</span>
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900">{article.title}</h2>
                  <p className="text-sm text-gray-500">{t('news.authorBy')} {article.author}</p>

                  <p className="text-gray-700 leading-relaxed">{article.excerpt}</p>

                  {isExpanded && (
                    <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
                      {paragraphs.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleArticle(article.id)}
                    className="inline-flex items-center space-x-2 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                  >
                    <span>{isExpanded ? t('news.showLess') : t('news.readMore')}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default News;
