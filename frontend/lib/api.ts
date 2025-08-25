import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useStore } from "@/store/useStore";

// Log environment variables for debugging
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('NEXT_PUBLIC_RUNNING_IN_DOCKER:', process.env.NEXT_PUBLIC_RUNNING_IN_DOCKER);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Determine the base URL
const baseURL = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NEXT_PUBLIC_RUNNING_IN_DOCKER === 'true' ? 'http://backend:8000/api' : 'http://localhost:8000/api');

// Log the baseURL for debugging
console.log('API Base URL:', baseURL);

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    // console.log('Making request to:', config.baseURL, config.url);
    const token = localStorage.getItem('blog-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void; config: InternalAxiosRequestConfig }> = [];

const processQueue = (error: any | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add a response interceptor to handle token refresh or logout on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors for token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken, setUser, clearAuth } = useStore.getState();

      if (refreshToken) {
        try {
          const response = await authAPI.refreshToken(refreshToken);
          const { access_token, refresh_token } = response.data;

          localStorage.setItem('blog-token', access_token);
          localStorage.setItem('blog-refresh-token', refresh_token);
          setUser(useStore.getState().user, access_token, refresh_token);

          apiClient.defaults.headers.common.Authorization = `Bearer ${access_token}`;
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          processQueue(null, access_token);
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          clearAuth();
          localStorage.removeItem('blog-user');
          localStorage.removeItem('blog-token');
          localStorage.removeItem('blog-refresh-token');
          processQueue(refreshError);
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        clearAuth();
        localStorage.removeItem('blog-user');
        localStorage.removeItem('blog-token');
        localStorage.removeItem('blog-refresh-token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    } else if (error.response?.status === 403) {
      // Unauthorized access, redirect to forbidden page
      window.location.href = '/forbidden';
    } else if (error.response?.status === 404) {
      // Resource not found, redirect to pagenotfound
      window.location.href = '/pagenotfound';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: (username: string, password: string): Promise<AxiosResponse<{ access_token: string; refresh_token: string; user: any }>> => {
    return apiClient.post('/login/', { username, password });
  },
  
  register: (userData: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }): Promise<AxiosResponse<{ access_token: string; refresh_token: string; user: any }>> => {
    return apiClient.post('/register/', userData);
  },

  refreshToken: (refreshToken: string): Promise<AxiosResponse<{ access_token: string; refresh_token: string }>> => {
    return apiClient.post('/auth/refresh-token/', { refresh_token: refreshToken });
  },
  
  logout: (): Promise<AxiosResponse> => {
    return apiClient.post('/auth/logout/');
  },
  
  getProfile: (): Promise<AxiosResponse<{ user: any }>> => {
    return apiClient.get('/auth/profile/');
  }
};

// Blog API functionstfr
export const blogAPI = {
  getPosts: (): Promise<AxiosResponse<any[]>> => {
    return apiClient.get('/posts/');
  },
  
  getPost: (id: string): Promise<AxiosResponse<any>> => {
    return apiClient.get(`/posts/${id}/`);
  },
  
  createPost: (postData: {
    title: string;
    content: string;
  }): Promise<AxiosResponse<any>> => {
    return apiClient.post('/posts/', postData);
  },
  
  updatePost: (id: string, postData: {
    title: string;
    content: string;
  }): Promise<AxiosResponse<any>> => {
    return apiClient.put(`/posts/${id}/`, postData);
  },
  
  deletePost: (id: string): Promise<AxiosResponse> => {
    return apiClient.delete(`/posts/${id}/`);
  }
};