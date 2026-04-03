import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../ProtectedRoute'
import { useAuthStore } from '@/stores/auth.store'

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn(),
}))

function renderWithRouter(initialPath = '/protected') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route
            path="/protected"
            element={<div data-testid="protected-content">Protected</div>}
          />
        </Route>
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show spinner while loading', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
    })

    const { container } = renderWithRouter()
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
  })

  it('should redirect to /login when not authenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
    })

    renderWithRouter()
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('should render outlet when authenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
    })

    renderWithRouter()
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
  })
})
