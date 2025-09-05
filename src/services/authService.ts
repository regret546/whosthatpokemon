import { apiClient } from './apiClient'
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse, 
  GuestLoginRequest, 
  GuestLoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User 
} from '@/types'

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
    
    if (response.success && response.data) {
      // Store tokens
      apiClient.setAuthToken(response.data.token)
      localStorage.setItem('refresh_token', response.data.refreshToken)
      
      return response.data
    }
    
    throw new Error(response.error || 'Login failed')
  }

  async register(credentials: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', credentials)
    
    if (response.success && response.data) {
      // Store tokens
      apiClient.setAuthToken(response.data.token)
      localStorage.setItem('refresh_token', response.data.refreshToken)
      
      return response.data
    }
    
    throw new Error(response.error || 'Registration failed')
  }

  async guestLogin(credentials: GuestLoginRequest): Promise<GuestLoginResponse> {
    const response = await apiClient.post<GuestLoginResponse>('/auth/guest', credentials)
    
    if (response.success && response.data) {
      // Store token
      apiClient.setAuthToken(response.data.token)
      
      return response.data
    }
    
    throw new Error(response.error || 'Guest login failed')
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local storage
      apiClient.removeAuthToken()
    }
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    })
    
    if (response.success && response.data) {
      // Update tokens
      apiClient.setAuthToken(response.data.token)
      localStorage.setItem('refresh_token', response.data.refreshToken)
      
      return response.data
    }
    
    throw new Error(response.error || 'Token refresh failed')
  }

  async getCurrentUser(): Promise<User | null> {
    if (!apiClient.isAuthenticated()) {
      return null
    }

    try {
      const response = await apiClient.get<User>('/auth/me')
      
      if (response.success && response.data) {
        return response.data
      }
      
      return null
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>('/auth/profile', updates)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Profile update failed')
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    })
    
    if (!response.success) {
      throw new Error(response.error || 'Password change failed')
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await apiClient.post('/auth/forgot-password', { email })
    
    if (!response.success) {
      throw new Error(response.error || 'Password reset request failed')
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      password,
    })
    
    if (!response.success) {
      throw new Error(response.error || 'Password reset failed')
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const response = await apiClient.post('/auth/verify-email', { token })
    
    if (!response.success) {
      throw new Error(response.error || 'Email verification failed')
    }
  }

  async resendVerificationEmail(): Promise<void> {
    const response = await apiClient.post('/auth/resend-verification')
    
    if (!response.success) {
      throw new Error(response.error || 'Verification email resend failed')
    }
  }

  async deleteAccount(): Promise<void> {
    const response = await apiClient.delete('/auth/account')
    
    if (!response.success) {
      throw new Error(response.error || 'Account deletion failed')
    }
    
    // Clear local storage after successful deletion
    apiClient.removeAuthToken()
  }

  async uploadAvatar(file: File): Promise<string> {
    const response = await apiClient.uploadFile<{ avatarUrl: string }>('/auth/avatar', file)
    
    if (response.success && response.data) {
      return response.data.avatarUrl
    }
    
    throw new Error(response.error || 'Avatar upload failed')
  }

  // Google OAuth
  async getGoogleAuthUrl(): Promise<string> {
    const response = await apiClient.get<{ url: string }>('/auth/google/url')
    
    if (response.success && response.data) {
      return response.data.url
    }
    
    throw new Error(response.error || 'Failed to get Google auth URL')
  }

  async handleGoogleCallback(code: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/google/callback', { code })
    
    if (response.success && response.data) {
      // Store tokens
      apiClient.setAuthToken(response.data.token)
      localStorage.setItem('refresh_token', response.data.refreshToken)
      
      return response.data
    }
    
    throw new Error(response.error || 'Google authentication failed')
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated()
  }

  // Get current token
  getToken(): string | null {
    return apiClient.getAuthToken()
  }
}

export const authService = new AuthService()
