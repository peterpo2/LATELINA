export interface Category {
  id: number;
  name: string;
  description?: string;
  icon: string;
}

export interface ProductPromotion {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  promoPrice: number;
  discountPercentage?: number;
  validUntil?: string;
  badgeColor?: 'emerald' | 'blue' | 'purple' | 'orange' | 'pink';
}

export interface Product {
  id: number;
  name: string;
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  categoryId: number;
  category?: Category;
  requiresPrescription: boolean;
  activeIngredient?: string;
  activeIngredientEn?: string;
  dosage?: string;
  dosageEn?: string;
  manufacturer?: string;
  manufacturerEn?: string;
  rating?: number;
  reviewCount?: number;
  promotion?: ProductPromotion;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  unitPrice: number;
}

export type PaymentMethod = 'CashOnDelivery' | 'Card' | 'BankTransfer';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItemSummary {
  id: number;
  productId: number;
  productName: string;
  productDescription?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  vatAmount: number;
  vatRate: number;
  netTotal: number;
}

export interface NhifPrescriptionSummary {
  id: number;
  prescriptionNumber: string;
  personalIdentificationNumber: string;
  prescribedDate: string;
  purchaseDate: string;
  orderNumber: string;
  userId: string;
  patientPaidAmount: number;
  nhifPaidAmount: number;
  otherCoverageAmount?: number | null;
  createdAt: string;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  orderKey?: string;
  status: OrderStatus | number;
  paymentMethod: PaymentMethod | number;
  total: number;
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  deliveryFee: number;
  grandTotal: number;
  customerName?: string;
  customerEmail?: string;
  phoneNumber?: string;
  deliveryAddress?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  createdAt: string;
  orderDate?: string;
  updatedAt: string;
  userId: string;
  userEmail?: string;
  userFullName?: string;
  items: OrderItemSummary[];
  nhifPrescriptions?: NhifPrescriptionSummary[];
}

export interface ShoppingCart {
  id: number;
  userId: string;
  items: CartItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  isAdmin?: boolean;
  isStaff?: boolean;
  canManageProducts?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
}

export interface ProductFilter {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  requiresPrescription?: boolean;
  pageNumber: number;
  pageSize: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  productId?: number;
}

export interface AssistantResponse {
  question: string;
  answer: string;
  productId?: number;
  timestamp: Date;
  disclaimer: string;
}

export interface NewsArticle {
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
  readTimeMinutes: number;
}
