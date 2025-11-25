import React, { ComponentType, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Ban,
  Calendar,
  CheckCircle2,
  Clock3,
  ClipboardList,
  FileText,
  Image,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Package,
  PackageCheck,
  Tag,
  PlusCircle,
  RefreshCw,
  Save,
  Search,
  Shield,
  Trash2,
  Truck,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNews } from '../../context/NewsContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { useFeatureToggles } from '../../context/FeatureToggleContext';
import type { NewsArticle, OrderStatus, PaymentMethod, Product, ProductPromotion } from '../../types';
import { generateNewsImage } from '../../utils/imageGenerator';

interface AdminPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'modal' | 'page';
}

interface ManagedUser {
  id: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  isAdmin: boolean;
  isStaff: boolean;
  isDeleted: boolean;
  canManageProducts?: boolean;
  createdAt: string;
}

interface EditableUserFields {
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  isAdmin: boolean;
  isStaff: boolean;
  isDeleted: boolean;
  canManageProducts: boolean;
}

type ToastState = { type: 'success' | 'error'; text: string } | null;

type AdminView = 'users' | 'orders' | 'news' | 'permissions' | 'products';

interface ManagedOrderItem {
  id: number;
  productId: number;
  productName: string;
  productDescription?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface ManagedOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus | number;
  paymentMethod: PaymentMethod | number;
  total: number;
  deliveryFee: number;
  grandTotal?: number;
  customerName?: string;
  customerEmail?: string;
  phoneNumber?: string;
  deliveryAddress?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userEmail?: string;
  userFullName?: string;
  items: ManagedOrderItem[];
}

type OrderStatusIcon = ComponentType<React.SVGProps<SVGSVGElement>>;

interface OrderStatusActionConfig {
  status: OrderStatus;
  label: string;
  icon: OrderStatusIcon;
  activeClass: string;
  idleClass: string;
  focusRing: string;
}

interface UsersApiResponse {
  success?: boolean;
  message?: string;
  users?: ManagedUser[];
}

interface UpdateUserApiResponse {
  success?: boolean;
  message?: string;
  user?: ManagedUser;
}

interface OrdersApiResponse {
  success?: boolean;
  message?: string;
  orders?: ManagedOrder[];
}

interface UpdateOrderStatusResponse {
  success?: boolean;
  message?: string;
  order?: ManagedOrder;
}

interface NewsFormState {
  id: string;
  title: string;
  titleEn: string;
  excerpt: string;
  excerptEn: string;
  content: string;
  contentEn: string;
  category: string;
  categoryEn: string;
  author: string;
  imageUrl: string;
  publishedAt: string;
  readTimeMinutes: string;
}

const mapArticleToFormState = (article: NewsArticle): NewsFormState => ({
  id: article.id,
  title: article.title,
  titleEn: article.titleEn,
  excerpt: article.excerpt,
  excerptEn: article.excerptEn,
  content: article.content,
  contentEn: article.contentEn,
  category: article.category,
  categoryEn: article.categoryEn,
  author: article.author,
  imageUrl: article.imageUrl,
  publishedAt: article.publishedAt,
  readTimeMinutes: article.readTimeMinutes.toString(),
});

const mapProductToFormState = (product: Product): ProductFormState => ({
  id: product.id,
  name: product.name,
  nameEn: product.nameEn ?? product.name,
  description: product.description ?? '',
  descriptionEn: product.descriptionEn ?? product.description ?? '',
  price: product.price.toString(),
  stockQuantity: product.stockQuantity.toString(),
  imageUrl: product.imageUrl,
  categoryId: product.categoryId.toString(),
  requiresPrescription: product.requiresPrescription,
  activeIngredient: product.activeIngredient ?? '',
  activeIngredientEn: product.activeIngredientEn ?? product.activeIngredient ?? '',
  dosage: product.dosage ?? '',
  dosageEn: product.dosageEn ?? product.dosage ?? '',
  manufacturer: product.manufacturer ?? '',
  manufacturerEn: product.manufacturerEn ?? product.manufacturer ?? '',
  hasPromotion: Boolean(product.promotion),
  promotionId: product.promotion?.id ?? '',
  promotionTitle: product.promotion?.title ?? '',
  promotionTitleEn: product.promotion?.titleEn ?? '',
  promotionDescription: product.promotion?.description ?? '',
  promotionDescriptionEn: product.promotion?.descriptionEn ?? '',
  promoPrice: product.promotion?.promoPrice ? product.promotion.promoPrice.toString() : '',
  discountPercentage: product.promotion?.discountPercentage
    ? product.promotion.discountPercentage.toString()
    : '',
  validUntil: product.promotion?.validUntil ?? '',
  badgeColor: product.promotion?.badgeColor ?? '',
});

const buildEmptyProductForm = (): ProductFormState => ({
  id: null,
  name: '',
  nameEn: '',
  description: '',
  descriptionEn: '',
  price: '',
  stockQuantity: '',
  imageUrl: '',
  categoryId: '',
  requiresPrescription: false,
  activeIngredient: '',
  activeIngredientEn: '',
  dosage: '',
  dosageEn: '',
  manufacturer: '',
  manufacturerEn: '',
  hasPromotion: false,
  promotionId: '',
  promotionTitle: '',
  promotionTitleEn: '',
  promotionDescription: '',
  promotionDescriptionEn: '',
  promoPrice: '',
  discountPercentage: '',
  validUntil: '',
  badgeColor: '',
});

const RAW_API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_URL_DOCKER ||
  'http://localhost:8080/api';

const API_BASE = RAW_API_BASE.replace(/\/+$/, '');

const buildUrl = (path: string) => `${API_BASE}/${path.replace(/^\/+/, '')}`;

const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const mapToEditable = (user: ManagedUser): EditableUserFields => ({
  email: user.email,
  fullName: user.fullName ?? '',
  phoneNumber: user.phoneNumber ?? '',
  address: user.address ?? '',
  isAdmin: user.isAdmin,
  isStaff: user.isStaff,
  isDeleted: user.isDeleted,
  canManageProducts: !!user.canManageProducts,
});

const normalizeOrderStatus = (status: OrderStatus | number): OrderStatus => {
  if (typeof status === 'number') {
    return ORDER_STATUSES[status] ?? 'Pending';
  }

  return ORDER_STATUSES.includes(status) ? status : 'Pending';
};

type PromotionBadgeColor = ProductPromotion['badgeColor'] | '';

interface ProductFormState {
  id: number | null;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: string;
  stockQuantity: string;
  imageUrl: string;
  categoryId: string;
  requiresPrescription: boolean;
  activeIngredient: string;
  activeIngredientEn: string;
  dosage: string;
  dosageEn: string;
  manufacturer: string;
  manufacturerEn: string;
  hasPromotion: boolean;
  promotionId: string;
  promotionTitle: string;
  promotionTitleEn: string;
  promotionDescription: string;
  promotionDescriptionEn: string;
  promoPrice: string;
  discountPercentage: string;
  validUntil: string;
  badgeColor: PromotionBadgeColor;
}

const PROMOTION_BADGE_COLORS: ProductPromotion['badgeColor'][] = [
  'emerald',
  'blue',
  'purple',
  'orange',
  'pink',
];

