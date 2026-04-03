import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PublicRoute } from '../PublicRoute'
import { useAuthStore } from '@/stores/auth.store'

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn(),
}))

function renderWithRouter(initialPath = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route
            path="/login"
            element={<div data-testid="login-content">Login</div>}
          />
        </Route>
        <Route
          path="/dashboard"
          element={<div data-testid="dashboard-page">Dashboard</div>}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PublicRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render nothing while loading', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
    })

    const { container } = renderWithRouter()
    expect(container.innerHTML).toBe('')
  })

  it('should redirect to /dashboard when authenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
    })

    renderWithRouter()
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
    expect(screen.queryByTestId('login-content')).not.toBeInTheDocument()
  })

  it('should render outlet when not authenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
    })

    renderWithRouter()
    expect(screen.getByTestId('login-content')).toBeInTheDocument()
    expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument()
  })
})
