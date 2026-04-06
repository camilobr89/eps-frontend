import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OcrReviewPanel } from '../OcrReviewPanel'
import { useUpdateAuthorization } from '@/hooks/useAuthorizations'
import type { Authorization } from '@/types'

vi.mock('@/hooks/useAuthorizations', () => ({
  useUpdateAuthorization: vi.fn(),
}))

const mockMutateAsync = vi.fn()

const mockAuthorization = {
  id: 'auth-1',
  familyMemberId: 'member-1',
  epsProviderId: null,
  documentType: 'Carta de Autorizacion',
  requestNumber: 'AUTH-001',
  issuingDate: null,
  expirationDate: null,
  diagnosisCode: 'A09',
  diagnosisDescription: 'Texto OCR',
  patientLocation: null,
  serviceOrigin: null,
  providerName: 'Clinica Central',
  providerNit: '900123456',
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
  ocrRawText: 'Texto extraido',
  ocrConfidence: 87,
  ocrParserUsed: 'tesseract',
  manuallyReviewed: false,
  notes: null,
  services: [],
  documents: [],
  createdAt: '2026-04-01T00:00:00Z',
  updatedAt: '2026-04-01T00:00:00Z',
} satisfies Authorization

describe('OcrReviewPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useUpdateAuthorization).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateAuthorization>)
  })

  it('renders OCR fields and confidence', () => {
    render(<OcrReviewPanel authorization={mockAuthorization} />)

    expect(screen.getByText('Revisión OCR')).toBeInTheDocument()
    expect(screen.getByText('Tipo de documento')).toBeInTheDocument()
    expect(screen.getAllByText('87%').length).toBeGreaterThan(0)
  })

  it('sends corrected values on save', async () => {
    const user = userEvent.setup()
    mockMutateAsync.mockResolvedValue(undefined)

    render(<OcrReviewPanel authorization={mockAuthorization} />)

    await user.click(screen.getAllByRole('button', { name: 'Editar' })[0]!)
    const input = screen.getByDisplayValue('Carta de Autorizacion')
    await user.clear(input)
    await user.type(input, 'Orden Médica')
    await user.click(screen.getByLabelText('Marcar como revisado manualmente'))
    await user.click(screen.getByRole('button', { name: 'Aplicar correcciones' }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 'auth-1',
        data: expect.objectContaining({
          documentType: 'Orden Médica',
          manuallyReviewed: true,
        }),
      })
    })
  })
})
