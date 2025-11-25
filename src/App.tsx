import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ChatBot from './components/ChatBot';
import { CartProvider } from './context/CartContext';
import { ChatProvider } from './context/ChatContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { NewsProvider } from './context/NewsContext';
import { FeatureToggleProvider, useFeatureToggles } from './context/FeatureToggleContext';
import { useProductCatalog, ProductCatalogProvider } from './context/ProductCatalogContext';
import HomePage from './components/pages/HomePage';
import ProductsPage from './components/pages/ProductsPage';
import CategoriesPage from './components/pages/CategoriesPage';
import Services from './components/pages/Services';
import AboutUs from './components/pages/AboutUs';
import Contacts from './components/pages/Contacts';
import Promotions from './components/pages/Promotions';
import News from './components/pages/News';
import FAQ from './components/pages/FAQ';
import AdminDashboard from './components/pages/AdminDashboard';
import ProductMoreInfoPage from './components/pages/ProductMoreInfoPage';

function AppContent() {
  const { prescriptionFeaturesEnabled } = useFeatureToggles();
  const { products, categories } = useProductCatalog();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (location.pathname === '/categories') {
      setSearchTerm('');
      setSelectedCategory(null);
    }
  }, [location.pathname]);

  // Filter products based on search and category
  const normalizedProducts = useMemo(() => {
    if (prescriptionFeaturesEnabled) {
      return products;
    }

    return products.filter((product) => !product.requiresPrescription);
  }, [prescriptionFeaturesEnabled, products]);

  const baseProducts = useMemo(() => {
    const source = normalizedProducts;

    if (searchTerm.trim()) {
      const query = searchTerm.trim().toLowerCase();
      return source.filter((product) => {
        const name = product.name.toLowerCase();
        const nameEn = product.nameEn?.toLowerCase() ?? '';
        const description = product.description?.toLowerCase() ?? '';
        const descriptionEn = product.descriptionEn?.toLowerCase() ?? '';
        return (
          name.includes(query) ||
          nameEn.includes(query) ||
          description.includes(query) ||
          descriptionEn.includes(query)
        );
      });
    }

    if (selectedCategory) {
      return source.filter((product) => product.categoryId === selectedCategory);
    }

    return source;
  }, [normalizedProducts, searchTerm, selectedCategory]);

  const filteredProducts = useMemo(() => {
    return baseProducts;
  }, [baseProducts]);

  const availableProducts = useMemo(() => {
    return normalizedProducts;
  }, [normalizedProducts]);

  const isDefaultView = !searchTerm.trim() && !selectedCategory;

  // Show hero only when no search or category is selected
  const showHero = isDefaultView;

  const handleNavigateToCategories = () => {
    setSearchTerm('');
    setSelectedCategory(null);

    if (location.pathname !== '/categories') {
      navigate('/categories');
    }
  };

  const handleNavigateToProducts = () => {
    setSelectedCategory(null);
    setSearchTerm('');

    if (location.pathname !== '/products') {
      navigate('/products');
    }
  };

  const handleNavigateToPromotions = () => {
    setSelectedCategory(null);
    setSearchTerm('');

    if (location.pathname !== '/promotions') {
      navigate('/promotions');
    }
  };

  const handleNavigateToNews = () => {
    setSelectedCategory(null);
    setSearchTerm('');

    if (location.pathname !== '/news') {
      navigate('/news');
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      setSelectedCategory(null);
      if (location.pathname !== '/' && location.pathname !== '/products') {
        navigate('/products');
      }
    } else {
      setSelectedCategory(null);
    }
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setSearchTerm('');
    if (categoryId && location.pathname !== '/products') {
      navigate('/products');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        onSearch={handleSearch}
        searchTerm={searchTerm}
        onNavigateToCategories={handleNavigateToCategories}
        onNavigateToProducts={handleNavigateToProducts}
        onNavigateToPromotions={handleNavigateToPromotions}
        onNavigateToNews={handleNavigateToNews}
      />
      <div className="flex-1">
        <Routes>
          <Route
            path="/"
            element={(
              <HomePage
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                filteredProducts={filteredProducts}
                categories={categories}
                showHero={showHero}
                allProducts={availableProducts}
              />
            )}
          />
          <Route
            path="/categories"
            element={(
              <CategoriesPage
                categories={categories}
                products={availableProducts}
                onCategorySelect={handleCategoryChange}
              />
            )}
          />
          <Route
            path="/products"
            element={(
              <ProductsPage
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                filteredProducts={filteredProducts}
                categories={categories}
                allProducts={availableProducts}
              />
            )}
          />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/news" element={<News />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/products/:productId/info" element={<ProductMoreInfoPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
      <CartDrawer />
      <ChatBot />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <FeatureToggleProvider>
          <ProductCatalogProvider>
            <CartProvider>
              <NewsProvider>
                <ChatProvider>
                  <AppContent />
                </ChatProvider>
              </NewsProvider>
            </CartProvider>
          </ProductCatalogProvider>
        </FeatureToggleProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
