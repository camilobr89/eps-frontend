import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateAuthorizationPage } from '../CreateAuthorizationPage'
import { useCreateAuthorization } from '@/hooks/useAuthorizations'
import { useUploadDocumentAndCreateAuthorization } from '@/hooks/useDocuments'
import { useFamilyMembers } from '@/hooks/useFamilyMembers'

const mockNavigate = vi.fn()
const mockCreateMutateAsync = vi.fn()
const mockUploadMutateAsync = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/hooks/useAuthorizations', () => ({
  useCreateAuthorization: vi.fn(),
}))

vi.mock('@/hooks/useDocuments', () => ({
  useUploadDocumentAndCreateAuthorization: vi.fn(),
}))

vi.mock('@/hooks/useFamilyMembers', () => ({
  useFamilyMembers: vi.fn(),
}))

describe('CreateAuthorizationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useCreateAuthorization).mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateAuthorization>)

    vi.mocked(useUploadDocumentAndCreateAuthorization).mockReturnValue({
      mutateAsync: mockUploadMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useUploadDocumentAndCreateAuthorization>)

    vi.mocked(useFamilyMembers).mockReturnValue({
      data: {
        data: [
          {
            id: 'member-1',
            fullName: 'Juan Perez',
          },
        ],
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useFamilyMembers>)
  })

  it('shows OCR upload mode by default', () => {
    render(<CreateAuthorizationPage />)

    expect(screen.getByText('Crear desde documento')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Desde PDF o imagen' })).toBeInTheDocument()
  })

  it('uploads a document and navigates to the created draft authorization', async () => {
    const user = userEvent.setup()
    mockUploadMutateAsync.mockResolvedValue({
      authorization: { id: 'auth-ocr-1' },
      document: { id: 'doc-1', fileName: 'autorizacion.pdf', ocrStatus: 'pending' },
    })

    render(<CreateAuthorizationPage />)

    const familyMemberField = screen.getByText('Miembro de familia *').closest('div')
    expect(familyMemberField).not.toBeNull()

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByText('Juan Perez'))

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['pdf'], 'autorizacion.pdf', { type: 'application/pdf' })

    fireEvent.change(input, { target: { files: [file] } })

    await user.click(screen.getByRole('button', { name: 'Subir documento' }))

    await waitFor(() => {
      expect(mockUploadMutateAsync).toHaveBeenCalledWith({
        familyMemberId: 'member-1',
        file,
        onUploadProgress: expect.any(Function),
      })
    })

    expect(mockNavigate).toHaveBeenCalledWith('/authorizations/auth-ocr-1')
  })
})
