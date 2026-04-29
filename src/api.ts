import axios from 'axios';
import { Item, PurchaseRequest, PurchaseResponse, PurchaseDetails, Tag, ApiResponse, PurchaseSummary, PaginatedResponse, Admin, DestinationItem, ShippingOption, Category, SiteConfig, UpdateSiteConfigRequest } from './types';

// Use VITE_API_BASE_URL env for development, force relative path in production
const API_BASE_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_BASE_URL || '') : '';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Separate axios instance for admin API calls
const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/admin/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include session token
adminApi.interceptors.request.use((config) => {
  const sessionToken = localStorage.getItem('admin_session_token');
  if (sessionToken) {
    config.headers.Authorization = `Bearer ${sessionToken}`;
  }
  return config;
});

export const apiClient = {

  // Create a purchase
  async createPurchase(purchaseRequest: PurchaseRequest): Promise<PurchaseResponse> {
    const response = await api.post<PurchaseResponse>('/purchase', purchaseRequest);
    return response.data;
  },

  // Shipping: search destinations
  async searchDestinations(search: string, limit: number = 10, offset: number = 0): Promise<DestinationItem[]> {
    const params = new URLSearchParams();
    params.append('search', search);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    const response = await api.get<{ data: DestinationItem[] }>(`/shipping/destinations?${params.toString()}`);
    return response.data.data;
  },

  // Shipping: calculate cost
  async calculateShippingCost(destinationId: number, weight: number, origin?: string, courier?: string, price: string = 'lowest'): Promise<ShippingOption[]> {
    const response = await api.post<{ data: ShippingOption[] }>(`/shipping/cost`, {
      destination: destinationId,
      weight,
      origin,
      courier,
      price,
    });
    return response.data.data;
  },


  // Get popular tags
  async getPopularTags(limit: number = 5, categoryId?: number | null): Promise<Tag[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (categoryId !== undefined && categoryId !== null) {
      params.append('category_id', categoryId.toString());
    }
    const response = await api.get<Tag[]>(`/tags/popular?${params.toString()}`);
    return response.data;
  },

  // Get all tags
  async getTags(categoryId?: number | null): Promise<Tag[]> {
    const params = new URLSearchParams();
    if (categoryId !== undefined && categoryId !== null) {
      params.append('category_id', categoryId.toString());
    }
    const url = params.toString() ? `/tags?${params.toString()}` : '/tags';
    const response = await api.get<Tag[]>(url);
    return response.data;
  },

  // Get all categories
  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  // Get site configuration
  async getSiteConfig(): Promise<SiteConfig> {
    const response = await api.get<SiteConfig>('/config');
    return response.data;
  },

  // Admin category management functions
  async createAdminCategory(category: { name: string; pict?: string }): Promise<Category> {
    const response = await adminApi.post<Category>('/categories', category);
    return response.data;
  },

  async updateAdminCategory(id: number, category: { name: string; pict?: string }): Promise<Category> {
    const response = await adminApi.put<Category>(`/categories/${id}`, category);
    return response.data;
  },

  async deleteAdminCategory(id: number): Promise<{ message: string }> {
    const response = await adminApi.delete<{ message: string }>(`/categories/${id}`);
    return response.data;
  },

  async updateCategoriesSortOrder(categories: { id: number; sort_order: number }[]): Promise<{ message: string }> {
    const response = await adminApi.put<{ message: string }>('/categories/sort-order', { categories });
    return response.data;
  },

  // Admin site config management
  async updateSiteConfig(config: UpdateSiteConfigRequest): Promise<SiteConfig> {
    const response = await adminApi.put<SiteConfig>('/config', config);
    return response.data;
  },

  // Get items by tags
  async getItemsByTags(tags: string[], page: number = 1, limit: number = 12, search?: string, categoryId?: number | null): Promise<{ items: Item[]; total: number; hasMore: boolean }> {
    const params = new URLSearchParams();
    params.append('tags', tags.join(','));
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) {
      params.append('search', search);
    }
    if (categoryId !== undefined && categoryId !== null) {
      params.append('category_id', categoryId.toString());
    }
    const response = await api.get<{ items: Item[]; total: number; hasMore: boolean }>(`/items/tags?${params.toString()}`);
    return response.data;
  },

  // Get items with random cursor pagination
  async getItemsRandom(cursor?: string, limit: number = 12, search?: string, categoryId?: number | null): Promise<{ items: Item[]; total: number; hasMore: boolean; cursor: string }> {
    const params = new URLSearchParams();
    if (cursor) {
      params.append('cursor', cursor);
    }
    params.append('limit', limit.toString());
    if (search) {
      params.append('search', search);
    }
    if (categoryId !== undefined && categoryId !== null) {
      params.append('category_id', categoryId.toString());
    }
    const response = await api.get<{ items: Item[]; total: number; hasMore: boolean; cursor: string }>(`/items/random?${params.toString()}`);
    return response.data;
  },

  // Get single item by ID
  async getItemById(id: number): Promise<Item> {
    const response = await api.get<Item>(`/items/${id}`);
    return response.data;
  },

  // Get all promo items
  async getPromoItems(): Promise<Item[]> {
    const response = await api.get<Item[]>('/items/promo');
    return response.data;
  },

  // Admin authentication functions
  async checkAdminExists(): Promise<{ exists: boolean }> {
    const response = await adminApi.get<{ exists: boolean }>('/check');
    return response.data;
  },

  async adminLogin(credentials: { username: string; password: string }): Promise<{ message: string; admin: any; session_token: string }> {
    const response = await adminApi.post<{ message: string; admin: any; session_token: string }>('/login', credentials);
    return response.data;
  },

  async adminRegister(credentials: { username: string; password: string }): Promise<{ message: string }> {
    const response = await adminApi.post<{ message: string }>('/register', credentials);
    return response.data;
  },

  // Admin item management functions
  async getAdminItems(page: number = 1, limit: number = 20, search?: string): Promise<{ items: Item[]; total: number; hasMore: boolean }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) {
      params.append('search', search);
    }
    const response = await adminApi.get<{ items: Item[]; total: number; hasMore: boolean }>(`/items?${params.toString()}`);
    return response.data;
  },

  async createAdminItem(item: Omit<Item, 'id'>): Promise<Item> {
    const response = await adminApi.post<Item>('/items', item);
    return response.data;
  },

  async updateAdminItem(id: number, item: Partial<Item>): Promise<Item> {
    const response = await adminApi.put<Item>(`/items/${id}`, item);
    return response.data;
  },

  async deleteAdminItem(id: number): Promise<{ message: string }> {
    const response = await adminApi.delete<{ message: string }>(`/items/${id}`);
    return response.data;
  },

  // Admin purchase management functions
  async checkPurchase(code: string, trxid: string): Promise<PurchaseDetails> {
    const response = await adminApi.get<ApiResponse<PurchaseDetails>>(`/purchase-details?code=${code}&trxid=${trxid}`);
    return response.data.data;
  },

  async cancelPurchase(code: string): Promise<void> {
    const response = await adminApi.post(`/cancel-purchase?code=${code}`);
    return response.data;
  },

  // Get all purchases with pagination and filtering
    async getPurchases(
        page: number = 1, 
        limit: number = 20, 
        status?: string,
        code?: string,
        startDate?: string,
        endDate?: string
    ): Promise<PaginatedResponse<PurchaseSummary>> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (status) {
            params.append('status', status);
        }
        if (code) {
            params.append('code', code);
        }
        if (startDate) {
            params.append('start_date', startDate);
        }
        if (endDate) {
            params.append('end_date', endDate);
        }
        const response = await adminApi.get<PaginatedResponse<PurchaseSummary>>(`/purchases?${params.toString()}`);
        return response.data;
    },

    // Admin site config management
    async updateAdminSiteConfig(config: UpdateSiteConfigRequest): Promise<SiteConfig> {
        const response = await adminApi.put<SiteConfig>('/config', config);
        return response.data;
    },
};