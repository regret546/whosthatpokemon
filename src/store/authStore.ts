import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AuthState, User, LoginCredentials, RegisterCredentials, GuestLoginRequest } from '@/types'
import { authService } from '@/services/authService'
import toast from 'react-hot-toast'

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  guestLogin: (credentials: GuestLoginRequest) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  initializeAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authService.login(credentials)
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          
          toast.success(`Welcome back, ${response.user.username}!`)
        } catch (error: any) {
          const errorMessage = error.message || 'Login failed. Please try again.'
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          })
          toast.error(errorMessage)
        }
      },

      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authService.register(credentials)
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          
          toast.success(`Welcome to Who's That Pokémon, ${response.user.username}!`)
        } catch (error: any) {
          const errorMessage = error.message || 'Registration failed. Please try again.'
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          })
          toast.error(errorMessage)
        }
      },

      guestLogin: async (credentials: GuestLoginRequest) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authService.guestLogin(credentials)
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          
          toast.success(`Welcome, ${response.user.username}!`)
        } catch (error: any) {
          const errorMessage = error.message || 'Guest login failed. Please try again.'
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          })
          toast.error(errorMessage)
        }
      },

      logout: () => {
        authService.logout()
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        })
        toast.success('Logged out successfully')
      },

      refreshToken: async () => {
        try {
          const response = await authService.refreshToken()
          
          set({
            user: response.user,
            isAuthenticated: true,
            error: null,
          })
        } catch (error: any) {
          // If refresh fails, logout the user
          get().logout()
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        const { user } = get()
        if (!user) return

        set({ isLoading: true, error: null })
        
        try {
          const updatedUser = await authService.updateProfile(updates)
          
          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          })
          
          toast.success('Profile updated successfully')
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to update profile. Please try again.'
          set({
            isLoading: false,
            error: errorMessage,
          })
          toast.error(errorMessage)
        }
      },

      initializeAuth: async () => {
        set({ isLoading: true })
        
        try {
          const user = await authService.getCurrentUser()
          
          if (user) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            })
          }
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
