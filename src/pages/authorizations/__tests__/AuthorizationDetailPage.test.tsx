import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { AuthorizationDetailPage } from '../AuthorizationDetailPage'
import {
  useAuthorization,
  useDeleteAuthorization,
} from '@/hooks/useAuthorizations'
import {
  useDocumentDownloadUrl,
  useOcrStatus,
  useUploadDocument,
} from '@/hooks/useDocuments'
import type { Authorization } from '@/types'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'auth-1' }),
  }
})

vi.mock('@/hooks/useAuthorizations', () => ({
  useAuthorization: vi.fn(),
  useDeleteAuthorization: vi.fn(),
}))

vi.mock('@/hooks/useDocuments', () => ({
  useUploadDocument: vi.fn(),
  useOcrStatus: vi.fn(),
  useDocumentDownloadUrl: vi.fn(),
}))

vi.mock('@/components/shared/OcrReviewPanel', () => ({
  OcrReviewPanel: () => <div>OCR review panel</div>,
}))

const openSpy = vi.fn()

const mockAuthorization = {
  id: 'auth-1',
  familyMemberId: 'member-1',
  epsProviderId: null,
  documentType: 'Carta de autorización',
  requestNumber: 'AUTH-001',
  issuingDate: '2026-04-01',
  expirationDate: '2026-04-30',
  diagnosisCode: null,
  diagnosisDescription: null,
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
  ocrRawText: 'Texto extraído',
  ocrConfidence: 92,
  ocrParserUsed: 'tesseract',
  manuallyReviewed: false,
  notes: null,
  services: [],
  documents: [
    {
      id: 'doc-1',
      authorizationId: 'auth-1',
      fileName: 'autorizacion.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
      fileUrl: null,
      ocrStatus: 'processing',
      ocrError: null,
      ocrCompletedAt: null,
      createdAt: '2026-04-01T00:00:00Z',
    },
  ],
  familyMember: {
    id: 'member-1',
    userId: 'user-1',
    epsProviderId: 'eps-1',
    fullName: 'Juan Pérez',
    documentType: 'CC',
    documentNumber: '123456789',
    birthDate: '1990-01-01',
    address: null,
    phone: null,
    cellphone: null,
    email: null,
    department: null,
    city: null,
    regime: null,
    relationship: 'Titular',
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
  },
  createdAt: '2026-04-01T00:00:00Z',
  updatedAt: '2026-04-01T00:00:00Z',
} satisfies Authorization

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)

  return { wrapper, invalidateQueriesSpy }
}

describe('AuthorizationDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('open', openSpy)

    vi.mocked(useAuthorization).mockReturnValue({
      data: mockAuthorization,
      isLoading: false,
    } as unknown as ReturnType<typeof useAuthorization>)

    vi.mocked(useDeleteAuthorization).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteAuthorization>)

    vi.mocked(useUploadDocument).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUploadDocument>)

    vi.mocked(useOcrStatus).mockReturnValue({
      data: {
        id: 'doc-1',
        ocrStatus: 'completed',
        ocrText: 'Texto extraído',
        ocrCompletedAt: '2026-04-01T00:05:00Z',
        ocrError: null,
      },
    } as unknown as ReturnType<typeof useOcrStatus>)

    vi.mocked(useDocumentDownloadUrl).mockResolvedValue({
      url: 'https://example.com/autorizacion.pdf',
      expiresAt: '2026-04-01T01:00:00Z',
    })
  })

  it('shows uploaded documents and invalidates authorization data when OCR completes', async () => {
    const { wrapper, invalidateQueriesSpy } = createWrapper()

    render(<AuthorizationDetailPage />, { wrapper })

    expect(screen.getByText('Documentos')).toBeInTheDocument()
    expect(screen.getByText('autorizacion.pdf')).toBeInTheDocument()
    expect(screen.getByText('OCR completado')).toBeInTheDocument()

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['authorizations', 'auth-1'],
      })
    })

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['authorizations'] })
  })

  it('opens a signed download URL in a new tab', async () => {
    const user = userEvent.setup()
    const { wrapper } = createWrapper()

    render(<AuthorizationDetailPage />, { wrapper })

    await user.click(screen.getByRole('button', { name: 'Descargar' }))

    await waitFor(() => {
      expect(useDocumentDownloadUrl).toHaveBeenCalledWith('doc-1')
    })

    expect(openSpy).toHaveBeenCalledWith(
      'https://example.com/autorizacion.pdf',
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('shows an OCR pending notice for draft authorizations created from document upload', () => {
    const { wrapper } = createWrapper()

    vi.mocked(useAuthorization).mockReturnValue({
      data: {
        ...mockAuthorization,
        documentType: 'pendiente_ocr',
        ocrRawText: null,
        ocrConfidence: null,
        ocrParserUsed: null,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useAuthorization>)

    vi.mocked(useOcrStatus).mockReturnValue({
      data: {
        id: 'doc-1',
        ocrStatus: 'pending',
        ocrText: null,
        ocrCompletedAt: null,
        ocrError: null,
      },
    } as unknown as ReturnType<typeof useOcrStatus>)

    render(<AuthorizationDetailPage />, { wrapper })

    expect(
      screen.getByText(/no necesitas volver a subir el archivo/i),
    ).toBeInTheDocument()
  })

  it('does not break hook order when the authorization loads after an initial loading state', async () => {
    const { wrapper } = createWrapper()
    let currentResult = {
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useAuthorization>

    vi.mocked(useAuthorization).mockImplementation(() => currentResult)

    const { rerender } = render(<AuthorizationDetailPage />, { wrapper })

    expect(document.querySelector('svg.animate-spin')).not.toBeNull()

    currentResult = {
      data: mockAuthorization,
      isLoading: false,
    } as unknown as ReturnType<typeof useAuthorization>

    rerender(<AuthorizationDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Documentos')).toBeInTheDocument()
    })
  })
})
