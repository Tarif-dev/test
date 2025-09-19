import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  publicAddress: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface WalletInfo {
  address: string;
  privateKey: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  // Set auth token in localStorage
  private setAuthToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('authToken', token);
  }

  // Remove auth token from localStorage
  private removeAuthToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('authToken');
  }

  // Create axios instance with auth header
  private createAuthenticatedRequest() {
    const token = this.getAuthToken();
    return axios.create({
      baseURL: this.baseURL,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  }

  // Get Google auth URL
  async getGoogleAuthUrl(): Promise<string> {
    try {
      const response = await axios.get(`${this.baseURL}/auth/google`);
      return response.data.authUrl;
    } catch (error) {
      console.error('Error getting Google auth URL:', error);
      throw new Error('Failed to get authentication URL');
    }
  }

  // Handle Google OAuth callback
  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/google/callback`, {
        code
      });
      
      const { token, user } = response.data;
      this.setAuthToken(token);
      
      return { token, user };
    } catch (error) {
      console.error('Error handling Google callback:', error);
      throw new Error('Authentication failed');
    }
  }

  // Get current user profile
  async getUserProfile(): Promise<User> {
    try {
      const api = this.createAuthenticatedRequest();
      const response = await api.get('/user/profile');
      return response.data.user;
    } catch (error) {
      console.error('Error getting user profile:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        this.removeAuthToken();
        throw new Error('Session expired');
      }
      throw new Error('Failed to get user profile');
    }
  }

  // Get user wallet info
  async getUserWallet(): Promise<WalletInfo> {
    try {
      const api = this.createAuthenticatedRequest();
      const response = await api.get('/user/wallet');
      return response.data;
    } catch (error) {
      console.error('Error getting wallet info:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        this.removeAuthToken();
        throw new Error('Session expired');
      }
      throw new Error('Failed to get wallet information');
    }
  }

  // Logout
  logout(): void {
    this.removeAuthToken();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export const apiService = new ApiService();