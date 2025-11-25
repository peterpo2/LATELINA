import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Search } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const FAQ: React.FC = () => {
  const { t } = useLanguage();
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const faqItems = [
    {
      id: 1,
      question: t('faq.q1'),
      answer: t('faq.a1'),
      category: 'delivery'
    },
    {
      id: 2,
      question: t('faq.q2'),
      answer: t('faq.a2'),
      category: 'payment'
    },
    {
      id: 3,
      question: t('faq.q3'),
      answer: t('faq.a3'),
      category: 'prescription'
    },
    {
      id: 4,
      question: t('faq.q4'),
      answer: t('faq.a4'),
      category: 'ai'
    },
    {
      id: 5,
      question: t('faq.q5'),
      answer: t('faq.a5'),
      category: 'returns'
    },
    {
      id: 6,
      question: t('faq.q6'),
      answer: t('faq.a6'),
      category: 'account'
    },
    {
      id: 7,
      question: t('faq.q7'),
      answer: t('faq.a7'),
      category: 'delivery'
    },
    {
      id: 8,
      question: t('faq.q8'),
      answer: t('faq.a8'),
      category: 'general'
    }
  ];

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredItems = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('footer.faq')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            {t('faq.description')}
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('faq.searchPlaceholder')}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('faq.noResults')}</h3>
              <p className="text-gray-600">{t('faq.tryDifferent')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 pr-4">{item.question}</h3>
                    {openItems.includes(item.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openItems.includes(item.id) && (
                    <div className="px-6 pb-4 border-t border-gray-100">
                      <p className="text-gray-600 leading-relaxed pt-4">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="max-w-2xl mx-auto mt-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white text-center">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-bold mb-4">{t('faq.stillNeedHelp')}</h2>
          <p className="mb-6 opacity-90">{t('faq.contactSupport')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-xl transition-colors">
              {t('faq.callUs')}
            </button>
            <button className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
              {t('faq.emailUs')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;