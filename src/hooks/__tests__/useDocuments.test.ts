import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import {
  useUploadDocument,
  useUploadDocumentAndCreateAuthorization,
  useOcrStatus,
  useDocumentDownloadUrl,
  getOcrStatusRefetchInterval,
} from '../useDocuments'
import { documentsService } from '@/services/documents.service'

vi.mock('@/services/documents.service', () => ({
  documentsService: {
    uploadAndCreate: vi.fn(),
    upload: vi.fn(),
    getDownloadUrl: vi.fn(),
    getOcrStatus: vi.fn(),
  },
}))

const mockUploadResponse = {
  id: 'doc-1',
  fileName: 'autorizacion.pdf',
  fileSize: 1024,
  mimeType: 'application/pdf',
  authorizationId: 'auth-1',
  ocrStatus: 'pending' as const,
  createdAt: '2026-04-01T00:00:00Z',
}

const mockUploadAndCreateResponse = {
  authorization: {
    id: 'auth-ocr-1',
    familyMemberId: 'member-1',
    epsProviderId: null,
    documentType: 'pendiente_ocr',
    requestNumber: null,
    issuingDate: null,
    expirationDate: null,
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
    priority: 'normal' as const,
    status: 'pending' as const,
    originalFileUrl: null,
    ocrRawText: null,
    ocrConfidence: null,
    ocrParserUsed: null,
    manuallyReviewed: false,
    notes: null,
    services: [],
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
  },
  document: {
    id: 'doc-ocr-1',
    authorizationId: 'auth-ocr-1',
    fileName: 'autorizacion.pdf',
    fileUrl: 'user/auth/file.pdf',
    fileType: 'application/pdf',
    fileSizeBytes: 115688,
    ocrStatus: 'pending' as const,
    ocrErrorMessage: null,
    uploadedAt: '2026-04-01T00:00:00Z',
  },
}

const mockOcrStatus = {
  id: 'doc-1',
  ocrStatus: 'processing' as const,
  ocrText: null,
  ocrCompletedAt: null,
  ocrError: null,
}

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

describe('useUploadDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should upload a document and invalidate authorizations', async () => {
    vi.mocked(documentsService.upload).mockResolvedValue(mockUploadResponse)

    const { wrapper, invalidateQueriesSpy } = createWrapper()
    const { result } = renderHook(() => useUploadDocument(), { wrapper })
    const file = new File(['test'], 'autorizacion.pdf', { type: 'application/pdf' })
    const onUploadProgress = vi.fn()

    await result.current.mutateAsync({
      authorizationId: 'auth-1',
      file,
      onUploadProgress,
    })

    expect(documentsService.upload).toHaveBeenCalledWith('auth-1', file, onUploadProgress)
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['authorizations'] })
  })
})

describe('useUploadDocumentAndCreateAuthorization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should upload a document, create a draft authorization and invalidate authorizations', async () => {
    vi.mocked(documentsService.uploadAndCreate).mockResolvedValue(mockUploadAndCreateResponse)

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useUploadDocumentAndCreateAuthorization(), { wrapper })
    const file = new File(['test'], 'autorizacion.pdf', { type: 'application/pdf' })
    const onUploadProgress = vi.fn()

    await result.current.mutateAsync({
      familyMemberId: 'member-1',
      file,
      onUploadProgress,
    })

    expect(documentsService.uploadAndCreate).toHaveBeenCalledWith('member-1', file, onUploadProgress)
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['authorizations'] })
    expect(queryClient.getQueryData(['authorizations', 'auth-ocr-1'])).toEqual(
      expect.objectContaining({
        id: 'auth-ocr-1',
        documents: [
          expect.objectContaining({
            id: 'doc-ocr-1',
            authorizationId: 'auth-ocr-1',
            fileName: 'autorizacion.pdf',
            fileSize: 115688,
            mimeType: 'application/pdf',
            fileUrl: 'user/auth/file.pdf',
            ocrStatus: 'pending',
          }),
        ],
      }),
    )
  })
})

describe('useDocumentDownloadUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch document download url', async () => {
    vi.mocked(documentsService.getDownloadUrl).mockResolvedValue({
      url: 'https://example.com/document.pdf',
      expiresAt: '2026-04-01T01:00:00Z',
    })

    await expect(useDocumentDownloadUrl('doc-1')).resolves.toEqual({
      url: 'https://example.com/document.pdf',
      expiresAt: '2026-04-01T01:00:00Z',
    })
    expect(documentsService.getDownloadUrl).toHaveBeenCalledWith('doc-1')
  })
})

describe('useOcrStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch OCR status', async () => {
    vi.mocked(documentsService.getOcrStatus).mockResolvedValue(mockOcrStatus)

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useOcrStatus('doc-1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockOcrStatus)
    expect(documentsService.getOcrStatus).toHaveBeenCalledWith('doc-1')
  })

  it('should stop polling when backend reports completed via the normalized status field', () => {
    expect(getOcrStatusRefetchInterval('completed')).toBe(false)
  })

  it('should not fetch when document id is empty', () => {
    const { wrapper } = createWrapper()

    renderHook(() => useOcrStatus(''), { wrapper })

    expect(documentsService.getOcrStatus).not.toHaveBeenCalled()
  })

  it('should keep polling while OCR is still in progress', () => {
    expect(getOcrStatusRefetchInterval('pending')).toBe(3000)
    expect(getOcrStatusRefetchInterval('processing')).toBe(3000)
  })

  it('should stop polling when OCR has finished', () => {
    expect(getOcrStatusRefetchInterval('completed')).toBe(false)
    expect(getOcrStatusRefetchInterval('failed')).toBe(false)
  })
})
