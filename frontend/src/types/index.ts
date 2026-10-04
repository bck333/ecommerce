export interface User {
  id: number;
  mobileNumber: string;
  name: string | null;
  email: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  profileCompleted: boolean;
}

export interface AuthResponse {
  success: boolean;
  newUser: boolean;
  message: string;
  token: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
  subcategories: SubCategory[];
}

export interface SubCategory {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  image: string;
  displayOrder: number;
}

export interface Product {
  id: number;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  subcategoryId?: number;
  subcategoryName?: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  sku: string;
  price: number;
  mrp: number;
  discountPercentage: number;
  unit: string;
  quantity: string;
  stockQuantity: number;
  image: string;
  inStock: boolean;
  featured: boolean;
  additionalImages?: string[];
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  brand: string;
  unit: string;
  quantityDescription: string;
  image: string;
  unitPrice: number;
  mrp: number;
  quantity: number;
  itemTotal: number;
  maxAvailableStock: number;
}

export interface Cart {
  cartId: number;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
}

export interface Address {
  id: number;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  addressType: 'HOME' | 'WORK' | 'OTHER';
  isDefault: boolean;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  total: number;
}

export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'PACKING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  customerName: string;
  customerMobile: string;
  address: Address;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: 'CASH_ON_DELIVERY' | 'ONLINE_PAYMENT';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  orderStatus: OrderStatus;
  couponCode?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: number;
  title: string;
  image: string;
  link: string;
  displayOrder: number;
}

export interface CouponValidation {
  valid: boolean;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountAmount: number;
  finalAmount: number;
  message: string;
}
