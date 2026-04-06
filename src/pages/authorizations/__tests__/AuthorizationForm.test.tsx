import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { AuthorizationForm } from '../AuthorizationForm'
import { useFamilyMembers } from '@/hooks/useFamilyMembers'
import { useEpsProviders } from '@/hooks/useEpsProviders'

vi.mock('@/hooks/useFamilyMembers', () => ({
  useFamilyMembers: vi.fn(),
}))

vi.mock('@/hooks/useEpsProviders', () => ({
  useEpsProviders: vi.fn(),
}))

const mockFamilyMembers = [
  {
    id: 'member-1',
    epsProviderId: 'eps-1',
    fullName: 'Juan Perez',
  },
]

const mockEpsProviders = [
  {
    id: 'eps-1',
    name: 'EPS Sanitas',
    isActive: true,
  },
]

describe('AuthorizationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useFamilyMembers).mockReturnValue({
      data: { data: mockFamilyMembers },
      isLoading: false,
    } as ReturnType<typeof useFamilyMembers>)

    vi.mocked(useEpsProviders).mockReturnValue({
      data: mockEpsProviders,
    } as ReturnType<typeof useEpsProviders>)
  })

  it('shows option labels instead of raw ids for selected family member and EPS', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(
      <AuthorizationForm
        defaultValues={{ familyMemberId: 'member-1' }}
        onSubmit={onSubmit}
      />,
    )

    const familyMemberField = screen.getByText('Miembro de familia *').closest('div')
    const epsField = screen.getByText('EPS').closest('div')

    expect(familyMemberField).not.toBeNull()
    expect(epsField).not.toBeNull()

    const familyMemberSelect = within(familyMemberField!).getByRole('combobox')
    const epsSelect = within(epsField!).getByRole('combobox')

    await waitFor(() => {
      expect(within(familyMemberSelect).getByText('Juan Perez')).toBeInTheDocument()
      expect(within(epsSelect).getByText('EPS Sanitas')).toBeInTheDocument()
    })

    expect(within(familyMemberSelect).queryByText('member-1')).not.toBeInTheDocument()
    expect(within(epsSelect).queryByText('eps-1')).not.toBeInTheDocument()
  })
})
