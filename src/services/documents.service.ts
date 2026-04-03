import api from './api'

export interface DocumentUploadResponse {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  authorizationId: string
  ocrStatus: string
  createdAt: string
}

export interface OcrStatusResponse {
  id: string
  ocrStatus: 'pending' | 'processing' | 'completed' | 'failed'
  ocrText: string | null
  ocrCompletedAt: string | null
  ocrError: string | null
}

export const documentsService = {
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

  async getDownloadUrl(documentId: string): Promise<string> {
    const response = await api.get<{ url: string }>(
      `/documents/${documentId}/download`,
    )
    return response.data.url
  },

  async getOcrStatus(documentId: string): Promise<OcrStatusResponse> {
    const response = await api.get<OcrStatusResponse>(
      `/documents/${documentId}/ocr-status`,
    )
    return response.data
  },
}
