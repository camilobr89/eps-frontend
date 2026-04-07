import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  LoginRequest,
  RegisterRequest,
  UpdateUserPreferencesRequest,
  User,
} from '@/types'
import { authService } from '@/services/auth.service'

interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean

  login: (dto: LoginRequest) => Promise<void>
  register: (dto: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  getProfile: () => Promise<void>
  initialize: () => Promise<void>
  updatePreferences: (dto: UpdateUserPreferencesRequest) => Promise<User | null>

  setAccessToken: (token: string | null) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: true,
      isAuthenticated: false,

      login: async (dto) => {
        const { accessToken } = await authService.login(dto)
        set({ accessToken, isAuthenticated: true })
        await get().getProfile()
      },

      register: async (dto) => {
        await authService.register(dto)
        await get().login({ email: dto.email, password: dto.password })
      },

      logout: async () => {
        try {
          await authService.logout()
        } catch {
          // Always clear local state even if server call fails
        } finally {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      refresh: async () => {
        const { accessToken } = await authService.refresh()
        set({ accessToken, isAuthenticated: true })
      },

      getProfile: async () => {
        const user = await authService.getProfile()
        set({ user })
      },

      updatePreferences: async (dto) => {
        await authService.updatePreferences(dto)
        await get().getProfile()
        return get().user
      },

      initialize: async () => {
        try {
          const { accessToken } = get()
          if (accessToken) {
            await get().getProfile()
            set({ isAuthenticated: true })
          } else {
            await get().refresh()
            await get().getProfile()
          }
        } catch {
          set({ user: null, accessToken: null, isAuthenticated: false })
        } finally {
          set({ isLoading: false })
        }
      },

      setAccessToken: (token) =>
        set({ accessToken: token, isAuthenticated: !!token }),

      reset: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ accessToken: state.accessToken }),
    },
  ),
)
