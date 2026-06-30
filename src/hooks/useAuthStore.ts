import { create } from 'zustand';
import axios from 'axios';

export const API_URL = '/api';

interface AuthState {
  adminToken: string | null;
  isAuthenticated: boolean;
  login: (secret: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Safe window/localStorage check for Next.js SSR
  const getInitialToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tcf_admin_token');
    }
    return null;
  };

  const initialToken = getInitialToken();

  return {
    adminToken: initialToken,
    isAuthenticated: !!initialToken,
    
    login: async (secret: string): Promise<boolean> => {
      try {
        const response = await axios.post(`${API_URL}/admin/auth`, { secret });
        if (response.data.success) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('tcf_admin_token', secret);
          }
          set({ adminToken: secret, isAuthenticated: true });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Admin login error:', error);
        return false;
      }
    },
    
    logout: async () => {
      try {
        await axios.post(`${API_URL}/admin/logout`);
      } catch (error) {
        console.error('Failed to log out on server:', error);
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tcf_admin_token');
      }
      set({ adminToken: null, isAuthenticated: false });
    }
  };
});

export const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('tcf_admin_token');
    if (token) {
      config.headers['Authorization'] = token;
      config.headers['x-admin-token'] = token;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