const resolveOrderStatusIndex = (status: OrderStatus | number): number => {
  if (typeof status === 'number') {
    return status;
  }

  const index = ORDER_STATUSES.indexOf(status);
  return index >= 0 ? index : 0;
};

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen = true,
  onClose,
  variant = 'modal',
}) => {
  const { isAdmin, user, isStaff: isStaffUser } = useAuth();
  const { t } = useLanguage();
  const { news, addArticle, deleteArticle } = useNews();
  const {
    products: catalogProducts,
    categories: catalogCategories,
    createProduct,
    updateProduct,
    deleteProduct: removeProductFromCatalog,
  } = useProductCatalog();
  const { prescriptionFeaturesEnabled, setPrescriptionFeaturesEnabled } = useFeatureToggles();
  const isModal = variant === 'modal';
  const canAccessAdmin = isAdmin || isStaffUser;
  const panelTitle = isAdmin ? t('admin.panel.title') : t('admin.panel.staffTitle');
  const panelSubtitle = isAdmin
    ? t('admin.panel.subtitle')
    : t('admin.panel.staffSubtitle');
  const panelDescription = isAdmin
    ? t('admin.panel.description')
    : t('admin.panel.staffDescription');
  const PanelIcon = isAdmin ? Shield : ClipboardList;
  const handlePrescriptionFeatureToggle = () => {
    setPrescriptionFeaturesEnabled(!prescriptionFeaturesEnabled);
  };
  const isPanelOpen = isModal ? isOpen : true;
  const canManageOrders = canAccessAdmin;
  const canManageUsers = canAccessAdmin;
  const canManageNews = canAccessAdmin;
  const canManagePermissions = isAdmin;
  const canViewProducts = canAccessAdmin;
  const canEditProducts = isAdmin || isStaffUser;
  const defaultAuthor = useMemo(
    () => (user?.fullName?.trim() || user?.email || '').trim(),
    [user?.email, user?.fullName]
  );
  const buildInitialNewsForm = useCallback((): NewsFormState => ({
    id: '',
    title: '',
    titleEn: '',
    excerpt: '',
    excerptEn: '',
    content: '',
    contentEn: '',
    category: '',
    categoryEn: '',
    author: defaultAuthor,
    imageUrl: '',
    publishedAt: new Date().toISOString().split('T')[0],
    readTimeMinutes: '4',
  }), [defaultAuthor]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditableUserFields | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const availableViews = useMemo(() => {
    const items: AdminView[] = [];
    if (canManageUsers) {
      items.push('users');
    }
    if (canManagePermissions) {
      items.push('permissions');
    }
    if (canManageOrders) {
      items.push('orders');
    }
    if (canViewProducts) {
      items.push('products');
    }
    if (canManageNews) {
      items.push('news');
    }
    return items.length ? items : ['orders'];
  }, [canManageNews, canManageOrders, canManagePermissions, canManageUsers, canViewProducts]);

  const [activeView, setActiveView] = useState<AdminView>(availableViews[0] ?? 'orders');
  const [orders, setOrders] = useState<ManagedOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [ordersToast, setOrdersToast] = useState<ToastState>(null);
  const [statusUpdates, setStatusUpdates] = useState<Record<string, OrderStatus | null>>({});
  const [newsForm, setNewsForm] = useState<NewsFormState>(() => buildInitialNewsForm());
  const [newsErrors, setNewsErrors] = useState<string[]>([]);
  const [newsToast, setNewsToast] = useState<ToastState>(null);
  const [newsSubmitting, setNewsSubmitting] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<NewsArticle | null>(null);
  const isEditingNews = editingArticleId !== null;
  const PAYMENT_METHODS: PaymentMethod[] = ['CashOnDelivery', 'Card', 'BankTransfer'];
  const [productForm, setProductForm] = useState<ProductFormState>(() => buildEmptyProductForm());
  const [productErrors, setProductErrors] = useState<string[]>([]);
  const [productToast, setProductToast] = useState<ToastState>(null);
  const [productSaving, setProductSaving] = useState(false);
  const [selectedCatalogProductId, setSelectedCatalogProductId] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isCreatingNewProduct, setIsCreatingNewProduct] = useState(false);

  useEffect(() => {
    if (!availableViews.includes(activeView)) {
      setActiveView(availableViews[0] ?? 'orders');
    }
  }, [activeView, availableViews]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!ordersToast) return;
    const timer = setTimeout(() => setOrdersToast(null), 3600);
    return () => clearTimeout(timer);
  }, [ordersToast]);

  useEffect(() => {
    if (!newsToast) {
      return;
    }

    const timer = setTimeout(() => setNewsToast(null), 3600);
    return () => clearTimeout(timer);
  }, [newsToast]);

  useEffect(() => {
    if (!productToast) {
      return;
    }

    const timer = setTimeout(() => setProductToast(null), 3600);
    return () => clearTimeout(timer);
  }, [productToast]);

  useEffect(() => {
    if (!isModal || !isPanelOpen || !onClose) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModal, isPanelOpen, onClose]);

  useEffect(() => {
    if (!isModal) {
      return;
    }

    if (isPanelOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isModal, isPanelOpen]);

  useEffect(() => {
    if (isPanelOpen) {
      return;
    }

    setOrdersToast(null);
    setStatusUpdates({});
    setNewsToast(null);
    setNewsErrors([]);
    setNewsSubmitting(false);
    setProductToast(null);
    setProductErrors([]);
    setProductSaving(false);
    setProductToDelete(null);
    setIsCreatingNewProduct(false);
  }, [isPanelOpen]);

  useEffect(() => {
    if (!defaultAuthor) {
      return;
    }

    setNewsForm((previous) => {
      if (previous.author.trim().length > 0) {
        return previous;
      }

      return { ...previous, author: defaultAuthor };
    });
  }, [defaultAuthor]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const token =
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (!token) {
      setError(t('admin.users.errors.noSession'));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(buildUrl('users'), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      let body: UsersApiResponse | null = null;
      try {
        body = (await response.json()) as UsersApiResponse;
      } catch {
        body = null;
      }

      if (!response.ok || !body?.success) {
        throw new Error(body?.message || t('admin.users.errors.fetchFailed'));
      }

      const items: ManagedUser[] = Array.isArray(body.users)
        ? body.users.map((entry) => ({
            ...entry,
            isStaff: !!entry.isStaff,
            canManageProducts: !!(entry as { canManageProducts?: boolean }).canManageProducts,
          }))
        : [];
      const filteredItems = !isAdmin && isStaffUser
        ? items.filter(
            (entry) => (!entry.isAdmin && !entry.isStaff) || entry.id === user?.id,
          )
        : items;
      setUsers(filteredItems);

      if (!filteredItems.length) {
        setSelectedUserId(null);
        setEditData(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('admin.users.errors.fetchFailed');
      setError(message);
      setUsers([]);
      setSelectedUserId(null);
      setEditData(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, isStaffUser, t, user?.id]);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    setOrdersToast(null);
    setStatusUpdates({});

    const token =
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (!token) {
      setOrdersError(t('admin.orders.errors.noSession'));
      setOrdersLoading(false);
      return;
    }

    try {
      const response = await fetch(buildUrl('orders'), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      let body: OrdersApiResponse | null = null;
      try {
        body = (await response.json()) as OrdersApiResponse;
      } catch {
        body = null;
      }

      if (!response.ok || !body?.success) {
        throw new Error(body?.message || t('admin.orders.errors.fetchFailed'));
      }

      const items: ManagedOrder[] = Array.isArray(body.orders) ? body.orders : [];
      setOrders(
        items.slice().sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : t('admin.orders.errors.fetchFailed');
      setOrdersError(message);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [t]);
  useEffect(() => {
    if (!isPanelOpen || !canManageUsers || (activeView !== 'users' && activeView !== 'permissions')) {
      return;
    }

    void fetchUsers();
  }, [activeView, canManageUsers, fetchUsers, isPanelOpen]);

  useEffect(() => {
    if (!isPanelOpen || !canManageOrders || activeView !== 'orders') {
      return;
    }

    void fetchOrders();
  }, [activeView, canManageOrders, fetchOrders, isPanelOpen]);

  const handleUpdateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      const token =
        localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      if (!token) {
        setOrdersToast({ type: 'error', text: t('admin.orders.errors.noSession') });
        return;
      }

      setStatusUpdates((prev) => ({ ...prev, [orderId]: status }));
      setOrdersToast(null);

      try {
        const response = await fetch(buildUrl(`orders/${orderId}/status`), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        });

        let body: UpdateOrderStatusResponse | null = null;
        try {
          body = (await response.json()) as UpdateOrderStatusResponse;
        } catch {
          body = null;
        }

        if (!response.ok || !body?.success || !body.order) {
          throw new Error(body?.message || t('admin.orders.errors.updateFailed'));
        }

        setOrders((prev) =>
          prev
            .map((item) => (item.id === orderId ? { ...item, ...body.order } : item))
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
        );
        setOrdersError(null);
        setOrdersToast({ type: 'success', text: t('admin.orders.status.updated') });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : t('admin.orders.errors.updateFailed');
        setOrdersToast({ type: 'error', text: message });
      } finally {
        setStatusUpdates((prev) => {
          const next = { ...prev };
          delete next[orderId];
          return next;
        });
      }
    },
    [t]
  );

  const handleNewsFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setNewsForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleGenerateNewsImage = () => {
    setNewsForm((previous) => {
      const titleSource = previous.titleEn.trim() || previous.title.trim() || t('admin.news.form.generatedTitleFallback');
      const categorySource =
        previous.categoryEn.trim() || previous.category.trim() || t('admin.news.form.generatedCategoryFallback');
      const generated = generateNewsImage(titleSource, categorySource);
      setNewsToast({ type: 'success', text: t('admin.news.messages.imageGenerated') });
      return { ...previous, imageUrl: generated };
    });
  };

  const handleResetNewsForm = useCallback(() => {
    if (editingArticleId) {
      const existingArticle = news.find((item) => item.id === editingArticleId);
      if (existingArticle) {
        setNewsForm(mapArticleToFormState(existingArticle));
      } else {
        setNewsForm(buildInitialNewsForm());
        setEditingArticleId(null);
      }
    } else {
      setNewsForm(buildInitialNewsForm());
    }

    setNewsErrors([]);
    setNewsToast(null);
    setArticleToDelete(null);
  }, [buildInitialNewsForm, editingArticleId, news]);

  const handleEditArticle = useCallback((article: NewsArticle) => {
    setEditingArticleId(article.id);
    setNewsForm(mapArticleToFormState(article));
    setNewsErrors([]);
    setNewsToast(null);
    setArticleToDelete(null);
  }, []);

  const handleNewsCardKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>, article: NewsArticle) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleEditArticle(article);
      }
    },
    [handleEditArticle]
  );

  const handleRequestDeleteArticle = useCallback((article: NewsArticle) => {
    setArticleToDelete(article);
  }, []);

  const handleCancelDeleteArticle = useCallback(() => {
    setArticleToDelete(null);
  }, []);

  const handleConfirmDeleteArticle = useCallback(() => {
    if (!articleToDelete) {
      return;
    }

    deleteArticle(articleToDelete.id);
    if (editingArticleId === articleToDelete.id) {
      setNewsForm(buildInitialNewsForm());
      setEditingArticleId(null);
    }

    setNewsErrors([]);
    setNewsToast({ type: 'success', text: t('admin.news.messages.deleted') });
    setArticleToDelete(null);
  }, [articleToDelete, buildInitialNewsForm, deleteArticle, editingArticleId, t]);

  const handleStartNewArticle = useCallback(() => {
    setEditingArticleId(null);
    setNewsForm(buildInitialNewsForm());
    setNewsErrors([]);
    setNewsToast(null);
    setArticleToDelete(null);
  }, [buildInitialNewsForm]);

  const handleSubmitNews = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newsSubmitting) {
      return;
    }

    setNewsErrors([]);
    setNewsToast(null);

    const trimmed = {
      id: newsForm.id.trim(),
      title: newsForm.title.trim(),
      titleEn: newsForm.titleEn.trim(),
      excerpt: newsForm.excerpt.trim(),
      excerptEn: newsForm.excerptEn.trim(),
      content: newsForm.content.trim(),
      contentEn: newsForm.contentEn.trim(),
      category: newsForm.category.trim(),
      categoryEn: newsForm.categoryEn.trim(),
      author: newsForm.author.trim(),
      imageUrl: newsForm.imageUrl.trim(),
      publishedAt: newsForm.publishedAt.trim(),
      readTimeMinutes: newsForm.readTimeMinutes.trim(),
    };

    const errors: string[] = [];

    if (!trimmed.title) errors.push(t('admin.news.errors.title'));
    if (!trimmed.titleEn) errors.push(t('admin.news.errors.titleEn'));
    if (!trimmed.excerpt) errors.push(t('admin.news.errors.excerpt'));
    if (!trimmed.excerptEn) errors.push(t('admin.news.errors.excerptEn'));
    if (!trimmed.content) errors.push(t('admin.news.errors.content'));
    if (!trimmed.contentEn) errors.push(t('admin.news.errors.contentEn'));
    if (!trimmed.category) errors.push(t('admin.news.errors.category'));
    if (!trimmed.categoryEn) errors.push(t('admin.news.errors.categoryEn'));
    if (!trimmed.author) errors.push(t('admin.news.errors.author'));
    if (!trimmed.imageUrl) errors.push(t('admin.news.errors.imageUrl'));

    let formattedDate = trimmed.publishedAt;
    if (!trimmed.publishedAt) {
      errors.push(t('admin.news.errors.publishedAt'));
    } else {
      const parsedDate = new Date(trimmed.publishedAt);
      if (Number.isNaN(parsedDate.getTime())) {
        errors.push(t('admin.news.errors.publishedAt'));
      } else {
        formattedDate = parsedDate.toISOString().split('T')[0];
      }
    }

    const readTime = Number.parseInt(trimmed.readTimeMinutes, 10);
    if (!Number.isFinite(readTime) || readTime < 1) {
      errors.push(t('admin.news.errors.readTime'));
    } else if (readTime > 60) {
      errors.push(t('admin.news.errors.readTimeRange'));
    }

    if (errors.length) {
      setNewsErrors(errors);
      setNewsToast({ type: 'error', text: t('admin.news.errors.general') });
      return;
    }

    setNewsSubmitting(true);

    try {
      const isUpdateAction = Boolean(
        editingArticleId || (trimmed.id ? news.some((article) => article.id === trimmed.id) : false)
      );
      const previousEditingId = editingArticleId;

      if (previousEditingId && (!trimmed.id || trimmed.id !== previousEditingId)) {
        deleteArticle(previousEditingId);
      }

      const savedArticle = addArticle({
        id: trimmed.id || undefined,
        title: trimmed.title,
        titleEn: trimmed.titleEn,
        excerpt: trimmed.excerpt,
        excerptEn: trimmed.excerptEn,
        content: trimmed.content,
        contentEn: trimmed.contentEn,
        category: trimmed.category,
        categoryEn: trimmed.categoryEn,
        author: trimmed.author,
        imageUrl: trimmed.imageUrl,
        publishedAt: formattedDate,
        readTimeMinutes: readTime,
      });

      setNewsErrors([]);
      setArticleToDelete(null);

      if (isUpdateAction) {
        setEditingArticleId(savedArticle.id);
        setNewsForm(mapArticleToFormState(savedArticle));
        setNewsToast({ type: 'success', text: t('admin.news.messages.updated') });
      } else {
        setEditingArticleId(null);
        setNewsForm(buildInitialNewsForm());
        setNewsToast({ type: 'success', text: t('admin.news.messages.created') });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('admin.news.errors.general');
      setNewsToast({ type: 'error', text: message });
    } finally {
      setNewsSubmitting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users
      .filter((item) => {
        if (!term) return true;
        const values = [item.email, item.fullName ?? '', item.phoneNumber ?? '', item.address ?? ''];
        return values.some((value) => value.toLowerCase().includes(term));
      })
      .sort((a, b) => {
        if (a.isDeleted === b.isDeleted) return a.email.localeCompare(b.email);
        return a.isDeleted ? 1 : -1;
      });
  }, [users, searchTerm]);

  const filteredCatalogProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    return [...catalogProducts]
      .filter((product) => {
        if (!term) {
          return true;
        }

        const values = [
          product.name,
          product.nameEn ?? '',
          product.activeIngredient ?? '',
          product.manufacturer ?? '',
          product.description ?? '',
          product.descriptionEn ?? '',
        ];

        return values.some((value) => value.toLowerCase().includes(term));
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [catalogProducts, productSearch]);

  const categoryById = useMemo(() => {
    const map = new Map<number, string>();
    catalogCategories.forEach((category) => {
      map.set(category.id, category.name);
    });
    return map;
  }, [catalogCategories]);

  const selectedCatalogProduct = useMemo(
    () =>
      selectedCatalogProductId
        ? catalogProducts.find((item) => item.id === selectedCatalogProductId) ?? null
        : null,
    [catalogProducts, selectedCatalogProductId],
  );

  const baselineProductForm = useMemo(
    () => (selectedCatalogProduct ? mapProductToFormState(selectedCatalogProduct) : buildEmptyProductForm()),
    [selectedCatalogProduct],
  );

  const hasProductChanges = useMemo(() => {
    if (!selectedCatalogProduct) {
      return true;
    }

    return JSON.stringify(productForm) !== JSON.stringify(baselineProductForm);
  }, [baselineProductForm, productForm, selectedCatalogProduct]);

  useEffect(() => {
    if (!isPanelOpen || (activeView !== 'users' && activeView !== 'permissions')) {
      return;
    }

    if (!filteredUsers.length) {
      setSelectedUserId(null);
      setEditData(null);
      return;
    }

    if (!selectedUserId || !filteredUsers.some((item) => item.id === selectedUserId)) {
      const firstUser = filteredUsers[0];
      setSelectedUserId(firstUser.id);
      setEditData(mapToEditable(firstUser));
    }
  }, [activeView, filteredUsers, isPanelOpen, selectedUserId]);

  useEffect(() => {
    if (!isPanelOpen || activeView !== 'products' || isCreatingNewProduct) {
      return;
    }

    if (!filteredCatalogProducts.length) {
      setSelectedCatalogProductId(null);
      setProductForm(buildEmptyProductForm());
      return;
    }

    if (
      !selectedCatalogProductId ||
      !filteredCatalogProducts.some((item) => item.id === selectedCatalogProductId)
    ) {
      const firstProduct = filteredCatalogProducts[0];
      setSelectedCatalogProductId(firstProduct.id);
      setProductForm(mapProductToFormState(firstProduct));
    }
  }, [
    activeView,
    filteredCatalogProducts,
    isCreatingNewProduct,
    isPanelOpen,
    selectedCatalogProductId,
  ]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isModal) {
      return;
    }

    event.stopPropagation();
    onClose?.();
  };

  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isModal) {
      return;
    }

    event.stopPropagation();
  };
  const handleSelectUser = (userItem: ManagedUser) => {
    setSelectedUserId(userItem.id);
    setEditData(mapToEditable(userItem));
    setToast(null);
  };

  const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editData) return;

    if (!isAdmin && !canEditSelectedUser) {
      return;
    }

    const { name, value, type, checked } = event.target;

    setEditData((prev) => {
      if (!prev) return prev;

      if (type === 'checkbox') {
        return { ...prev, [name]: checked };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleSelectCatalogProduct = (productItem: Product) => {
    setSelectedCatalogProductId(productItem.id);
    setProductForm(mapProductToFormState(productItem));
    setIsCreatingNewProduct(false);
    setProductErrors([]);
    setProductToast(null);
    setProductToDelete(null);
  };

  const handleStartNewProduct = () => {
    if (!canEditProducts) {
      return;
    }

    setSelectedCatalogProductId(null);
    setProductForm(buildEmptyProductForm());
    setIsCreatingNewProduct(true);
    setProductErrors([]);
    setProductToast(null);
    setProductToDelete(null);
  };

  const handleProductFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = event.target;

    if (type === 'checkbox' && name === 'hasPromotion') {
      const target = event.target as HTMLInputElement;
      setProductForm((previous) =>
        target.checked
          ? { ...previous, hasPromotion: true }
          : {
              ...previous,
              hasPromotion: false,
              promotionId: '',
              promotionTitle: '',
              promotionTitleEn: '',
              promotionDescription: '',
              promotionDescriptionEn: '',
              promoPrice: '',
              discountPercentage: '',
              validUntil: '',
              badgeColor: '',
            },
      );
      return;
    }

    if (type === 'checkbox') {
      const target = event.target as HTMLInputElement;
      setProductForm((previous) => ({ ...previous, [name]: target.checked }));
      return;
    }

    setProductForm((previous) => ({ ...previous, [name]: value }));
  };

  const resetProductChanges = () => {
    setProductErrors([]);
    setProductToast(null);

    if (selectedCatalogProduct) {
      setProductForm(mapProductToFormState(selectedCatalogProduct));
      return;
    }

    setProductForm(buildEmptyProductForm());
  };

  const selectedUser = selectedUserId
    ? users.find((item) => item.id === selectedUserId) ?? null
    : null;

  const canEditSelectedUser = useMemo(() => {
    if (!selectedUser) {
      return false;
    }

    if (isAdmin) {
      return true;
    }

    if (!isStaffUser) {
      return false;
    }

    if (selectedUser.isAdmin) {
      return false;
    }

    if (selectedUser.isStaff && selectedUser.id !== user?.id) {
      return false;
    }

    return true;
  }, [isAdmin, isStaffUser, selectedUser, user?.id]);

  const hasChanges = useMemo(() => {
    if (!editData || !selectedUser) return false;

    if (!isAdmin && !canEditSelectedUser) {
      return false;
    }

    const normalized = mapToEditable(selectedUser);
    return (
      normalized.email !== editData.email.trim() ||
      normalized.fullName !== editData.fullName ||
      normalized.phoneNumber !== editData.phoneNumber ||
      normalized.address !== editData.address ||
      normalized.isAdmin !== editData.isAdmin ||
      normalized.isStaff !== editData.isStaff ||
      normalized.isDeleted !== editData.isDeleted ||
      normalized.canManageProducts !== editData.canManageProducts
    );
  }, [canEditSelectedUser, editData, isAdmin, selectedUser]);

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString();
  };

  const orderStatusConfig = useMemo(
    () => [
      {
        label: t('orders.status.pending'),
        className: 'bg-amber-100 text-amber-700 border-amber-200',
      },
      {
        label: t('orders.status.confirmed'),
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      },
      {
        label: t('orders.status.processing'),
        className: 'bg-blue-100 text-blue-700 border-blue-200',
      },
      {
        label: t('orders.status.shipped'),
        className: 'bg-sky-100 text-sky-700 border-sky-200',
      },
      {
        label: t('orders.status.delivered'),
        className: 'bg-teal-100 text-teal-700 border-teal-200',
      },
      {
        label: t('orders.status.cancelled'),
        className: 'bg-rose-100 text-rose-700 border-rose-200',
      },
    ],
    [t]
  );

  const orderStatusActions = useMemo<OrderStatusActionConfig[]>(
    () => [
      {
        status: 'Pending',
        label: t('admin.orders.actions.pending'),
        icon: Clock3,
        activeClass: 'bg-amber-500 text-white shadow-sm',
        idleClass: 'border border-amber-200 text-amber-700 hover:bg-amber-50',
        focusRing: 'focus:ring-amber-100',
      },
      {
        status: 'Confirmed',
        label: t('admin.orders.actions.confirm'),
        icon: CheckCircle2,
        activeClass: 'bg-emerald-600 text-white shadow-sm',
        idleClass: 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50',
        focusRing: 'focus:ring-emerald-100',
      },
      {
        status: 'Processing',
        label: t('admin.orders.actions.process'),
        icon: ClipboardList,
        activeClass: 'bg-blue-600 text-white shadow-sm',
        idleClass: 'border border-blue-200 text-blue-700 hover:bg-blue-50',
        focusRing: 'focus:ring-blue-100',
      },
      {
        status: 'Shipped',
        label: t('admin.orders.actions.ship'),
        icon: Truck,
        activeClass: 'bg-sky-600 text-white shadow-sm',
        idleClass: 'border border-sky-200 text-sky-700 hover:bg-sky-50',
        focusRing: 'focus:ring-sky-100',
      },
      {
        status: 'Delivered',
        label: t('admin.orders.actions.deliver'),
        icon: PackageCheck,
        activeClass: 'bg-teal-600 text-white shadow-sm',
        idleClass: 'border border-teal-200 text-teal-700 hover:bg-teal-50',
        focusRing: 'focus:ring-teal-100',
      },
      {
        status: 'Cancelled',
        label: t('admin.orders.actions.cancel'),
        icon: Ban,
        activeClass: 'bg-rose-600 text-white shadow-sm',
        idleClass: 'border border-rose-200 text-rose-700 hover:bg-rose-50',
        focusRing: 'focus:ring-rose-100',
      },
    ],
    [t]
  );

  const resolveOrderStatus = (status: OrderStatus | number) =>
    orderStatusConfig[resolveOrderStatusIndex(status)] ?? orderStatusConfig[0];

  const resolvePaymentLabel = (value: PaymentMethod | number | undefined) => {
    const method =
      typeof value === 'number'
        ? PAYMENT_METHODS[value] ?? 'CashOnDelivery'
        : value ?? 'CashOnDelivery';
    switch (method) {
      case 'Card':
        return t('checkout.payment.card');
      case 'BankTransfer':
        return t('checkout.payment.bankTransfer');
      default:
        return t('checkout.payment.cashOnDelivery');
    }
  };

  const formatCurrency = (amount: number) => `€${amount.toFixed(2)}`;

  const resetChanges = () => {
    if (!selectedUser) return;
    setEditData(mapToEditable(selectedUser));
    setToast(null);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedUser || !editData || isSaving) {
      return;
    }

    if (!isAdmin && !canEditSelectedUser) {
      setToast({ type: 'error', text: t('admin.users.errors.staffForbidden') });
      return;
    }

    const token =
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (!token) {
      setToast({ type: 'error', text: t('admin.users.errors.noSession') });
      return;
    }

    setIsSaving(true);
    setToast(null);

    try {
      const payload: Record<string, unknown> = {
        email: editData.email.trim(),
        fullName: editData.fullName.trim(),
        phoneNumber: editData.phoneNumber.trim(),
        address: editData.address.trim(),
      };

      if (isAdmin) {
        Object.assign(payload, {
          isAdmin: editData.isAdmin,
          isStaff: editData.isStaff,
          isDeleted: editData.isDeleted,
          canManageProducts: editData.canManageProducts,
        });
      }

      const response = await fetch(buildUrl(`users/${selectedUser.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let body: UpdateUserApiResponse | null = null;
      try {
        body = (await response.json()) as UpdateUserApiResponse;
      } catch {
        body = null;
      }

      if (!response.ok || !body?.success) {
        throw new Error(body?.message || t('admin.users.errors.saveFailed'));
      }

      const updated = body.user;
      if (!updated) {
        throw new Error(body.message || t('admin.users.errors.saveFailed'));
      }
      const normalizedUpdated: ManagedUser = {
        ...updated,
        isStaff: !!updated.isStaff,
        canManageProducts: !!updated.canManageProducts,
      };
      setUsers((prev) =>
        prev.map((item) => (item.id === updated.id ? normalizedUpdated : item))
      );
      setEditData(mapToEditable(normalizedUpdated));
      setSelectedUserId(updated.id);
      setToast({ type: 'success', text: body.message || t('admin.users.saveSuccess') });
    } catch (err) {
      const message = err instanceof Error ? err.message : t('admin.users.errors.saveFailed');
      setToast({ type: 'error', text: message });
    } finally {
      setIsSaving(false);
    }
  };

  const requestProductDeletion = (productItem: Product) => {
    if (!canEditProducts) {
      return;
    }

    setProductToDelete(productItem);
    setProductToast(null);
  };

  const handleCancelDeleteProduct = () => {
    setProductToDelete(null);
  };

  const handleConfirmDeleteProduct = () => {
    if (!productToDelete) {
      return;
    }

    removeProductFromCatalog(productToDelete.id);
    setProductToast({ type: 'success', text: t('admin.products.messages.deleted') });
    setProductToDelete(null);
    setProductForm(buildEmptyProductForm());
    setSelectedCatalogProductId(null);
    setIsCreatingNewProduct(false);
    setProductErrors([]);
  };

  const handleProductSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEditProducts || productSaving) {
      return;
    }

    const errors: string[] = [];
    const name = productForm.name.trim();
    const nameEn = productForm.nameEn.trim();
    const description = productForm.description.trim();
    const descriptionEn = productForm.descriptionEn.trim();
    const imageUrl = productForm.imageUrl.trim();
    const activeIngredient = productForm.activeIngredient.trim();
    const activeIngredientEn = productForm.activeIngredientEn.trim();
    const dosage = productForm.dosage.trim();
    const dosageEn = productForm.dosageEn.trim();
    const manufacturer = productForm.manufacturer.trim();
    const manufacturerEn = productForm.manufacturerEn.trim();
    const categoryId = Number(productForm.categoryId);
    const price = Number(productForm.price);
    const stockQuantity = Number(productForm.stockQuantity);

    if (!name) errors.push(t('admin.products.errors.name'));
    if (!nameEn) errors.push(t('admin.products.errors.nameEn'));
    if (!Number.isFinite(price) || price <= 0) errors.push(t('admin.products.errors.price'));
    if (!Number.isFinite(stockQuantity) || stockQuantity < 0)
      errors.push(t('admin.products.errors.stock'));
    if (!Number.isInteger(categoryId) || categoryId <= 0)
      errors.push(t('admin.products.errors.category'));
    if (!imageUrl) errors.push(t('admin.products.errors.imageUrl'));

    let promotionPayload: ProductPromotion | null = null;
    if (productForm.hasPromotion) {
      const promotionTitle = productForm.promotionTitle.trim();
      const promotionTitleEn = productForm.promotionTitleEn.trim();
      const promotionDescription = productForm.promotionDescription.trim();
      const promotionDescriptionEn = productForm.promotionDescriptionEn.trim();
      const promoPrice = Number(productForm.promoPrice);

      if (!promotionTitle) errors.push(t('admin.products.errors.promotionTitle'));
      if (!promotionTitleEn) errors.push(t('admin.products.errors.promotionTitleEn'));
      if (!Number.isFinite(promoPrice) || promoPrice <= 0) {
        errors.push(t('admin.products.errors.promoPrice'));
      } else if (promoPrice >= price) {
        errors.push(t('admin.products.errors.promoPriceCompare'));
      }

      let discountValue: number | undefined;
      const discountText = productForm.discountPercentage.trim();
      if (discountText) {
        const parsed = Number(discountText);
        if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
          errors.push(t('admin.products.errors.discount'));
        } else {
          discountValue = parsed;
        }
      }

      const badgeColor = PROMOTION_BADGE_COLORS.includes(
        productForm.badgeColor as ProductPromotion['badgeColor'],
      )
        ? (productForm.badgeColor as ProductPromotion['badgeColor'])
        : undefined;

      promotionPayload = {
        id: productForm.promotionId.trim() || `promo-${Date.now()}`,
        title: promotionTitle,
        titleEn: promotionTitleEn || promotionTitle,
        description: promotionDescription,
        descriptionEn: promotionDescriptionEn || promotionDescription,
        promoPrice,
        discountPercentage: discountValue,
        validUntil: productForm.validUntil.trim() || undefined,
        badgeColor,
      };
    }

    if (errors.length) {
      setProductErrors(errors);
      setProductToast({ type: 'error', text: t('admin.products.errors.general') });
      return;
    }

    setProductErrors([]);
    setProductSaving(true);

    try {
      const payload = {
        name,
        nameEn: nameEn || name,
        description: description || undefined,
        descriptionEn: descriptionEn || description || undefined,
        price,
        stockQuantity,
        imageUrl,
        categoryId,
        requiresPrescription: productForm.requiresPrescription,
        activeIngredient: activeIngredient || undefined,
        activeIngredientEn: activeIngredientEn || activeIngredient || undefined,
        dosage: dosage || undefined,
        dosageEn: dosageEn || dosage || undefined,
        manufacturer: manufacturer || undefined,
        manufacturerEn: manufacturerEn || manufacturer || undefined,
        promotion: productForm.hasPromotion ? promotionPayload : null,
      };

      if (productForm.id) {
        const updated = updateProduct(productForm.id, payload);
        if (!updated) {
          throw new Error(t('admin.products.errors.general'));
        }
        setProductForm(mapProductToFormState(updated));
        setProductToast({ type: 'success', text: t('admin.products.messages.updated') });
        setSelectedCatalogProductId(updated.id);
        setIsCreatingNewProduct(false);
      } else {
        const created = createProduct(payload);
        setProductForm(mapProductToFormState(created));
        setProductToast({ type: 'success', text: t('admin.products.messages.created') });
        setSelectedCatalogProductId(created.id);
        setIsCreatingNewProduct(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('admin.products.errors.general');
      setProductToast({ type: 'error', text: message });
    } finally {
      setProductSaving(false);
    }
  };

  if (!canAccessAdmin || !isPanelOpen) {
    return null;
  }

  const renderUsersAndPermissionsView = (): JSX.Element | null => {
    if (activeView !== 'users' && activeView !== 'permissions') {
      return null;
    }

    return (
      <div className="grid min-h-[420px] divide-y border-b border-slate-100 md:grid-cols-[320px,1fr] md:divide-x md:divide-y-0">
        <div className="flex flex-col space-y-5 p-6">
          <div>
            <label className="text-sm font-medium text-slate-600" htmlFor="admin-user-search">
              {t('admin.users.searchLabel')}
            </label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="admin-user-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t('admin.users.searchPlaceholder')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : error ? (
              <div className="flex h-full flex-col items-center justify-center space-y-2 px-6 text-center text-sm text-rose-600">
                <Ban className="h-8 w-8" />
                <p>{error}</p>
                <button
                  onClick={fetchUsers}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  {t('admin.users.retry')}
                </button>
              </div>
            ) : filteredUsers.length ? (
              <div className="max-h-[60vh] space-y-2 overflow-y-auto p-3">
                {filteredUsers.map((item) => {
                  const isActive = item.id === selectedUserId;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectUser(item)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        isActive
                          ? 'border-emerald-300 bg-white shadow-md shadow-emerald-100'
                          : 'border-transparent bg-white hover:border-emerald-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {item.fullName?.trim() || t('admin.users.unknownName')}
                          </p>
                          <p className="mt-1 flex items-center space-x-2 text-xs text-slate-500">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span className="break-all">{item.email}</span>
                          </p>
                        </div>
                        <div className="space-y-1 text-right">
                          <div className="space-y-1">
                            {item.isAdmin && (
                              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                                <Shield className="mr-1 h-3 w-3" />
                                {t('admin.users.badges.admin')}
                              </span>
                            )}
                            {item.isStaff && !item.isAdmin && (
                              <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                                <ClipboardList className="mr-1 h-3 w-3" />
                                {t('admin.users.badges.staff')}
                              </span>
                            )}
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              item.isDeleted
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {item.isDeleted
                              ? t('admin.users.badges.deactivated')
                              : t('admin.users.badges.active')}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center space-y-2 px-6 text-center text-sm text-slate-500">
                <User className="h-8 w-8 text-slate-400" />
                <p>{t('admin.users.empty')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 p-6">
          {activeView === 'permissions' && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    {t('admin.features.sectionTitle')}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-emerald-900">
                    {t('admin.features.prescriptionTitle')}
                  </p>
                  <p className="mt-1 text-sm text-emerald-900/80">
                    {t('admin.features.prescriptionDescription')}
                  </p>
                  <p className="mt-2 text-xs font-medium text-emerald-700">
                    {prescriptionFeaturesEnabled
                      ? t('admin.features.prescriptionStatusEnabled')
                      : t('admin.features.prescriptionStatusDisabled')}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={prescriptionFeaturesEnabled}
                  onClick={handlePrescriptionFeatureToggle}
                  className={`relative inline-flex h-10 w-20 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 ${
                    prescriptionFeaturesEnabled ? 'bg-emerald-500' : 'bg-emerald-200'
                  }`}
                >
                  <span className="sr-only">{t('admin.features.prescriptionToggle')}</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                      prescriptionFeaturesEnabled ? 'translate-x-10' : 'translate-x-0'
                    }`}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold uppercase text-white">
                    {prescriptionFeaturesEnabled
                      ? t('admin.features.prescriptionEnabled')
                      : t('admin.features.prescriptionDisabled')}
                  </span>
                </button>
              </div>
            </div>
          )}
          {selectedUser && editData ? (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {editData.fullName.trim() || t('admin.users.unknownName')}
                  </h3>
                  <p className="text-sm text-slate-500">{editData.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {t('admin.users.memberSince').replace('{date}', formatDate(selectedUser.createdAt))}
                  </span>
                  {selectedUser.isAdmin && (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      <Shield className="mr-1 h-3.5 w-3.5" />
                      {t('admin.users.badges.admin')}
                    </span>
                  )}
                  {selectedUser.isStaff && !selectedUser.isAdmin && (
                    <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                      <ClipboardList className="mr-1 h-3.5 w-3.5" />
                      {t('admin.users.badges.staff')}
                    </span>
                  )}
                </div>
              </div>

              {toast && (
                <div
                  className={`flex items-start space-x-2 rounded-2xl border px-4 py-3 text-sm ${
                    toast.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-rose-200 bg-rose-50 text-rose-700'
                  }`}
                >
                  {toast.type === 'success' ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4" />
                  ) : (
                    <Ban className="mt-0.5 h-4 w-4" />
                  )}
                  <span>{toast.text}</span>
                </div>
              )}

              {!isAdmin && selectedUser && !canEditSelectedUser && (
                <div className="flex items-start space-x-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <AlertCircle className="mt-0.5 h-4 w-4" />
                  <span>{t('admin.users.restrictedNotice')}</span>
                </div>
              )}

              {activeView === 'users' ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="admin-edit-email">
                      {t('admin.users.fields.email')}
                    </label>
                    <input
                      id="admin-edit-email"
                      name="email"
                      type="email"
                      required
                      value={editData.email}
                      onChange={handleFieldChange}
                      disabled={isSaving || (!isAdmin && !canEditSelectedUser)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="admin-edit-fullName">
                      {t('admin.users.fields.fullName')}
                    </label>
                    <input
                      id="admin-edit-fullName"
                      name="fullName"
                      value={editData.fullName}
                      onChange={handleFieldChange}
                      maxLength={150}
                      placeholder={t('admin.users.fields.fullNamePlaceholder')}
                      disabled={isSaving || (!isAdmin && !canEditSelectedUser)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="admin-edit-phone">
                      {t('admin.users.fields.phone')}
                    </label>
                    <input
                      id="admin-edit-phone"
                      name="phoneNumber"
                      value={editData.phoneNumber}
                      onChange={handleFieldChange}
                      maxLength={30}
                      placeholder={t('admin.users.fields.phonePlaceholder')}
                      disabled={isSaving || (!isAdmin && !canEditSelectedUser)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="admin-edit-address">
                      {t('admin.users.fields.address')}
                    </label>
                    <input
                      id="admin-edit-address"
                      name="address"
                      value={editData.address}
                      onChange={handleFieldChange}
                      maxLength={250}
                      placeholder={t('admin.users.fields.addressPlaceholder')}
                      disabled={isSaving || (!isAdmin && !canEditSelectedUser)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-sm text-emerald-700">
                      {t('admin.permissions.instructions')}
                    </p>
                  </div>
                  <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t('admin.permissions.sectionTitle')}
                    </label>
                    <label className="flex items-center space-x-3 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        name="isAdmin"
                        checked={editData.isAdmin}
                        onChange={handleFieldChange}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{t('admin.permissions.admin')}</span>
                    </label>
                  <label className="flex items-center space-x-3 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      name="isStaff"
                      checked={editData.isStaff}
                      onChange={handleFieldChange}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span>{t('admin.permissions.staff')}</span>
                  </label>
                  <label className="flex items-center space-x-3 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      name="canManageProducts"
                      checked={editData.canManageProducts}
                      onChange={handleFieldChange}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{t('admin.permissions.manageProducts')}</span>
                  </label>
                  <label className="flex items-center space-x-3 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      name="isDeleted"
                        checked={editData.isDeleted}
                        onChange={handleFieldChange}
                        className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                      />
                      <span>{t('admin.permissions.deactivate')}</span>
                    </label>
                    {user?.id === selectedUser.id && (
                      <p className="text-xs text-amber-600">
                        {t('admin.users.permissions.selfWarning')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={resetChanges}
                  disabled={!hasChanges || isSaving}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('admin.users.actions.reset')}
                </button>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={fetchUsers}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t('admin.users.actions.refresh')}
                  </button>
                  <button
                    type="submit"
                    disabled={!hasChanges || isSaving}
                    className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>
                          {activeView === 'permissions'
                            ? t('admin.permissions.saving')
                            : t('admin.users.actions.saving')}
                        </span>
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        <span>
                          {activeView === 'permissions'
                            ? t('admin.permissions.save')
                            : t('admin.users.actions.save')}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex h-full flex-col items-center justify-center space-y-3 text-center">
              <User className="h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-500">{t('admin.users.noSelection')}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProductsView = (): JSX.Element | null => {
    if (activeView !== 'products') {
      return null;
    }

    const productCount = catalogProducts.length;
    const formTitle =
      isCreatingNewProduct || !productForm.id
        ? t('admin.products.form.createTitle')
        : t('admin.products.form.editTitle');
    const formSubtitle =
      isCreatingNewProduct || !productForm.id
        ? t('admin.products.form.createSubtitle')
        : t('admin.products.form.editSubtitle');

    return (
      <div className="space-y-6 border-b border-slate-100 p-6 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{t('admin.products.title')}</h3>
            <p className="text-sm text-slate-500">{t('admin.products.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {t('admin.products.count', { count: productCount })}
            </span>
            <button
              type="button"
              onClick={handleStartNewProduct}
              disabled={!canEditProducts}
              className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PlusCircle className="mr-1 h-4 w-4" />
              {t('admin.products.actions.new')}
            </button>
          </div>
        </div>

        {productToast && (
          <div
            className={`flex items-start space-x-2 rounded-2xl border px-4 py-3 text-sm ${
              productToast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {productToast.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4" />
            )}
            <span>{productToast.text}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600" htmlFor="admin-product-search">
                {t('admin.products.searchLabel')}
              </label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="admin-product-search"
                  type="search"
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder={t('admin.products.searchPlaceholder')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div className="relative max-h-[75vh] overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 lg:max-h-[80vh]">
              {filteredCatalogProducts.length ? (
                <div className="space-y-2 overflow-y-auto p-3">
                  {filteredCatalogProducts.map((product) => {
                    const isSelected = product.id === selectedCatalogProductId && !isCreatingNewProduct;
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleSelectCatalogProduct(product)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                          isSelected
                            ? 'border-emerald-300 bg-white shadow-md shadow-emerald-100'
                            : 'border-transparent bg-white hover:border-emerald-200 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                            <p className="mt-1 flex items-center space-x-2 text-xs text-slate-500">
                              <Package className="h-3.5 w-3.5 text-slate-400" />
                              <span>
                                {categoryById.get(product.categoryId) ||
                                  t('admin.products.unknownCategory')}
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-emerald-600">
                              €{(product.promotion?.promoPrice ?? product.price).toFixed(2)}
                            </p>
                            {product.promotion && (
                              <span className="mt-1 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                <Tag className="mr-1 h-3 w-3" />
                                {t('admin.products.labels.promo')}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-48 flex-col items-center justify-center space-y-2 px-6 text-center text-sm text-slate-500">
                  <Package className="h-8 w-8 text-slate-300" />
                  <p>{t('admin.products.empty')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-base font-semibold text-slate-900">{formTitle}</h4>
              <p className="text-sm text-slate-500">{formSubtitle}</p>
              {!canEditProducts && (
                <p className="mt-3 flex items-center space-x-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Shield className="h-3.5 w-3.5 text-slate-400" />
                  <span>{t('admin.products.readOnlyNotice')}</span>
                </p>
              )}
            </div>

            {productErrors.length > 0 && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                <p className="font-semibold">{t('admin.products.errors.listTitle')}</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  {productErrors.map((error, index) => (
                    <li key={`${error}-${index}`}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="space-y-6">
              <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div>
                  <h5 className="text-sm font-semibold text-slate-800">
                    {t('admin.products.form.section.details')}
                  </h5>
                  <p className="text-xs text-slate-500">
                    {t('admin.products.form.section.detailsSubtitle')}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-name">
                      {t('admin.products.form.fields.nameBg')}
                    </label>
                    <input
                      id="admin-product-name"
                      name="name"
                      type="text"
                      value={productForm.name}
                      onChange={handleProductFieldChange}
                      disabled={!canEditProducts || productSaving}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-name-en">
                      {t('admin.products.form.fields.nameEn')}
                    </label>
                    <input
                      id="admin-product-name-en"
                      name="nameEn"
                      type="text"
                      value={productForm.nameEn}
                      onChange={handleProductFieldChange}
                      disabled={!canEditProducts || productSaving}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-description">
                      {t('admin.products.form.fields.descriptionBg')}
                    </label>
                    <textarea
                      id="admin-product-description"
                      name="description"
                      value={productForm.description}
                      onChange={handleProductFieldChange}
                      disabled={!canEditProducts || productSaving}
                      className="h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-description-en">
                      {t('admin.products.form.fields.descriptionEn')}
                    </label>
                    <textarea
                      id="admin-product-description-en"
                      name="descriptionEn"
                      value={productForm.descriptionEn}
                      onChange={handleProductFieldChange}
                      disabled={!canEditProducts || productSaving}
                      className="h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-price">
                      {t('admin.products.form.fields.price')}
                    </label>
                    <input
                      id="admin-product-price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={productForm.price}
                      onChange={handleProductFieldChange}
                      disabled={!canEditProducts || productSaving}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-stock">
                      {t('admin.products.form.fields.stock')}
                    </label>
                    <input
                      id="admin-product-stock"
                      name="stockQuantity"
                      type="number"
                      min="0"
                      value={productForm.stockQuantity}
                      onChange={handleProductFieldChange}
                      disabled={!canEditProducts || productSaving}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-category">
                      {t('admin.products.form.fields.category')}
                    </label>
                    <select
                      id="admin-product-category"
                      name="categoryId"
                      value={productForm.categoryId}
                      onChange={handleProductFieldChange}
                      disabled={!canEditProducts || productSaving}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">{t('admin.products.form.fields.categoryPlaceholder')}</option>
                      {catalogCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-image">
                      {t('admin.products.form.fields.imageUrl')}
                    </label>
                    <input
                      id="admin-product-image"
                      name="imageUrl"
                      type="url"
                      value={productForm.imageUrl}
                      onChange={handleProductFieldChange}
                      disabled={!canEditProducts || productSaving}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                  <label className="flex items-center space-x-3 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      name="requiresPrescription"
                      checked={productForm.requiresPrescription}
                      onChange={handleProductFieldChange}
                      disabled={!canEditProducts || productSaving}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <span>{t('admin.products.form.fields.requiresPrescription')}</span>
                  </label>
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div>
                  <h5 className="text-sm font-semibold text-slate-800">
                    {t('admin.products.form.section.composition')}
                  </h5>
                  <p className="text-xs text-slate-500">
                    {t('admin.products.form.section.compositionSubtitle')}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-active-bg">
                      {t('admin.products.form.fields.activeIngredientBg')}
                    </label>
                    <input
                      id="admin-product-active-bg"
                      name="activeIngredient"
                      type="text"
                      value={productForm.activeIngredient}
                      onChange={handleProductFieldChange}
                      disabled={!canEditProducts || productSaving}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-active-en">
                      {t('admin.products.form.fields.activeIngredientEn')}
                    </label>
                    <input
                      id="admin-product-active-en"
                      name="activeIngredientEn"
                      type="text"
                      value={productForm.activeIngredientEn}
                      onChange={handleProductFieldChange}
                      disabled={!canEditProducts || productSaving}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-dosage-bg">
                      {t('admin.products.form.fields.dosageBg')}
                    </label>
                    <input
                      id="admin-product-dosage-bg"
                      name="dosage"
                      type="text"
                      value={productForm.dosage}
                      onChange={handleProductFieldChange}
                      disabled={!canEditProducts || productSaving}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-dosage-en">
                      {t('admin.products.form.fields.dosageEn')}
                    </label>
                    <input
                      id="admin-product-dosage-en"
                      name="dosageEn"
                      type="text"
                      value={productForm.dosageEn}
                      onChange={handleProductFieldChange}
                      disabled={!canEditProducts || productSaving}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-manufacturer-bg">
                      {t('admin.products.form.fields.manufacturerBg')}
                    </label>
                    <input
                      id="admin-product-manufacturer-bg"
                      name="manufacturer"
                      type="text"
                      value={productForm.manufacturer}
                      onChange={handleProductFieldChange}
                      disabled={!canEditProducts || productSaving}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-manufacturer-en">
                      {t('admin.products.form.fields.manufacturerEn')}
                    </label>
                    <input
                      id="admin-product-manufacturer-en"
                      name="manufacturerEn"
                      type="text"
                      value={productForm.manufacturerEn}
                      onChange={handleProductFieldChange}
                      disabled={!canEditProducts || productSaving}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-semibold text-slate-800">
                      {t('admin.products.form.section.promotion')}
                    </h5>
                    <p className="text-xs text-slate-500">
                      {t('admin.products.form.section.promotionSubtitle')}
                    </p>
                  </div>
                  <label className="inline-flex items-center space-x-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      name="hasPromotion"
                      checked={productForm.hasPromotion}
                      onChange={handleProductFieldChange}
                      disabled={!canEditProducts || productSaving}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <span>{t('admin.products.form.fields.enablePromotion')}</span>
                  </label>
                </div>

                {productForm.hasPromotion && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-promo-id">
                        {t('admin.products.form.fields.promotionId')}
                      </label>
                      <input
                        id="admin-product-promo-id"
                        name="promotionId"
                        type="text"
                        value={productForm.promotionId}
                        onChange={handleProductFieldChange}
                        disabled={!canEditProducts || productSaving}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-promo-title-bg">
                        {t('admin.products.form.fields.promotionTitleBg')}
                      </label>
                      <input
                        id="admin-product-promo-title-bg"
                        name="promotionTitle"
                        type="text"
                        value={productForm.promotionTitle}
                        onChange={handleProductFieldChange}
                        disabled={!canEditProducts || productSaving}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-promo-title-en">
                        {t('admin.products.form.fields.promotionTitleEn')}
                      </label>
                      <input
                        id="admin-product-promo-title-en"
                        name="promotionTitleEn"
                        type="text"
                        value={productForm.promotionTitleEn}
                        onChange={handleProductFieldChange}
                        disabled={!canEditProducts || productSaving}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-promo-price">
                        {t('admin.products.form.fields.promotionPrice')}
                      </label>
                      <input
                        id="admin-product-promo-price"
                        name="promoPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={productForm.promoPrice}
                        onChange={handleProductFieldChange}
                        disabled={!canEditProducts || productSaving}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-promo-discount">
                        {t('admin.products.form.fields.promotionDiscount')}
                      </label>
                      <input
                        id="admin-product-promo-discount"
                        name="discountPercentage"
                        type="number"
                        min="0"
                        max="100"
                        value={productForm.discountPercentage}
                        onChange={handleProductFieldChange}
                        disabled={!canEditProducts || productSaving}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-promo-valid">
                        {t('admin.products.form.fields.promotionValidUntil')}
                      </label>
                      <input
                        id="admin-product-promo-valid"
                        name="validUntil"
                        type="date"
                        value={productForm.validUntil}
                        onChange={handleProductFieldChange}
                        disabled={!canEditProducts || productSaving}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-promo-description-bg">
                        {t('admin.products.form.fields.promotionDescriptionBg')}
                      </label>
                      <textarea
                        id="admin-product-promo-description-bg"
                        name="promotionDescription"
                        value={productForm.promotionDescription}
                        onChange={handleProductFieldChange}
                        disabled={!canEditProducts || productSaving}
                        className="h-20 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-promo-description-en">
                        {t('admin.products.form.fields.promotionDescriptionEn')}
                      </label>
                      <textarea
                        id="admin-product-promo-description-en"
                        name="promotionDescriptionEn"
                        value={productForm.promotionDescriptionEn}
                        onChange={handleProductFieldChange}
                        disabled={!canEditProducts || productSaving}
                        className="h-20 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="admin-product-promo-badge">
                        {t('admin.products.form.fields.promotionBadge')}
                      </label>
                      <select
                        id="admin-product-promo-badge"
                        name="badgeColor"
                        value={productForm.badgeColor}
                        onChange={handleProductFieldChange}
                        disabled={!canEditProducts || productSaving}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">{t('admin.products.form.fields.promotionBadgePlaceholder')}</option>
                        {PROMOTION_BADGE_COLORS.map((color) => (
                          <option key={color} value={color}>
                            {t(`admin.products.form.fields.badge.${color}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </section>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={resetProductChanges}
                  disabled={productSaving || (!isCreatingNewProduct && !hasProductChanges)}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('admin.products.actions.reset')}
                </button>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {selectedCatalogProduct && canEditProducts && (
                    <button
                      type="button"
                      onClick={() => requestProductDeletion(selectedCatalogProduct)}
                      className="inline-flex items-center justify-center rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
                      disabled={productSaving}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('admin.products.actions.delete')}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!canEditProducts || productSaving || (!isCreatingNewProduct && !hasProductChanges)}
                    className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {productSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>{t('admin.products.actions.saving')}</span>
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        <span>
                          {productForm.id
                            ? t('admin.products.actions.save')
                            : t('admin.products.actions.create')}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {productToDelete && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-semibold">{t('admin.products.delete.title')}</p>
            <p className="mt-1">
              {t('admin.products.delete.description', { name: productToDelete.name })}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleConfirmDeleteProduct}
                className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('admin.products.actions.confirmDelete')}
              </button>
              <button
                type="button"
                onClick={handleCancelDeleteProduct}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
              >
                {t('admin.products.actions.cancelDelete')}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOrdersView = (): JSX.Element | null => {
    if (activeView !== 'orders') {
      return null;
    }

    return (
      <div className="space-y-6 border-b border-slate-100 p-6 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {t('admin.orders.title')}
            </h3>
            <p className="text-sm text-slate-500">
              {t('admin.orders.subtitle')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {t('admin.orders.count').replace('{count}', String(orders.length))}
            </span>
            <button
              type="button"
              onClick={() => void fetchOrders()}
              className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              {t('admin.orders.refresh')}
            </button>
          </div>
        </div>

        {ordersToast && (
          <div
            className={`flex items-start space-x-2 rounded-2xl border px-4 py-3 text-sm ${
              ordersToast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {ordersToast.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
            ) : (
              <Ban className="mt-0.5 h-4 w-4" />
            )}
            <span>{ordersToast.text}</span>
          </div>
        )}

        {ordersLoading ? (
          <div className="flex h-40 flex-col items-center justify-center space-y-3 text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>{t('admin.orders.loading')}</p>
          </div>
        ) : ordersError ? (
          <div className="flex flex-col items-center justify-center space-y-3 text-center text-rose-600">
            <AlertCircle className="h-8 w-8" />
            <p>{ordersError}</p>
            <button
              type="button"
              onClick={() => void fetchOrders()}
              className="inline-flex items-center space-x-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
            >
              <RefreshCw className="h-4 w-4" />
              <span>{t('admin.orders.retry')}</span>
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-10 text-center text-slate-500">
            <Package className="h-10 w-10 text-slate-400" />
            <p className="font-semibold">{t('admin.orders.empty')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfig = resolveOrderStatus(order.status);
              const grandTotal = order.grandTotal ?? order.total + order.deliveryFee;
              const normalizedStatus = normalizeOrderStatus(order.status);
              const updatingStatus = statusUpdates[order.id] ?? null;
              const isUpdatingStatus = Boolean(updatingStatus);
              const isFinalStatus =
                normalizedStatus === 'Delivered' || normalizedStatus === 'Cancelled';
              return (
                <div key={order.id} className="space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <Package className="h-4 w-4" />
                        <span>{t('orders.detail.orderNumber')}</span>
                      </div>
                      <p className="text-lg font-semibold text-slate-900">{order.orderNumber}</p>
                      <div className="mt-1 flex items-center space-x-2 text-sm text-slate-500">
                        <Calendar className="h-4 w-4" />
                        <span>{t('orders.detail.placedOn').replace('{date}', formatDate(order.createdAt))}</span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusConfig.className}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <Clock3 className="h-4 w-4 text-slate-400" />
                      <span>{t('admin.orders.actions.title')}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {orderStatusActions.map((action) => {
                        const Icon = action.icon;
                        const isActive = normalizedStatus === action.status;
                        const isLoadingAction =
                          isUpdatingStatus && updatingStatus === action.status;
                        const disabled =
                          isUpdatingStatus ||
                          isActive ||
                          (isFinalStatus && normalizedStatus !== action.status);
                        const className = [
                          'inline-flex items-center space-x-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition focus:outline-none',
                          action.focusRing,
                          isActive ? action.activeClass : action.idleClass,
                          'disabled:cursor-not-allowed',
                          disabled ? 'cursor-not-allowed opacity-60' : '',
                        ]
                          .filter(Boolean)
                          .join(' ');

                        return (
                          <button
                            key={action.status}
                            type="button"
                            onClick={() =>
                              void handleUpdateOrderStatus(order.id, action.status)
                            }
                            disabled={disabled}
                            className={className}
                          >
                            {isLoadingAction ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                            <span>{action.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {t('admin.orders.customer')}
                        </p>
                        <p className="text-sm text-slate-900">
                          {order.userFullName?.trim() || order.customerName || t('admin.orders.unknownCustomer')}
                        </p>
                        <p className="text-xs text-slate-500">{order.userEmail || order.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {t('orders.detail.paymentMethod')}
                        </p>
                        <p className="text-sm text-slate-900">
                          {resolvePaymentLabel(order.paymentMethod)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {t('admin.orders.summary.total')}
                        </p>
                        <p className="text-sm text-slate-900">{formatCurrency(grandTotal)}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Truck className="h-4 w-4 text-slate-400" />
                        <span>{t('orders.detail.deliveryStatus')}</span>
                      </div>
                      <div className="flex items-start space-x-2 text-sm text-slate-600">
                        <MapPin className="mt-1 h-4 w-4 text-slate-400" />
                        <div>
                          {order.deliveryAddress && <p>{order.deliveryAddress}</p>}
                          <p>
                            {[order.postalCode, order.city].filter(Boolean).join(' ')}
                          </p>
                          {order.country && <p>{order.country}</p>}
                        </div>
                      </div>
                      {order.notes && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                          {order.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center space-x-2 text-sm font-semibold text-slate-700">
                      <ClipboardList className="h-4 w-4" />
                      <span>{t('orders.detail.items')}</span>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <span>
                            {item.productName} × {item.quantity}
                          </span>
                          <span className="font-medium text-slate-900">
                            {formatCurrency(item.totalPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderNewsView = (): JSX.Element | null => {
    if (activeView !== 'news') {
      return null;
    }

    return (
              <div className="grid min-h-[420px] border-b border-slate-100 md:grid-cols-[360px,1fr]">
                <div className="space-y-5 p-6">
                  <div className="space-y-1">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <FileText className="h-5 w-5 text-emerald-600" />
                      {t('admin.news.listTitle')}
                    </h3>
                    <p className="text-sm text-slate-500">{t('admin.news.listSubtitle')}</p>
                  </div>
                  <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                    {news.length ? (
                      news.map((article) => {
                        const isActive = editingArticleId === article.id;
                        return (
                          <div
                            key={article.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleEditArticle(article)}
                            onKeyDown={(event) => handleNewsCardKeyDown(event, article)}
                            aria-pressed={isActive}
                            aria-label={t('admin.news.actions.openForEditing', { title: article.title })}
                            className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 ${
                              isActive
                                ? 'border-emerald-300 ring-2 ring-emerald-200'
                                : 'border-slate-100 hover:border-emerald-200 hover:shadow-md'
                            }`}
                          >
                            <div className="absolute right-3 top-3 flex gap-2">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleEditArticle(article);
                                }}
                                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
                                  isActive
                                    ? 'border-emerald-200 bg-emerald-600 text-white shadow-sm'
                                    : 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'
                                }`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                <span>{t('admin.news.actions.edit')}</span>
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleRequestDeleteArticle(article);
                                }}
                                className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>{t('admin.news.actions.delete')}</span>
                              </button>
                            </div>
                            <div className="aspect-video w-full overflow-hidden bg-slate-100">
                              <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="space-y-2 p-4">
                              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <span className="inline-flex items-center space-x-1">
                                  <Calendar className="h-4 w-4 text-slate-400" />
                                  <span>{formatDate(article.publishedAt)}</span>
                                </span>
                                <span className="inline-flex items-center space-x-1 text-emerald-600">
                                  <Clock3 className="h-4 w-4" />
                                  <span>{t('news.readTime', { minutes: article.readTimeMinutes })}</span>
                                </span>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                                  {article.category}
                                </p>
                                <h4 className="text-base font-semibold text-slate-900">{article.title}</h4>
                                <p className="text-sm text-slate-500">{article.excerpt}</p>
                                <p className="text-xs font-medium text-slate-400">
                                  {t('admin.news.article.author', { author: article.author })}
                                </p>
                                {isActive && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                    <Pencil className="h-3.5 w-3.5" />
                                    <span>{t('admin.news.actions.editing')}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center space-y-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                        <FileText className="h-10 w-10 text-slate-400" />
                        <p className="text-sm font-semibold">{t('admin.news.empty')}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-5 border-t border-slate-100 bg-slate-50 p-6 md:border-l md:border-t-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                        {isEditingNews ? (
                          <Pencil className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <PlusCircle className="h-5 w-5 text-emerald-600" />
                        )}
                        {isEditingNews ? t('admin.news.editTitle') : t('admin.news.createTitle')}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {isEditingNews ? t('admin.news.editSubtitle') : t('admin.news.createSubtitle')}
                      </p>
                    </div>
                    {isEditingNews && (
                      <button
                        type="button"
                        onClick={handleStartNewArticle}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>{t('admin.news.actions.new')}</span>
                      </button>
                    )}
                  </div>
                  {newsToast && (
                    <div
                      className={`flex items-start space-x-2 rounded-2xl border px-4 py-3 text-sm ${
                        newsToast.type === 'success'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                      }`}
                    >
                      {newsToast.type === 'success' ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4" />
                      ) : (
                        <Ban className="mt-0.5 h-4 w-4" />
                      )}
                      <span>{newsToast.text}</span>
                    </div>
                  )}
                  {newsErrors.length > 0 && (
                    <div className="space-y-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                      <p className="font-semibold">{t('admin.news.errors.listTitle')}</p>
                      <ul className="list-disc space-y-1 pl-5">
                        {newsErrors.map((message, index) => (
                          <li key={`${message}-${index}`}>{message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {articleToDelete && (
                    <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-5 w-5" />
                        <div className="space-y-1">
                          <p className="font-semibold">{t('admin.news.delete.title')}</p>
                          <p>{t('admin.news.delete.description', { title: articleToDelete.title })}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={handleConfirmDeleteArticle}
                          className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>{t('admin.news.delete.confirm')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelDeleteArticle}
                          className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
                        >
                          <X className="h-4 w-4" />
                          <span>{t('admin.news.delete.cancel')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                  <form onSubmit={handleSubmitNews} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="admin-news-id">
                        {t('admin.news.form.identifierLabel')}
                      </label>
                      <input
                        id="admin-news-id"
                        name="id"
                        type="text"
                        value={newsForm.id}
                        onChange={handleNewsFieldChange}
                        placeholder={t('admin.news.form.identifierPlaceholder')}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      />
                      <p className="mt-1 text-xs text-slate-500">{t('admin.news.form.identifierHelp')}</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="admin-news-title">
                          {t('admin.news.form.titleBg')}
                        </label>
                        <input
                          id="admin-news-title"
                          name="title"
                          value={newsForm.title}
                          onChange={handleNewsFieldChange}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="admin-news-titleEn">
                          {t('admin.news.form.titleEn')}
                        </label>
                        <input
                          id="admin-news-titleEn"
                          name="titleEn"
                          value={newsForm.titleEn}
                          onChange={handleNewsFieldChange}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="admin-news-excerpt">
                          {t('admin.news.form.excerptBg')}
                        </label>
                        <textarea
                          id="admin-news-excerpt"
                          name="excerpt"
                          value={newsForm.excerpt}
                          onChange={handleNewsFieldChange}
                          rows={3}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="admin-news-excerptEn">
                          {t('admin.news.form.excerptEn')}
                        </label>
                        <textarea
                          id="admin-news-excerptEn"
                          name="excerptEn"
                          value={newsForm.excerptEn}
                          onChange={handleNewsFieldChange}
                          rows={3}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="admin-news-content">
                          {t('admin.news.form.contentBg')}
                        </label>
                        <textarea
                          id="admin-news-content"
                          name="content"
                          value={newsForm.content}
                          onChange={handleNewsFieldChange}
                          rows={5}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="admin-news-contentEn">
                          {t('admin.news.form.contentEn')}
                        </label>
                        <textarea
                          id="admin-news-contentEn"
                          name="contentEn"
                          value={newsForm.contentEn}
                          onChange={handleNewsFieldChange}
                          rows={5}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="admin-news-category">
                          {t('admin.news.form.categoryBg')}
                        </label>
                        <input
                          id="admin-news-category"
                          name="category"
                          value={newsForm.category}
                          onChange={handleNewsFieldChange}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="admin-news-categoryEn">
                          {t('admin.news.form.categoryEn')}
                        </label>
                        <input
                          id="admin-news-categoryEn"
                          name="categoryEn"
                          value={newsForm.categoryEn}
                          onChange={handleNewsFieldChange}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="admin-news-author">
                        {t('admin.news.form.author')}
                      </label>
                      <input
                        id="admin-news-author"
                        name="author"
                        value={newsForm.author}
                        onChange={handleNewsFieldChange}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="admin-news-imageUrl">
                        {t('admin.news.form.imageUrl')}
                      </label>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          id="admin-news-imageUrl"
                          name="imageUrl"
                          value={newsForm.imageUrl}
                          onChange={handleNewsFieldChange}
                          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                        <button
                          type="button"
                          onClick={handleGenerateNewsImage}
                          className="inline-flex items-center justify-center rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                        >
                          <Image className="mr-2 h-4 w-4" />
                          {t('admin.news.form.generateImage')}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{t('admin.news.form.imageUrlHelp')}</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="admin-news-publishedAt">
                          {t('admin.news.form.publishedAt')}
                        </label>
                        <input
                          id="admin-news-publishedAt"
                          name="publishedAt"
                          type="date"
                          value={newsForm.publishedAt}
                          onChange={handleNewsFieldChange}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="admin-news-readTime">
                          {t('admin.news.form.readTime')}
                        </label>
                        <input
                          id="admin-news-readTime"
                          name="readTimeMinutes"
                          type="number"
                          min={1}
                          max={60}
                          value={newsForm.readTimeMinutes}
                          onChange={handleNewsFieldChange}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      {isEditingNews && (
                        <button
                          type="button"
                          onClick={handleStartNewArticle}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
                        >
                          <X className="h-4 w-4" />
                          <span>{t('admin.news.actions.cancelEdit')}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleResetNewsForm}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>{isEditingNews ? t('admin.news.form.resetEditing') : t('admin.news.form.reset')}</span>
                      </button>
                      <button
                        type="submit"
                        disabled={newsSubmitting}
                        className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
                          newsSubmitting
                            ? 'cursor-not-allowed bg-emerald-400 opacity-70'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        {newsSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>{t('admin.news.form.submitting')}</span>
                          </>
                        ) : (
                          <>
                            {isEditingNews ? <Save className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                            <span>
                              {isEditingNews ? t('admin.news.form.submitUpdate') : t('admin.news.form.submit')}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
    );
  };

  const renderPanel = (): JSX.Element => {
    return (
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 md:px-8">
          <div>
            <div className="flex items-center space-x-2 text-emerald-600">
              <PanelIcon className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                {panelTitle}
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-display font-semibold text-slate-900">
              {panelSubtitle}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">{panelDescription}</p>
          </div>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-6 py-3 md:px-8">
          {availableViews.includes('users') && (
            <button
              type="button"
              onClick={() => setActiveView('users')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeView === 'users'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-slate-500 hover:text-emerald-600'
              }`}
            >
              {t('admin.panel.tabs.users')}
            </button>
          )}
          {availableViews.includes('permissions') && (
            <button
              type="button"
              onClick={() => setActiveView('permissions')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeView === 'permissions'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-slate-500 hover:text-emerald-600'
              }`}
            >
              {t('admin.panel.tabs.permissions')}
            </button>
          )}
          {availableViews.includes('orders') && (
            <button
              type="button"
              onClick={() => setActiveView('orders')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeView === 'orders'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-slate-500 hover:text-emerald-600'
              }`}
            >
              {t('admin.panel.tabs.orders')}
            </button>
          )}
          {availableViews.includes('products') && (
            <button
              type="button"
              onClick={() => setActiveView('products')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeView === 'products'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-slate-500 hover:text-emerald-600'
              }`}
            >
              {t('admin.panel.tabs.products')}
            </button>
          )}
          {availableViews.includes('news') && (
            <button
              type="button"
              onClick={() => setActiveView('news')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeView === 'news'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-slate-500 hover:text-emerald-600'
              }`}
            >
              {t('admin.panel.tabs.news')}
            </button>
          )}
        </div>
        {renderUsersAndPermissionsView()}
        {renderProductsView()}
        {renderOrdersView()}
        {renderNewsView()}
      </div>
    );
  };

  if (isModal) {
    return (
      <div className="fixed inset-0 z-[60]" onClick={handleBackdropClick}>
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />
        <div className="absolute inset-0 overflow-y-auto p-4 md:p-10" onClick={handleContentClick}>
          {renderPanel()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 md:py-12">
      <div className="px-4 md:px-8">{renderPanel()}</div>
    </div>
  );
};

export default AdminPanel;
