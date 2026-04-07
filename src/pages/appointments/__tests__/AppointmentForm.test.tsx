import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { AppointmentForm } from '../AppointmentForm'
import { useFamilyMembers } from '@/hooks/useFamilyMembers'
import { authorizationsService } from '@/services/authorizations.service'
import type { Authorization, PaginatedResponse } from '@/types'

vi.mock('@/hooks/useFamilyMembers', () => ({
  useFamilyMembers: vi.fn(),
}))

vi.mock('@/services/authorizations.service', () => ({
  authorizationsService: {
    getAll: vi.fn(),
  },
}))

const mockFamilyMembers = [
  {
    id: 'member-1',
    fullName: 'Juan Perez',
  },
  {
    id: 'member-2',
    fullName: 'Maria Gomez',
  },
]

const memberOneAuthPage = {
  data: [
    {
      id: 'auth-1',
      familyMemberId: 'member-1',
      epsProviderId: null,
      documentType: 'Carta de Autorizacion',
      requestNumber: 'AUTH-001',
      issuingDate: null,
      expirationDate: null,
      diagnosisCode: null,
      diagnosisDescription: 'Cardiologia',
      patientLocation: null,
      serviceOrigin: null,
      providerName: null,
      providerNit: null,
      providerCode: null,
      providerAddress: null,
      providerPhone: null,
      providerDepartment: null,
      providerCity: null,
      paymentType: null,
      copayValue: null,
      copayPercentage: null,
      maxValue: null,
      weeksContributed: null,
      priority: 'alta',
      status: 'pending',
      originalFileUrl: null,
      ocrRawText: null,
      ocrConfidence: null,
      ocrParserUsed: null,
      manuallyReviewed: false,
      notes: null,
      services: [
        {
          id: 'service-1',
          authorizationId: 'auth-1',
          serviceCode: '890201',
          serviceName: 'Consulta especializada',
          quantity: 1,
          serviceType: null,
        },
      ],
      createdAt: '2026-04-01T00:00:00Z',
      updatedAt: '2026-04-01T00:00:00Z',
    },
  ],
  meta: {
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
} satisfies PaginatedResponse<Authorization>

const memberTwoAuthPage = {
  data: [],
  meta: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
} satisfies PaginatedResponse<Authorization>

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('AppointmentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useFamilyMembers).mockReturnValue({
      data: { data: mockFamilyMembers },
      isLoading: false,
    } as ReturnType<typeof useFamilyMembers>)

    vi.mocked(authorizationsService.getAll).mockImplementation(async (filters) => {
      if (filters?.familyMemberId === 'member-1') {
        return memberOneAuthPage
      }

      return memberTwoAuthPage
    })
  })

  it('keeps preselected authorization and service values on initial render', async () => {
    render(
      <AppointmentForm
        defaultValues={{
          familyMemberId: 'member-1',
          authorizationId: 'auth-1',
          authorizationServiceId: 'service-1',
          appointmentDate: '2026-04-10T14:00:00.000Z',
        }}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(authorizationsService.getAll).toHaveBeenCalledWith({
        familyMemberId: 'member-1',
        status: 'pending',
      })
    })

    const authorizationField = screen.getByText('Autorización (opcional)').closest('div')
    expect(authorizationField).not.toBeNull()
    const authorizationSelect = within(authorizationField!).getByRole('combobox')

    await waitFor(() => {
      expect(within(authorizationSelect).getByText('N° AUTH-001')).toBeInTheDocument()
    })

    expect(screen.getByText('Servicio de la autorización (opcional)')).toBeInTheDocument()
    const serviceField = screen
      .getByText('Servicio de la autorización (opcional)')
      .closest('div')
    expect(serviceField).not.toBeNull()
    const serviceSelect = within(serviceField!).getByRole('combobox')

    expect(
      within(serviceSelect).getByText('890201 — Consulta especializada'),
    ).toBeInTheDocument()
  })

  it('refetches and clears authorization-dependent fields when family member changes', async () => {
    const user = userEvent.setup()

    render(
      <AppointmentForm
        defaultValues={{
          familyMemberId: 'member-1',
          authorizationId: 'auth-1',
          authorizationServiceId: 'service-1',
          appointmentDate: '2026-04-10T14:00:00.000Z',
        }}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
      { wrapper: createWrapper() },
    )

    const familyMemberField = screen.getByText('Miembro de familia *').closest('div')
    expect(familyMemberField).not.toBeNull()
    const familyMemberSelect = within(familyMemberField!).getByRole('combobox')

    await user.click(familyMemberSelect)
    await user.click(await screen.findByText('Maria Gomez'))

    await waitFor(() => {
      expect(authorizationsService.getAll).toHaveBeenCalledWith({
        familyMemberId: 'member-2',
        status: 'pending',
      })
    })

    const authorizationField = screen.getByText('Autorización (opcional)').closest('div')
    expect(authorizationField).not.toBeNull()
    const authorizationSelect = within(authorizationField!).getByRole('combobox')

    await waitFor(() => {
      expect(within(authorizationSelect).queryByText('N° AUTH-001')).not.toBeInTheDocument()
    })

    expect(
      screen.queryByText('Servicio de la autorización (opcional)'),
    ).not.toBeInTheDocument()
  })
})
