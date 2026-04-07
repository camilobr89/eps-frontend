import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsPage } from '../SettingsPage'

const mockNavigate = vi.fn()
const mockLogout = vi.fn()
const mockUpdatePreferences = vi.fn()

const mockState = {
  user: {
    id: 'user-1',
    email: 'camilo@example.com',
    fullName: 'Camilo Rojas',
    isActive: true,
    phone: '+573001112233',
    emailNotifications: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  logout: mockLogout,
  updatePreferences: mockUpdatePreferences,
}

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn((selector: (state: typeof mockState) => unknown) => selector(mockState)),
}))

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockState.user.phone = '+573001112233'
    mockState.user.emailNotifications = true
    mockUpdatePreferences.mockResolvedValue(undefined)
    mockLogout.mockResolvedValue(undefined)
  })

  it('renders profile information and saves preferences', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    expect(screen.getByDisplayValue('Camilo Rojas')).toBeInTheDocument()
    expect(screen.getByDisplayValue('camilo@example.com')).toBeInTheDocument()

    const phoneInput = screen.getByLabelText('Teléfono')
    await user.clear(phoneInput)
    await user.type(phoneInput, '+573204445566')
    await user.click(screen.getByLabelText('Recibir notificaciones por email'))
    await user.click(screen.getByRole('button', { name: /guardar preferencias/i }))

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        phone: '+573204445566',
        emailNotifications: false,
      })
    })

    expect(
      await screen.findByText('Preferencias guardadas correctamente'),
    ).toBeInTheDocument()
  })

  it('logs out and redirects to login', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }))

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })
})
