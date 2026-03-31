export interface Item {
  id: number;
  name: string;
  code: string;
  price: number;
  bough_price: number;
  image_url: string;
  rating: number;
  tags: string[];
  description: string;
  price_cut: number;
  weight: number;
  points: number;
  category_id?: number;
}

export interface Category {
  id: number;
  name: string;
  pict?: string;
  sort_order: number;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface CartItem {
  item_id: number;
  quantity: number;
}

export interface UserInfo {
  name: string;
  phone: string;
  address: string;
}

export interface PurchaseRequest {
  items: CartItem[];
  user: UserInfo;
  shipping_cost?: number;
}

export interface PurchaseResponse {
  code: string;
  total_price: number;
}

export interface User {
  id: number;
  name: string;
  phone: string;
  address: string;
}

export interface ItemWithQuantity {
  item: Item;
  quantity: number;
}

export interface PurchaseDetails {
  code: string;
  items: ItemWithQuantity[];
  total_price: number;
  total_bough_price: number;
  shipping_cost?: number;
  shipping_destination?: string;
  shipping_expedition?: string;
  user: User;
  status: string;
  created_at: string;
  pay?: boolean;
  check?: boolean;
  trxid: string;
}

export interface CartItemWithDetails extends CartItem {
  item: Item;
}

export interface DestinationItem {
  id: number;
  label: string;
  province_name?: string;
  city_name?: string;
  district_name?: string;
  subdistrict_name?: string;
  zip_code?: string;
}

export interface ShippingOption {
  name: string;
  code: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PurchaseSummary {
  id: number;
  code: string;
  total_price: number;
  status: string;
  created_at: string;
  user_name: string;
  user_phone: string;
  items_count: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
}

export interface Admin {
  id: number;
  username: string;
  created_at: string;
}