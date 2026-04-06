import api from './api'
import type { Authorization, DocumentOcrStatus } from '@/types'

export interface DocumentUploadResponse {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  authorizationId: string
  ocrStatus: DocumentOcrStatus
  createdAt: string
}

export interface DocumentDownloadResponse {
  url: string
  expiresAt: string
}

export interface UploadAndCreateAuthorizationResponse {
  authorization: Authorization
  document: {
    id: string
    authorizationId: string
    fileName: string
    fileUrl: string
    fileType: string
    fileSizeBytes: number
    ocrStatus: DocumentOcrStatus
    ocrErrorMessage: string | null
    uploadedAt: string
  }
}

export interface OcrStatusResponse {
  id?: string
  ocrStatus: DocumentOcrStatus
  ocrText: string | null
  ocrCompletedAt: string | null
  ocrError: string | null
}

interface OcrStatusApiResponse {
  id?: string
  status?: DocumentOcrStatus
  ocrStatus?: DocumentOcrStatus
  ocrText?: string | null
  ocrCompletedAt?: string | null
  ocrError?: string | null
  ocrErrorMessage?: string | null
}

export const documentsService = {
  async uploadAndCreate(
    familyMemberId: string,
    file: File,
    onUploadProgress?: (progress: number) => void,
  ): Promise<UploadAndCreateAuthorizationResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('familyMemberId', familyMemberId)

    const response = await api.post<UploadAndCreateAuthorizationResponse>(
      '/documents/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total && onUploadProgress) {
            onUploadProgress(Math.round((event.loaded * 100) / event.total))
          }
        },
      },
    )

    return response.data
  },

  async upload(
    authorizationId: string,
    file: File,
    onUploadProgress?: (progress: number) => void,
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<DocumentUploadResponse>(
      `/authorizations/${authorizationId}/upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total && onUploadProgress) {
            onUploadProgress(Math.round((event.loaded * 100) / event.total))
          }
        },
      },
    )
    return response.data
  },

  async getDownloadUrl(documentId: string): Promise<DocumentDownloadResponse> {
    const response = await api.get<DocumentDownloadResponse>(
      `/documents/${documentId}/download`,
    )
    return response.data
  },

  async getOcrStatus(documentId: string): Promise<OcrStatusResponse> {
    const response = await api.get<OcrStatusApiResponse>(
      `/documents/${documentId}/ocr-status`,
    )
    return {
      id: response.data.id,
      ocrStatus: response.data.ocrStatus ?? response.data.status ?? 'pending',
      ocrText: response.data.ocrText ?? null,
      ocrCompletedAt: response.data.ocrCompletedAt ?? null,
      ocrError: response.data.ocrError ?? response.data.ocrErrorMessage ?? null,
    }
  },
}
