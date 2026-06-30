import { create } from 'zustand';
import { api } from './useAuthStore';

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  salePrice: number | null;
  stock: number;
  material: string;
  dimensions: string;
  weight: number;
  images: string[];
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  banner: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  bannerImage: string;
  tags: string[];
  createdAt: string;
}

export interface StoreSettings {
  banners: any[];
  seo: {
    siteTitle: string;
    siteDescription: string;
    ogImage: string;
  };
  contact: {
    phone: string;
    email: string;
    whatsapp: string;
    address: string;
    hours?: string;
  };
  about?: {
    story: string;
    mission: string;
    teakDescription: string;
    sheeshamDescription: string;
    mangoDescription: string;
  };
  faqs?: any[];
  testimonials?: any[];
}

interface ProductState {
  products: Product[];
  categories: Category[];
  blogs: Blog[];
  settings: StoreSettings | null;
  loading: boolean;
  
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchBlogs: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  
  setProducts: (products: Product[]) => void;
  setCategories: (categories: Category[]) => void;
  setBlogs: (blogs: Blog[]) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  categories: [],
  blogs: [],
  settings: null,
  loading: false,

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/products');
      set({ products: response.data });
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const response = await api.get('/categories');
      set({ categories: response.data });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  },

  fetchBlogs: async () => {
    try {
      const response = await api.get('/blogs');
      set({ blogs: response.data });
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  },

  fetchSettings: async () => {
    try {
      const response = await api.get('/settings');
      set({ settings: response.data });
    } catch (error) {
      console.error('Error fetching store settings:', error);
    }
  },

  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setBlogs: (blogs) => set({ blogs })
}));
