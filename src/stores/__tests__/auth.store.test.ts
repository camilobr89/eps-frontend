import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from '../auth.store'
import { authService } from '@/services/auth.service'

vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    getProfile: vi.fn(),
  },
}))

const mockUser = {
  id: '1',
  email: 'test@test.com',
  fullName: 'Test User',
  isActive: true,
  emailNotifications: true,
  createdAt: '2026-01-01T00:00:00Z',
}

function resetStore() {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    isLoading: true,
    isAuthenticated: false,
  })
}

describe('auth.store', () => {
  beforeEach(() => {
    resetStore()
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('login', () => {
    it('should set accessToken and fetch profile on success', async () => {
      vi.mocked(authService.login).mockResolvedValue({
        accessToken: 'token-123',
      })
      vi.mocked(authService.getProfile).mockResolvedValue(mockUser)

      await useAuthStore.getState().login({
        email: 'test@test.com',
        password: 'password',
      })

      const state = useAuthStore.getState()
      expect(state.accessToken).toBe('token-123')
      expect(state.isAuthenticated).toBe(true)
      expect(state.user).toEqual(mockUser)
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password',
      })
      expect(authService.getProfile).toHaveBeenCalled()
    })

    it('should not set token when login fails', async () => {
      vi.mocked(authService.login).mockRejectedValue(new Error('Invalid'))

      await expect(
        useAuthStore.getState().login({
          email: 'bad@test.com',
          password: 'wrong',
        }),
      ).rejects.toThrow('Invalid')

      const state = useAuthStore.getState()
      expect(state.accessToken).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('register', () => {
    it('should register then auto-login', async () => {
      vi.mocked(authService.register).mockResolvedValue(mockUser)
      vi.mocked(authService.login).mockResolvedValue({
        accessToken: 'new-token',
      })
      vi.mocked(authService.getProfile).mockResolvedValue(mockUser)

      await useAuthStore.getState().register({
        email: 'test@test.com',
        password: 'password',
        fullName: 'Test User',
      })

      expect(authService.register).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password',
        fullName: 'Test User',
      })
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password',
      })
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })
  })

  describe('logout', () => {
    it('should clear state on logout', async () => {
      useAuthStore.setState({
        user: mockUser,
        accessToken: 'token',
        isAuthenticated: true,
      })
      vi.mocked(authService.logout).mockResolvedValue()

      await useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
    })

    it('should clear state even if logout API call fails', async () => {
      useAuthStore.setState({
        user: mockUser,
        accessToken: 'token',
        isAuthenticated: true,
      })
      vi.mocked(authService.logout).mockRejectedValue(new Error('Network'))

      await useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('refresh', () => {
    it('should update accessToken on refresh', async () => {
      vi.mocked(authService.refresh).mockResolvedValue({
        accessToken: 'refreshed-token',
      })

      await useAuthStore.getState().refresh()

      expect(useAuthStore.getState().accessToken).toBe('refreshed-token')
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })
  })

  describe('initialize', () => {
    it('should restore session when accessToken exists', async () => {
      useAuthStore.setState({ accessToken: 'saved-token' })
      vi.mocked(authService.getProfile).mockResolvedValue(mockUser)

      await useAuthStore.getState().initialize()

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.user).toEqual(mockUser)
      expect(state.isLoading).toBe(false)
      expect(authService.refresh).not.toHaveBeenCalled()
    })

    it('should try refresh when no accessToken exists', async () => {
      vi.mocked(authService.refresh).mockResolvedValue({
        accessToken: 'fresh-token',
      })
      vi.mocked(authService.getProfile).mockResolvedValue(mockUser)

      await useAuthStore.getState().initialize()

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.user).toEqual(mockUser)
      expect(state.isLoading).toBe(false)
      expect(authService.refresh).toHaveBeenCalled()
    })

    it('should reset state when initialize fails completely', async () => {
      vi.mocked(authService.refresh).mockRejectedValue(new Error('No session'))

      await useAuthStore.getState().initialize()

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
      expect(state.isLoading).toBe(false)
    })

    it('should reset if getProfile fails with existing token', async () => {
      useAuthStore.setState({ accessToken: 'expired-token' })
      vi.mocked(authService.getProfile).mockRejectedValue(
        new Error('Unauthorized'),
      )

      await useAuthStore.getState().initialize()

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
    })
  })

  describe('setAccessToken', () => {
    it('should set token and mark authenticated', () => {
      useAuthStore.getState().setAccessToken('abc')
      expect(useAuthStore.getState().accessToken).toBe('abc')
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    it('should clear authenticated when token is null', () => {
      useAuthStore.getState().setAccessToken(null)
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('reset', () => {
    it('should clear all auth state', () => {
      useAuthStore.setState({
        user: mockUser,
        accessToken: 'token',
        isAuthenticated: true,
        isLoading: true,
      })

      useAuthStore.getState().reset()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
    })
  })
})
