import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { documentsService } from '@/services/documents.service'
import type { Authorization, AuthorizationDocument, DocumentOcrStatus } from '@/types'

const AUTHORIZATIONS_KEY = 'authorizations'
const OCR_STATUS_KEY = 'document-ocr-status'

interface UploadDocumentParams {
  authorizationId: string
  file: File
  onUploadProgress?: (progress: number) => void
}

interface UploadAndCreateParams {
  familyMemberId: string
  file: File
  onUploadProgress?: (progress: number) => void
}

export function useUploadDocumentAndCreateAuthorization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ familyMemberId, file, onUploadProgress }: UploadAndCreateParams) =>
      documentsService.uploadAndCreate(familyMemberId, file, onUploadProgress),
    onSuccess: (result) => {
      const createdDocument: AuthorizationDocument = {
        id: result.document.id,
        authorizationId: result.authorization.id,
        fileName: result.document.fileName,
        fileSize: result.document.fileSizeBytes,
        mimeType: result.document.fileType,
        fileUrl: result.document.fileUrl,
        ocrStatus: result.document.ocrStatus,
        ocrError: result.document.ocrErrorMessage,
        ocrCompletedAt: null,
        createdAt: result.document.uploadedAt,
      }

      queryClient.setQueryData<Authorization>(
        [AUTHORIZATIONS_KEY, result.authorization.id],
        (current) => {
          const existingDocuments = current?.documents ?? result.authorization.documents ?? []
          const nextDocuments = [createdDocument, ...existingDocuments].filter(
            (document, index, array) =>
              array.findIndex((candidate) => candidate.id === document.id) === index,
          )

          return {
            ...result.authorization,
            ...current,
            documents: nextDocuments,
          }
        },
      )
      queryClient.invalidateQueries({ queryKey: [AUTHORIZATIONS_KEY] })
    },
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ authorizationId, file, onUploadProgress }: UploadDocumentParams) =>
      documentsService.upload(authorizationId, file, onUploadProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTHORIZATIONS_KEY] })
    },
  })
}

export async function useDocumentDownloadUrl(documentId: string) {
  return documentsService.getDownloadUrl(documentId)
}

export function getOcrStatusRefetchInterval(status?: DocumentOcrStatus) {
  if (status === 'completed' || status === 'failed') {
    return false
  }

  return 3000
}

export function useOcrStatus(documentId: string) {
  return useQuery({
    queryKey: [OCR_STATUS_KEY, documentId],
    queryFn: () => documentsService.getOcrStatus(documentId),
    enabled: !!documentId,
    refetchInterval: (query) => getOcrStatusRefetchInterval(query.state.data?.ocrStatus),
  })
}
