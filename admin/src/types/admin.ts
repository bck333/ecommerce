export interface AdminUser {
  id: number;
  mobileNumber: string;
  name: string;
  email: string;
  role: 'ADMIN';
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: AdminUser;
}

export interface SalesTrend {
  date: string;
  revenue: number;
  orders: number;
}

export interface RecentOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  amount: number;
  status: 'PLACED' | 'CONFIRMED' | 'PACKING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  date: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  todayOrders: number;
  todayRevenue: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  salesTrend: SalesTrend[];
  recentOrders: RecentOrder[];
}

export interface AdminOrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  total: number;
}

export interface AdminAddress {
  id: number;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  addressType: string;
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  userId: number;
  customerName: string;
  customerMobile: string;
  address: AdminAddress;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: 'CASH_ON_DELIVERY' | 'ONLINE_PAYMENT';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  orderStatus: 'PLACED' | 'CONFIRMED' | 'PACKING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  couponCode?: string;
  items: AdminOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminProduct {
  id: number;
  categoryId: number;
  categoryName: string;
  categorySlug?: string;
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
  active?: boolean;
}

export interface ProductForm {
  name: string;
  slug?: string;
  categoryId: number;
  subcategoryId?: number;
  description?: string;
  brand?: string;
  sku: string;
  price: number;
  mrp: number;
  unit: string;
  quantity: string;
  stockQuantity: number;
  image: string;
  featured: boolean;
  active: boolean;
}

export interface AdminSubCategory {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  image: string;
  displayOrder: number;
}

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
  active?: boolean;
  subcategories: AdminSubCategory[];
}

export interface CategoryForm {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  displayOrder: number;
  active: boolean;
}

export interface SubCategoryForm {
  categoryId: number;
  name: string;
  slug?: string;
  image?: string;
  displayOrder: number;
  active: boolean;
}

export interface AdminCoupon {
  id: number;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscount?: number;
  startDate?: string;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
}

export interface CouponForm {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number;
  startDate?: string;
  expiryDate: string;
  usageLimit?: number;
  active: boolean;
}

export interface AdminBanner {
  id: number;
  title: string;
  image: string;
  link: string;
  displayOrder: number;
  active: boolean;
}

export interface BannerForm {
  title: string;
  image: string;
  link?: string;
  displayOrder: number;
  active: boolean;
}

export interface AdminDeliveryArea {
  id: number;
  pincode: string;
  city: string;
  state: string;
  deliveryAvailable: boolean;
  deliveryFee: number;
  minimumOrderAmount: number;
}

export interface DeliveryAreaForm {
  pincode: string;
  city: string;
  state: string;
  deliveryAvailable: boolean;
  deliveryFee: number;
  minimumOrderAmount: number;
}

export interface AdminUserItem {
  id: number;
  mobileNumber: string;
  name: string | null;
  email: string | null;
  profileCompleted: boolean;
  active: boolean;
  totalOrders: number;
  createdAt: string;
}
