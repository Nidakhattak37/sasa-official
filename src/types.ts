export interface ColorOption {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  collection?: string;
  description: string;
  fabricDetails: string;
  careInstructions?: string;
  images: string[];
  sizes: string[];
  colors: ColorOption[];
  sku: string;
  stock: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isSale?: boolean;
  tags?: string[];
  rating: number;
  reviewsCount: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  isFeatured?: boolean;
  subcategories: string[];
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  price: number;
  image: string;
}

export type OrderStatus = 'Confirmed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Returned';
export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded';
export type PaymentMethod = 'COD' | 'Card';

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: string;
  description: string;
  completed: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingCode: string;
  estimatedDeliveryDate: string;
  createdAt: string;
  customerNotes?: string;
  adminNotes?: string;
  timeline: OrderTimeline[];
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat' | 'free_shipping';
  discountValue: number;
  minOrderValue: number;
  expiryDate: string;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  adminReply?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  city: string;
  createdAt: string;
  password?: string;
}

export interface StoreSettings {
  storeName: string;
  email: string;
  phone: string;
  address: string;
  currency: 'PKR' | 'USD' | 'AED' | 'GBP';
  freeShippingThreshold: number;
  defaultShippingFee: number;
  taxRate: number; // e.g. 0.05 for 5%
  announcementBarText: string;
  enableCOD: boolean;
  enableCard: boolean;
}

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  lastUpdated: string;
}

export interface MenuItem {
  id: string;
  label: string;
  targetType: 'view' | 'category' | 'page' | 'custom';
  targetValue: string;
  isNewTab?: boolean;
}

export type Currency = 'PKR' | 'USD' | 'AED' | 'GBP';
