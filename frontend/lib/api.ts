import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api', // Django backend URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('blog-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh or logout on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear local storage and redirect to login
      localStorage.removeItem('blog-user');
      localStorage.removeItem('blog-token');
      window.location.href = '/login';
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
  login: (username: string, password: string): Promise<AxiosResponse<{ token: string; user: any }>> => {
    return apiClient.post('/login/', { username, password });
  },
  
  register: (userData: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }): Promise<AxiosResponse<{ token: string; user: any }>> => {
    return apiClient.post('/register/', userData);
  },
  
  logout: (): Promise<AxiosResponse> => {
    return apiClient.post('/auth/logout/');
  },
  
  getProfile: (): Promise<AxiosResponse<{ user: any }>> => {
    return apiClient.get('/auth/profile/');
  }
};

// Blog API functions
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